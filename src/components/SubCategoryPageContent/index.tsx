'use client';

import React from 'react';
import * as qs from 'qs';
import Link from 'next/link';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { getAllCatalogs } from '@homeberris/http/catalogApi';
import { getMenuTree } from '@homeberris/http/categoryApi';
import { getBrandsBySubCategory } from '@homeberris/http/brandApi';
import { CatalogItem } from '@homeberris/types/catalog';
import { CategoryItem, SubCategoryItem } from '@homeberris/types/category';
import { BrandItem } from '@homeberris/types/brand';
import { ListResult } from '@homeberris/types/filter';

import CatalogCard from '@homeberris/components/CatalogCard';
import { PaginationLeft, PaginationRight, ChevronSepIcon } from '@homeberris/assets/icons/catalog';

import catalogStyles from '@homeberris/pages/catalog/index.module.css';
import paginationStyles from '@homeberris/pages/catalog/[category]/index.module.css';

const getLoc = (val: any, locale = 'ru'): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[locale] || val.ru || val.en || '';
};

interface SubCategoryPageContentProps {
  subCategoryUuid: string | null;
  subCategoryName: string;
  categoryName: string;
  subCategoryData: SubCategoryItem | null;
  categoryData: CategoryItem | null;
}

const ITEMS_PER_PAGE = 12;

export default function SubCategoryPageContent({
  subCategoryUuid,
  subCategoryName,
  categoryName,
}: SubCategoryPageContentProps) {
  const router = useRouter();
  const params = useParams();
  const { t, i18n } = useTranslation('common');
  const locale = i18n.language || 'ru';

  const decodedCategory = typeof params?.category === 'string' ? decodeURIComponent(params.category) : categoryName;
  const categoryPath = decodedCategory ? `/catalog/${encodeURIComponent(decodedCategory)}` : '/catalog';

  const { data: menuTree } = useQuery<CategoryItem[]>({
    queryKey: ['getMenuTree'],
    queryFn: getMenuTree,
  });

  const localizedCategoryName = React.useMemo(() => {
    if (!menuTree) return categoryName;
    const cat = menuTree.find(
      (c: CategoryItem) => getLoc(c.name, 'en') === decodedCategory || getLoc(c.name, 'ru') === decodedCategory
    );
    return cat ? getLoc(cat.name, locale) : categoryName;
  }, [menuTree, decodedCategory, locale, categoryName]);

  const localizedSubCategoryName = React.useMemo(() => {
    if (!menuTree) return subCategoryName;
    const cat = menuTree.find(
      (c: CategoryItem) => getLoc(c.name, 'en') === decodedCategory || getLoc(c.name, 'ru') === decodedCategory
    );
    if (!cat?.subCategories) return subCategoryName;
    const sub = cat.subCategories.find(
      (s: any) => getLoc(s.name, 'en') === subCategoryName || getLoc(s.name, 'ru') === subCategoryName
    );
    return sub ? getLoc(sub.name, locale) : subCategoryName;
  }, [menuTree, decodedCategory, subCategoryName, locale]);

  const [sortBy, setSortBy] = React.useState('newest');
  const [selectedBrand, setSelectedBrand] = React.useState('');
  const [minPrice, setMinPrice] = React.useState('');
  const [maxPrice, setMaxPrice] = React.useState('');
  const [debouncedMin, setDebouncedMin] = React.useState('');
  const [debouncedMax, setDebouncedMax] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedMin(minPrice), 300);
    return () => clearTimeout(id);
  }, [minPrice]);

  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedMax(maxPrice), 300);
    return () => clearTimeout(id);
  }, [maxPrice]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, selectedBrand, debouncedMin, debouncedMax]);

  const buildQuery = () => {
    const filters: any = {
      includeMeta: [
        {
          association: 'category',
          where: { name: categoryName },
        },
        {
          association: 'subCategorie',
          where: subCategoryUuid ? { uuid: subCategoryUuid } : { name: subCategoryName },
        },
        { association: 'brand' },
      ],
      queryMeta: {
        paginate: true,
        limit: ITEMS_PER_PAGE,
        page: currentPage,
      },
      filterMeta: {} as any,
    };

    if (selectedBrand) filters.filterMeta.brandUuid = { eq: selectedBrand };
    if (debouncedMin || debouncedMax) {
      filters.filterMeta.priceRange = {
        ...(debouncedMin ? { gte: debouncedMin } : {}),
        ...(debouncedMax ? { lte: debouncedMax } : {}),
      };
    }

    if (sortBy === 'price_asc') filters.queryMeta.order = { price: 'ASC' };
    else if (sortBy === 'price_desc') filters.queryMeta.order = { price: 'DESC' };
    else if (sortBy === 'newest') filters.queryMeta.order = { createdAt: 'DESC' };

    return qs.stringify(filters);
  };

  const { data: catalogs } = useQuery<{ data: CatalogItem[]; meta: ListResult }>({
    queryKey: [
      'getAllCatalogsBySubCategory',
      categoryName,
      subCategoryName,
      subCategoryUuid,
      sortBy,
      selectedBrand,
      debouncedMin,
      debouncedMax,
      currentPage,
    ],
    queryFn: () => getAllCatalogs(buildQuery()),
    enabled: !!categoryName && !!subCategoryName,
  });

  const { data: brandsData } = useQuery({
    queryKey: ['getBrandsBySubCategory', subCategoryUuid],
    queryFn: () => getBrandsBySubCategory(subCategoryUuid || ''),
    enabled: !!subCategoryUuid,
    retry: false,
  });

  const brandsFromCatalogs = React.useMemo(() => {
    if (!catalogs?.data) return [];
    const map = new Map<string, BrandItem>();
    catalogs.data.forEach((c: CatalogItem) => {
      if (c.brand?.uuid && !map.has(c.brand.uuid)) map.set(c.brand.uuid, c.brand);
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [catalogs?.data]);

  const brands: BrandItem[] = React.useMemo(() => {
    if (brandsData?.data && brandsData.data.length > 0) return brandsData.data;
    return brandsFromCatalogs;
  }, [brandsData?.data, brandsFromCatalogs]);

  const totalPages = catalogs?.meta
    ? Math.max(1, Math.ceil(catalogs.meta.count / ITEMS_PER_PAGE))
    : 0;

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages: (number | string)[] = [];
    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end =
        currentPage <= 2
          ? Math.min(totalPages - 1, 3)
          : Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return (
      <div className={paginationStyles.pagination}>
        <button
          className={paginationStyles.pageBtn}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          <PaginationLeft />
        </button>
        {pages.map((page, i) =>
          page === '...' ? (
            <span key={`dots-${i}`} className={paginationStyles.pageDots}>
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`${paginationStyles.pageBtn} ${
                currentPage === page ? paginationStyles.pageBtnActive : ''
              }`}
              onClick={() => setCurrentPage(page as number)}
            >
              {page}
            </button>
          )
        )}
        <button
          className={paginationStyles.pageBtn}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          <PaginationRight />
        </button>
      </div>
    );
  };

  return (
    <div className={catalogStyles.body}>
      {/* Breadcrumb */}
      <nav className={catalogStyles.breadcrumb} aria-label="breadcrumb">
        <Link href="/" className={catalogStyles.breadcrumbLink}>
          {t('catalogAll.breadcrumb.home')}
        </Link>
        <ChevronSepIcon className={catalogStyles.breadcrumbSep} />
        <Link href="/catalog" className={catalogStyles.breadcrumbLink}>
          {t('catalogAll.breadcrumb.catalog')}
        </Link>
        <ChevronSepIcon className={catalogStyles.breadcrumbSep} />
        <Link href={categoryPath} className={catalogStyles.breadcrumbLink}>
          {localizedCategoryName}
        </Link>
        <ChevronSepIcon className={catalogStyles.breadcrumbSep} />
        <span className={catalogStyles.breadcrumbCurrent}>{localizedSubCategoryName}</span>
      </nav>

      {/* Filter bar */}
      <div className={catalogStyles.filterBar}>
        <span className={catalogStyles.filterCount}>
          {catalogs?.meta?.count || 0} товаров
        </span>

        <select
          className={catalogStyles.filterSelect}
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
        >
          <option value="">Все бренды</option>
          {brands.map((b: BrandItem) => (
            <option key={b.uuid} value={b.uuid}>
              {b.name}
            </option>
          ))}
        </select>

        <div className={catalogStyles.priceRange}>
          <input
            className={catalogStyles.filterInput}
            type="number"
            placeholder="От"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <span className={catalogStyles.priceSep}>—</span>
          <input
            className={catalogStyles.filterInput}
            type="number"
            placeholder="До"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        <select
          className={catalogStyles.filterSelect}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Новинки</option>
          <option value="price_asc">Цена: по возрастанию</option>
          <option value="price_desc">Цена: по убыванию</option>
        </select>

        {(selectedBrand || minPrice || maxPrice) && (
          <button
            className={catalogStyles.resetBtn}
            onClick={() => {
              setSelectedBrand('');
              setMinPrice('');
              setMaxPrice('');
              setDebouncedMin('');
              setDebouncedMax('');
            }}
          >
            Сбросить
          </button>
        )}
      </div>

      {/* Product grid */}
      {!catalogs?.data || catalogs.data.length === 0 ? (
        <div className={catalogStyles.emptyBox}>
          <p className={catalogStyles.emptyText}>В этой подкатегории пока нет товаров</p>
        </div>
      ) : (
        <div className={catalogStyles.container}>
          {catalogs.data.map((catalog: CatalogItem) => (
            <div key={catalog.uuid} className={catalogStyles.cardWrap}>
              <CatalogCard
                catalog={catalog}
                onNavigate={() =>
                  router.push(`/catalog/${encodeURIComponent(getLoc((catalog as any).category?.name, 'en') || categoryName)}/${encodeURIComponent(getLoc((catalog as any).subCategorie?.name, 'en') || subCategoryName)}/${catalog.uuid}`)
                }
              />
            </div>
          ))}
        </div>
      )}

      {renderPagination()}
    </div>
  );
}
