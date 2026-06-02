'use client';

import { useState } from 'react';
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

export default function Home() {
  const { t } = useTranslation('common');
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategoryItem | null>(null);

  const [activeTab, setActiveTab] = useState<'new' | 'bestseller' | 'featured'>('new');

  const buildQuery = () => {
    const filters: any = {
      queryMeta: { paginate: true, limit: ITEMS_LIMIT, page: 1 },
    };

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
    queryKey: ['getAllCatalogs', selectedCategory?.uuid, selectedSubCategory?.uuid],
    queryFn: () => getAllCatalogs(buildQuery()),
  });

  const { data: discountData, isLoading: isDiscountLoading } = useQuery({
    queryKey: ['getDiscountCatalogs'],
    queryFn: () => getAllCatalogs(qs.stringify({ queryMeta: { paginate: true, limit: 4, page: 1 } })),
  });

  const catalogs: CatalogItem[] = (data?.data || []).slice(0, 8);
  const discountCatalogs: CatalogItem[] = (discountData?.data || []).slice(0, 4);

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
            color: activeTab === 'new' ? '#000000' : '#8b8b8b',
            borderBottom: activeTab === 'new' ? '2px solid #000000' : '2px solid transparent',
          }}
        >
          New Arrival
        </span>
        <span
          onClick={() => setActiveTab('bestseller')}
          className={styles.tabItem}
          style={{
            color: activeTab === 'bestseller' ? '#000000' : '#8b8b8b',
            borderBottom: activeTab === 'bestseller' ? '2px solid #000000' : '2px solid transparent',
          }}
        >
          Bestseller
        </span>
        <span
          onClick={() => setActiveTab('featured')}
          className={styles.tabItem}
          style={{
            color: activeTab === 'featured' ? '#000000' : '#8b8b8b',
            borderBottom: activeTab === 'featured' ? '2px solid #000000' : '2px solid transparent',
          }}
        >
          Featured Products
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
                  <CatalogCard catalog={catalog} />
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
      <ProductGridBanners />
      <div style={{ width: '100%', maxWidth: '1120px', margin: '56px auto 80px auto', padding: '0 16px' }}>
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
          Discounts up to -50%
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
                  <CatalogCard catalog={catalog} />
                </div>
              ))
            ) : (
              <div style={{ padding: '32px', width: '100%' }}>
                <p style={{ textAlign: 'center' }}>{t('catalog.empty')}</p>
              </div>
            )}
          </div>
        )}
      </div>
      <BigSummerSale />
    </div>
  );
}
