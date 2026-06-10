'use client';

import { useState } from 'react';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { PaginationLeft, PaginationRight } from '@homeberris/assets/icons/catalog';
import * as qs from 'qs';
import { getAllCatalogs } from '@homeberris/http/catalogApi';
import styles from '@homeberris/pages/index.module.css';
import { CatalogItem } from '@homeberris/types/catalog';
import CarouselCatalog from '@homeberris/components/CarouselCatalog';
import { useQuery } from '@tanstack/react-query';
import { CategoryItem, SubCategoryItem } from '@homeberris/types/category';
import { useTranslation } from 'react-i18next';
import SmallerBanners from '@homeberris/components/SmallerBanners';
import BrowseByCategory from '@homeberris/components/BrowseByCategory';
import ProductGridBanners from '@homeberris/components/ProductGridBanners';
import CatalogCard from '@homeberris/components/CatalogCard';
import BigSummerSale from '@homeberris/components/BigSummerSale';

const ITEMS_LIMIT = 8;
const DISCOUNT_LIMIT = 4;

import paginationStyles from '@homeberris/pages/catalog/[category]/index.module.css';

const renderPagination = (currentPage: number, totalPages: number, setPage: (p: number) => void) => {
  if (totalPages <= 1) return null;
  const pages: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }
  return (
    <div className={paginationStyles.pagination}>
      <button className={paginationStyles.pageBtn} onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
        <PaginationLeft />
      </button>
      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`dots-${i}`} className={paginationStyles.pageDots}>...</span>
        ) : (
          <button
            key={page}
            className={`${paginationStyles.pageBtn} ${currentPage === page ? paginationStyles.pageBtnActive : ''}`}
            onClick={() => setPage(page as number)}
          >
            {page}
          </button>
        )
      )}
      <button className={paginationStyles.pageBtn} onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
        <PaginationRight />
      </button>
    </div>
  );
};

const buildCatalogUrl = (catalog: CatalogItem) => {
  const cat = (catalog as any).category?.name;
  const sub = (catalog as any).subCategorie?.name;
  const uuid = catalog.uuid;
  if (cat && sub) return `/catalog/${encodeURIComponent(cat)}/${encodeURIComponent(sub)}/${uuid}`;
  if (cat) return `/catalog/${encodeURIComponent(cat)}/${uuid}`;
  return `/catalog`;
};

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategoryItem | null>(null);

  const [activeTab, setActiveTab] = useState<'new' | 'bestseller' | 'featured'>('new');
  const [newPage, setNewPage] = useState(1);
  const [discountPage, setDiscountPage] = useState(1);

  const buildQuery = () => {
    const filters: any = {
      queryMeta: { paginate: true, limit: ITEMS_LIMIT, page: newPage },
    };

    if (activeTab === 'featured') {
      filters.filterMeta = { isFeatured: true };
    }

    if (selectedCategory) {
      filters.includeMeta = [
        { association: 'category', where: { uuid: selectedCategory.uuid } },
      ];
    }

    if (selectedSubCategory) {
      if (!filters.includeMeta) filters.includeMeta = [];
      filters.includeMeta.push({
        association: 'subCategorie',
        where: { uuid: selectedSubCategory.uuid },
      });
    }

    return qs.stringify(filters);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['getAllCatalogs', selectedCategory?.uuid, selectedSubCategory?.uuid, newPage, activeTab],
    queryFn: () => getAllCatalogs(buildQuery()),
  });

  const { data: discountData, isLoading: isDiscountLoading } = useQuery({
    queryKey: ['getDiscountCatalogs', discountPage],
    queryFn: () => getAllCatalogs(qs.stringify({ filterMeta: { isDiscount: true }, queryMeta: { paginate: true, limit: DISCOUNT_LIMIT, page: discountPage } })),
  });

  const catalogs: CatalogItem[] = data?.data || [];
  const discountCatalogs: CatalogItem[] = discountData?.data || [];
  const newTotalPages = data?.meta ? Math.max(1, Math.ceil(data.meta.count / ITEMS_LIMIT)) : 1;
  const discountTotalPages = discountData?.meta ? Math.max(1, Math.ceil(discountData.meta.count / DISCOUNT_LIMIT)) : 1;

  return (
    <div className={styles.body}>
      <CarouselCatalog />
      <SmallerBanners />
      <BrowseByCategory />
      <div
        style={{
          display: 'flex',
          gap: '32px',
          maxWidth: '1120px',
          height: '32px',
          margin: '56px auto 32px auto',
          padding: '0 16px',
        }}
      >
        <span
          onClick={() => setActiveTab('new')}
          className={styles.tabItem}
          style={{
            cursor:'pointer',
            color: activeTab === 'new' ? '#000000' : '#8b8b8b',
            borderBottom: activeTab === 'new' ? '2px solid #000000' : '2px solid transparent',
          }}
        >
          {t('home.tabs.new')}
        </span>
        <span
          onClick={() => setActiveTab('bestseller')}
          className={styles.tabItem}
          style={{
            cursor:'pointer',
            color: activeTab === 'bestseller' ? '#000000' : '#8b8b8b',
            borderBottom: activeTab === 'bestseller' ? '2px solid #000000' : '2px solid transparent',
          }}
        >
          {t('home.tabs.bestseller')}
        </span>
        <span
          onClick={() => setActiveTab('featured')}
          className={styles.tabItem}
          style={{
            cursor:'pointer',
            color: activeTab === 'featured' ? '#000000' : '#8b8b8b',
            borderBottom: activeTab === 'featured' ? '2px solid #000000' : '2px solid transparent',
          }}
        >
          {t('home.tabs.featured')}
        </span>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
          <span suppressHydrationWarning>{t('catalog.loading')}</span>
        </div>
      ) : (
        <div className={styles.catalogWrapper}>
          <div className={styles.catalogGrid}>
            {catalogs.length > 0 ? (
              catalogs.map((catalog, index) => (
                <div className={styles.catalogItem} key={catalog?.uuid || index}>
                  <CatalogCard catalog={catalog} onNavigate={() => router.push(buildCatalogUrl(catalog))} />
                </div>
              ))
            ) : (
              <div style={{ padding: '32px', width: '100%' }}>
                <p style={{ textAlign: 'center' }}>{t('catalog.empty')}</p>
              </div>
            )}
          </div>
        </div>
      )}
      {renderPagination(newPage, newTotalPages, setNewPage)}
      <ProductGridBanners />
      <div style={{ width: '100%', maxWidth: '1120px', margin: '80px auto 80px auto', padding: '0 16px' }}>
        <p
          style={{
            fontSize: '24px',
            fontWeight: 500,
            color: '#000000',
            marginBottom: '32px',
            fontFamily: 'var(--font-inter)',
            textAlign: 'left',
          }}
        >
          {t('home.discountsTitle')}
        </p>

        {isDiscountLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
            <span suppressHydrationWarning>{t('catalog.loading')}</span>
          </div>
        ) : (
          <div className={styles.catalogGrid}>
            {discountCatalogs.length > 0 ? (
              discountCatalogs.map((catalog, index) => (
                <div className={styles.catalogItem} key={`discount-${catalog?.uuid || index}`}>
                  <CatalogCard catalog={catalog} onNavigate={() => router.push(buildCatalogUrl(catalog))} />
                </div>
              ))
            ) : (
              <div style={{ padding: '32px', width: '100%' }}>
                <p style={{ textAlign: 'center' }}>{t('catalog.empty')}</p>
              </div>
            )}
          </div>
        )}
        {renderPagination(discountPage, discountTotalPages, setDiscountPage)}
      </div>
      <BigSummerSale />
    </div>
  );
}
