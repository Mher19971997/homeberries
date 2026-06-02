import React from 'react';
import * as qs from 'qs';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { getAllCatalogs, searchCatalog } from '@homeberris/http/catalogApi';
import { CatalogItem } from '@homeberris/types/catalog';

import { useQuery } from '@tanstack/react-query';
import { ListResult } from '@homeberris/types/filter';

import styles from './index.module.css';
import FavoriteItem from '@homeberris/features/favorites/components/FavoriteItems';

export default function SearchCatalog() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get('search') ?? '';

  const { data: catalogs, isLoading } = useQuery<{
    data: CatalogItem[];
    meta: ListResult;
  }>({
    queryKey: ['searchCatalogs', searchQuery],
    queryFn: () =>
      searchQuery
        ? searchCatalog(
          qs.stringify({
            filterMeta: {
              websearchQuery: {
                name: searchQuery
              }
            },
            queryMeta: {
              paginate: true
            }
          })
        )
        : getAllCatalogs(
          qs.stringify({
            queryMeta: {
              paginate: true,
              limit: 20
            }
          })
        ),
    enabled: true,
  });

  return (
    <div className={styles.body}>
      <nav aria-label="breadcrumb" className={styles.breadcrumb}>
        <Link className={styles.breadcrumbLink} href="/">
          Главная
        </Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>
          {searchQuery ? `Поиск: ${searchQuery}` : 'Каталог'}
        </span>
      </nav>
      <div className={styles.filterHeader}>
        <p className={styles.filterTitle}>
          {searchQuery ? `Результаты поиска: "${searchQuery}"` : 'Все товары'}
        </p>
        <p className={styles.count}>
          {catalogs?.meta?.count || 0} товаров
        </p>
      </div>
      <div className={styles.container}>
        {isLoading ? (
          <div className={styles.loadingBox}>
            <p className={styles.loadingText}>Загрузка...</p>
          </div>
        ) : catalogs?.data && catalogs.data.length > 0 ? (
          catalogs.data.map((catalog: CatalogItem) => (
            <FavoriteItem catalog={catalog} />
          ))
        ) : (
          <div className={styles.emptyBox}>
            <p className={styles.emptyText}>
              {searchQuery ? `По запросу "${searchQuery}" ничего не найдено` : 'Товары не найдены'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
