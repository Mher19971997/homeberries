'use client';

import React from "react";
import * as qs from "qs";
import Link from "next/link";
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { ChevronSepIcon, PaginationLeft, PaginationRight, filteration as FilterIcon } from "@homeberris/assets/icons/catalog";
import { useParams } from "next/navigation";

import { getAllCatalogs } from "@homeberris/http/catalogApi";
import { getMenuTree } from "@homeberris/http/categoryApi";
import { getBrandsByCategory } from "@homeberris/http/brandApi";
import { getCatalogUuidsByOptionValues } from "@homeberris/http/groupOptionApi";
import { CatalogItem } from "@homeberris/types/catalog";
import { CategoryItem } from "@homeberris/types/category";

import SidebarFilters from "@homeberris/components/SidebarFilters";
import StaticProductCard from "@homeberris/components/StaticProductCard";
import MobileFilterDrawer from "@homeberris/components/MobileFilterDrawer";
import Spinner from "@homeberris/components/Spinner";
import Breadcrumb from "@homeberris/components/Breadcrumb";

import { useQuery } from "@tanstack/react-query";
import { ListResult } from "@homeberris/types/filter";

import styles from "@homeberris/app/[locale]/catalog/[category]/index.module.css";
import { useTranslation } from "react-i18next";

const getLoc = (val: any, locale: string): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[locale] || val.ru || '';
};

const ITEMS_PER_PAGE = 9;

export default function CatalogPage() {
  const router = useRouter();
  const params = useParams();
  const category = params?.category;
  const categoryName =
    typeof category === "string" ? decodeURIComponent(category) : "";
  const breadcrumbPath = categoryName
    ? `/catalog/${encodeURIComponent(categoryName)}`
    : "/catalog";

  const { t } = useTranslation('common');
  const locale = (params?.locale as string) || 'ru';

  const [showDrawer, setShowDrawer] = React.useState(false);
  const [sortBy, setSortBy] = React.useState("rating");
  const [priceRange, setPriceRange] = React.useState<{
    min: number;
    max: number;
  } | null>(null);
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>([]);
  const [groupFilters, setGroupFilters] = React.useState<Record<string, string[]>>({});
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, priceRange, selectedBrands, groupFilters]);

  const { data: menuTree } = useQuery({
    queryKey: ["getMenuTree"],
    queryFn: getMenuTree,
  });
  const categoryData = (menuTree || []).find(
    (c: CategoryItem) => getLoc(c.name, 'en') === categoryName || getLoc(c.name, locale) === categoryName,
  );
  const categoryUuid = categoryData?.uuid;

  const { data: brandsData } = useQuery({
    queryKey: ["getBrandsByCategory", categoryUuid],
    queryFn: () => getBrandsByCategory(categoryUuid || ""),
    enabled: !!categoryUuid,
  });
  const brands = brandsData?.data || [];

  const allSelectedValues = Object.values(groupFilters).flat().filter(Boolean);
  const hasGroupFilters = allSelectedValues.length > 0;

  const { data: matchingCatalogUuids } = useQuery({
    queryKey: ["groupOptionCatalogUuids", allSelectedValues, categoryUuid],
    queryFn: () => getCatalogUuidsByOptionValues(allSelectedValues, categoryUuid || ''),
    enabled: hasGroupFilters && !!categoryUuid,
  });

  const buildQuery = (catUuid?: string) => {
    const filters: any = {
      includeMeta: [
        { association: "category" },
        { association: "brand" },
        { association: "groupOption", include: [{ association: "options" }] },
      ],
      queryMeta: { paginate: true, limit: ITEMS_PER_PAGE, page: currentPage },
    };
    const catFilter = catUuid ? { categoryUuid: catUuid } : { categoryUuid: { like: "%" } };
    let baseMeta: any = catFilter;
    if (selectedBrands.length > 0) baseMeta = { ...baseMeta, brandUuid: { in: selectedBrands } };
    if (hasGroupFilters && matchingCatalogUuids?.length) baseMeta = { ...baseMeta, uuid: { in: matchingCatalogUuids } };
    filters.filterMeta = baseMeta;
    if (priceRange)
      filters.where = { price: { $gte: priceRange.min, $lte: priceRange.max } };
    if (sortBy === "price_asc") filters.queryMeta.order = { price: "ASC" };
    else if (sortBy === "price_desc") filters.queryMeta.order = { price: "DESC" };
    else if (sortBy === "newest") filters.queryMeta.order = { createdAt: "DESC" };
    return qs.stringify(filters);
  };

  const { data: catalogs, isLoading: isCatalogsLoading } = useQuery<{
    data: CatalogItem[];
    meta: ListResult;
  }>({
    queryKey: [
      "getAllCatalogsByCategory",
      categoryUuid,
      categoryName,
      sortBy,
      priceRange,
      selectedBrands,
      matchingCatalogUuids,
      currentPage,
    ],
    queryFn: () => getAllCatalogs(buildQuery(categoryUuid)),
    enabled: !!categoryName && !!categoryUuid && (!hasGroupFilters || (matchingCatalogUuids !== undefined && matchingCatalogUuids.length > 0)),
  });

  const totalPages = catalogs?.meta
    ? Math.max(1, Math.ceil(catalogs.meta.count / ITEMS_PER_PAGE))
    : 0;

  return (
    <div className={styles.body}>
      <MobileFilterDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        brands={brands}
        selectedBrands={selectedBrands}
        priceRange={priceRange}
        catalogs={catalogs?.data || []}
        initialGroupFilters={groupFilters}
        onApply={(brands, price, gf) => {
          setSelectedBrands(brands);
          setPriceRange(price);
          setGroupFilters(gf);
        }}
      />
      <Breadcrumb items={[
        { label: t('catalogAll.breadcrumb.home'), href: '/' },
        { label: t('catalogAll.breadcrumb.catalog'), href: '/catalog' },
        { label: categoryData ? getLoc(categoryData.name, locale) : categoryName },
      ]} />

      {/* Layout */}
      <div className={styles.pageLayout}>
        {/* Левый сайдбар */}
        <div className={styles.sidebar}>
          <SidebarFilters
            brands={brands}
            selectedBrands={selectedBrands}
            onBrandsChange={setSelectedBrands}
            categoryName={categoryName}
            categoryUuid={categoryUuid}
            catalogs={catalogs?.data || []}
            onFiltersChange={setGroupFilters}
          />
        </div>

        {/* Правая часть */}
        <div className={styles.content}>
          {/* Шапка */}
          <div className={styles.contentHeader}>
            <button
              className={styles.filterToggleBtn}
              onClick={() => setShowDrawer(true)}
            >
              <FilterIcon />
              {t('catalogAll.filters.title')}
            </button>
            <p className={styles.selectedCount}>
              {t('catalogAll.filters.selectedProducts')}: <strong>{catalogs?.meta?.count || 0}</strong>
            </p>
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="rating">{t('catalogAll.sort.rating')}</option>
              <option value="popularity">{t('catalogAll.sort.popularity')}</option>
              <option value="price_asc">{t('catalogAll.sort.priceAsc')}</option>
              <option value="price_desc">{t('catalogAll.sort.priceDesc')}</option>
              <option value="newest">{t('catalogAll.sort.newest')}</option>
            </select>
          </div>

          {/* Грид товаров */}
          <div className={styles.productTotal}>
            <p>{t('catalogAll.products.result')} : <span>{catalogs?.meta?.count ?? 0}</span></p>
          </div>
          <div style={{ position: 'relative', minHeight: '600px' }}>
            {isCatalogsLoading && <Spinner overlay />}
            <div style={{ opacity: isCatalogsLoading ? 0.4 : 1, transition: 'opacity 0.2s' }}>
              <StaticProductCard
                catalogs={catalogs?.data || []}
                onNavigate={(item) => {
                  const cat = getLoc((item as any).category?.name, 'en') || categoryName;
                  const sub = getLoc((item as any).subCategorie?.name, 'en');
                  const url = sub
                    ? `/catalog/${encodeURIComponent(cat)}/${encodeURIComponent(sub)}/${item.uuid}`
                    : `/catalog/${encodeURIComponent(cat)}/${item.uuid}`;
                  router.push(url);
                }}
              />
            </div>
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <PaginationLeft />
              </button>

              {(() => {
                const pages: (number | string)[] = [];
                if (totalPages <= 4) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (currentPage > 3) pages.push("...");
                  const start = Math.max(2, currentPage - 1);
                  const end = currentPage <= 2
                    ? Math.min(totalPages - 1, 3)
                    : Math.min(totalPages - 1, currentPage + 1);
                  for (let i = start; i <= end; i++) pages.push(i);
                  if (currentPage < totalPages - 2) pages.push("...");
                  pages.push(totalPages);
                }
                return pages.map((page, i) =>
                  page === "..." ? (
                    <span key={`dots-${i}`} className={styles.pageDots}>
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ""}`}
                      onClick={() => setCurrentPage(page as number)}
                    >
                      {page}
                    </button>
                  ),
                );
              })()}

              <button
                className={styles.pageBtn}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                <PaginationRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
