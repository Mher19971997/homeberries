'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import * as qs from 'qs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { getAllCatalogs } from '@homeberris/http/catalogApi';
import { getBrands } from '@homeberris/http/brandApi';
import { CatalogItem } from '@homeberris/types/catalog';
import CatalogCard from '@homeberris/components/CatalogCard';
import { useTranslation } from 'react-i18next';

import styles from './index.module.css';

const LIMIT = 12;

const buildCatalogUrl = (catalog: CatalogItem) => {
  const cat = (catalog as any).category?.name;
  const sub = (catalog as any).subCategorie?.name;
  if (cat && sub) return `/catalog/${encodeURIComponent(cat)}/${encodeURIComponent(sub)}/${catalog.uuid}`;
  if (cat) return `/catalog/${encodeURIComponent(cat)}/${catalog.uuid}`;
  return `/catalog`;
};

export default function CatalogIndexPage() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get('search') ?? '';

  const [sortBy, setSortBy] = React.useState('newest');
  const [selectedBrand, setSelectedBrand] = React.useState('');
  const [minPrice, setMinPrice] = React.useState('');
  const [maxPrice, setMaxPrice] = React.useState('');

  const [debouncedMin, setDebouncedMin] = React.useState('');
  const [debouncedMax, setDebouncedMax] = React.useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedMin(minPrice), 300);
    return () => clearTimeout(t);
  }, [minPrice]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedMax(maxPrice), 300);
    return () => clearTimeout(t);
  }, [maxPrice]);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data: brandsData } = useQuery({
    queryKey: ['getAllBrands'],
    queryFn: getBrands,
  });
  const brands = brandsData?.data || [];

  const buildQuery = (page: number) => {
    const filters: any = {
      queryMeta: { paginate: true, limit: LIMIT, page },
      filterMeta: {},
    };

    if (searchQuery) {
      filters.filterMeta.name = { iLike: `%${searchQuery}%` };
    }
    if (selectedBrand) {
      filters.filterMeta.brandUuid = { eq: selectedBrand };
    }
    if (debouncedMin || debouncedMax) {
      filters.filterMeta.priceRange = {
        ...(debouncedMin ? { gte: debouncedMin } : {}),
        ...(debouncedMax ? { lte: debouncedMax } : {}),
      };
    }
    if (sortBy === 'price_asc') filters.queryMeta.order = { price: 'ASC' };
    else if (sortBy === 'price_desc') filters.queryMeta.order = { price: 'DESC' };

    return qs.stringify(filters);
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['catalogInfinite', searchQuery, sortBy, selectedBrand, debouncedMin, debouncedMax],
    queryFn: ({ pageParam = 1 }) => getAllCatalogs(buildQuery(pageParam as number)),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, allPages) => {
      const total = lastPage?.meta?.count || 0;
      const loaded = allPages.length * LIMIT;
      return loaded < total ? allPages.length + 1 : undefined;
    },
  });

  const allCatalogs: CatalogItem[] = data?.pages.flatMap((p: any) => p.data) || [];
  const totalCount = data?.pages[0]?.meta?.count || 0;

  // IntersectionObserver — подгружаем когда sentinel виден
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className={styles.body}>
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className={styles.breadcrumb}>
        <Link className={styles.breadcrumbLink} href="/">{t('catalogIndex.breadcrumbHome')}</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>
          {searchQuery ? `${t('catalogIndex.searchPrefix')}${searchQuery}` : t('catalogIndex.breadcrumbCatalog')}
        </span>
      </nav>

      {/* Горизонтальный фильтр */}
      <div className={styles.filterBar}>
        {/* Кол-во */}
        <span className={styles.filterCount}>{t('catalogIndex.count', { count: totalCount })}</span>

        {/* Бренд */}
        <select
          className={styles.filterSelect}
          value={selectedBrand}
          onChange={e => setSelectedBrand(e.target.value)}
        >
          <option value="">{t('catalogIndex.allBrands')}</option>
          {brands.map((b: any) => (
            <option key={b.uuid} value={b.uuid}>{b.name}</option>
          ))}
        </select>

        {/* Цена */}
        <div className={styles.priceRange}>
          <input
            className={styles.filterInput}
            type="number"
            placeholder={t('catalogIndex.priceFrom')}
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
          />
          <span className={styles.priceSep}>—</span>
          <input
            className={styles.filterInput}
            type="number"
            placeholder={t('catalogIndex.priceTo')}
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
          />
        </div>

        {/* Сортировка */}
        <select
          className={styles.filterSelect}
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="newest">{t('catalogIndex.sortNewest')}</option>
          <option value="price_asc">{t('catalogIndex.sortPriceAsc')}</option>
          <option value="price_desc">{t('catalogIndex.sortPriceDesc')}</option>
        </select>

        {/* Сброс */}
        {(selectedBrand || minPrice || maxPrice) && (
          <button
            className={styles.resetBtn}
            onClick={() => { setSelectedBrand(''); setMinPrice(''); setMaxPrice(''); setDebouncedMin(''); setDebouncedMax(''); }}
          >
            {t('catalogIndex.reset')}
          </button>
        )}
      </div>

      {/* Грид товаров */}
      {isLoading ? (
        <div className={styles.loadingBox}>
          <div className={styles.spinner} />
        </div>
      ) : allCatalogs.length === 0 ? (
        <div className={styles.emptyBox}>
          <p className={styles.emptyText}>{t('catalogIndex.empty')}</p>
        </div>
      ) : (
        <div className={styles.container}>
          {allCatalogs.map((catalog) => (
            <div key={catalog.uuid} className={styles.cardWrap}>
              <CatalogCard
                catalog={catalog}
                onNavigate={() => router.push(buildCatalogUrl(catalog))}
              />
            </div>
          ))}
        </div>
      )}

      {/* Sentinel — триггер для infinite scroll */}
      <div ref={sentinelRef} className={styles.sentinel} />

      {/* Спиннер подгрузки */}
      {isFetchingNextPage && (
        <div className={styles.loadingMore}>
          <div className={styles.spinner} />
        </div>
      )}

      {/* Конец списка */}
      {!hasNextPage && allCatalogs.length > 0 && (
        <p className={styles.endText}>{t('catalogIndex.allLoaded')}</p>
      )}
    </div>
  );
}
