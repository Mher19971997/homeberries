'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllCatalogs } from '@homeberris/http/catalogApi';
import { CatalogItem } from '@homeberris/types/catalog';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { useTranslation } from 'react-i18next';
import qs from 'qs';
import { UUID } from 'crypto';
import styles from './index.module.css';
import FavoriteItem from '@homeberris/features/favorites/components/FavoriteItems';
import { PaginationLeft, PaginationRight } from '@homeberris/assets/icons/catalog';
import paginationStyles from '@homeberris/pages/catalog/[category]/index.module.css';

const ITEMS_PER_PAGE = 8;
const FETCH_LIMIT = 9;

interface SimilarProductsProps {
  currentCatalogUuid: UUID;
  categoryUuid?: UUID;
  subCategoryUuid?: UUID;
}

const renderPagination = (currentPage: number, totalPages: number, setPage: (p: number) => void) => {
  if (totalPages <= 1) return null;
  const pages: (number | string)[] = [];
  if (totalPages <= 4) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = currentPage <= 2
      ? Math.min(totalPages - 1, 3)
      : Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
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

const SimilarProducts: React.FC<SimilarProductsProps> = ({
  currentCatalogUuid,
  categoryUuid,
  subCategoryUuid,
}) => {
  const { t } = useTranslation('common');
  const [page, setPage] = React.useState(1);

  const buildQuery = (p: number) => {
    const filters: any = {
      queryMeta: { paginate: true, limit: FETCH_LIMIT, page: p },
      includeMeta: [
        { association: 'images' },
        { association: 'category' },
        { association: 'subCategorie' },
      ],
    };
    if (subCategoryUuid) filters.subCategoryUuid = subCategoryUuid;
    else if (categoryUuid) filters.categoryUuid = categoryUuid;
    return qs.stringify(filters);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['getSimilarCatalogs', currentCatalogUuid, categoryUuid, subCategoryUuid, page],
    queryFn: () => getAllCatalogs(buildQuery(page)),
    enabled: !!(categoryUuid || subCategoryUuid),
    refetchOnWindowFocus: false,
  });

  const products: CatalogItem[] = (data?.data || [])
    .filter((p: CatalogItem) => p.uuid !== currentCatalogUuid)
    .slice(0, ITEMS_PER_PAGE);
  const total = data?.meta?.count || 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  if (!isLoading && products.length === 0) return null;

  return (
    <div className={styles.container}>
      <p className={styles.title}>{t('similarProducts.title')}</p>
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
        </div>
      ) : (
        <>
          <div className={styles.productsGrid}>
            {products.map((product: CatalogItem) => (
              <FavoriteItem key={product.uuid} catalog={product} />
            ))}
          </div>
          {renderPagination(page, totalPages, (p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); })}
        </>
      )}
    </div>
  );
};

export default SimilarProducts;
