'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Breadcrumb from '@homeberris/components/Breadcrumb';
import { useQuery } from '@tanstack/react-query';
import * as qs from 'qs';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { useTranslation } from 'react-i18next';
import { useCookies } from 'react-cookie';
import CatalogCard from '@homeberris/components/CatalogCard';
import styles from '@homeberris/pages/favorites/index.module.css';
import { getAllRecentlyViewed } from '@homeberris/http/recentlyViewedApi';

const buildCatalogUrl = (catalog: any) => {
  const cat = catalog?.category?.name;
  const sub = catalog?.subCategorie?.name;
  if (cat && sub) return `/catalog/${encodeURIComponent(cat)}/${encodeURIComponent(sub)}/${catalog.uuid}`;
  if (cat) return `/catalog/${encodeURIComponent(cat)}/${catalog.uuid}`;
  return `/catalog`;
};

const RecentlyViewedPage: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [cookies] = useCookies(['token']);

  const { data, isLoading } = useQuery({
    queryKey: ['recentlyViewed', cookies.token],
    queryFn: () => getAllRecentlyViewed(
      qs.stringify({ queryMeta: { paginate: true, limit: 20 } }),
      cookies.token
    ),
    enabled: !!cookies.token,
  });

  return (
    <div className={styles.body}>
      <Breadcrumb items={[
        { label: t('recentlyViewedPage.breadcrumbHome'), href: '/' },
        { label: t('recentlyViewedPage.breadcrumbProfile'), href: '/profile' },
        { label: t('recentlyViewedPage.breadcrumbCurrent') },
      ]} />

      <div className={styles.filterHeader}>
        <p className={styles.filterTitle}>{t('recentlyViewedPage.title')}</p>
        <p className={styles.count}>{t('recentlyViewedPage.count', { count: data?.data?.length ?? 0 })}</p>
      </div>

      {isLoading ? (
        <div className={styles.grid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: 320, borderRadius: 12, background: '#f0f0f0' }} />
          ))}
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className={styles.grid}>
          {data.data.map((item: any) => (
            <CatalogCard
              key={item.uuid}
              catalog={item.catalog}
              onNavigate={() => router.push(buildCatalogUrl(item.catalog))}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#868686' }}>
          <p style={{ fontSize: 18, fontWeight: 600, color: '#000', marginBottom: 8 }}>
            {t('recentlyViewedPage.emptyTitle')}
          </p>
          <p style={{ fontSize: 14 }}>{t('recentlyViewedPage.emptySubtitle')}</p>
        </div>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(RecentlyViewedPage), { ssr: false });