import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import * as qs from 'qs';
import { getAllCatalogs } from '@homeberris/http/catalogApi';
import { getRecentlyViewed } from '@homeberris/utils/recentlyViewed';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { useTranslation } from 'react-i18next';
import CatalogCard from '@homeberris/components/CatalogCard';
import styles from '@homeberris/pages/favorites/index.module.css';

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
  const [uuids, setUuids] = useState<string[]>([]);

  useEffect(() => {
    setUuids(getRecentlyViewed());
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['recentlyViewed', uuids],
    queryFn: () =>
      getAllCatalogs(
        qs.stringify({
          queryMeta: { paginate: true, limit: 20 },
          filterMeta: { uuid: { in: uuids } },
        })
      ),
    enabled: uuids.length > 0,
  });

  const ordered = React.useMemo(() => {
    if (!data?.data) return [];
    return uuids
      .map((id) => data.data.find((c: any) => c.uuid === id))
      .filter(Boolean);
  }, [data, uuids]);

  return (
    <div className={styles.body}>
      <nav className={styles.breadcrumb} aria-label="breadcrumb">
        <Link href="/" className={styles.breadcrumbLink}>{t('recentlyViewedPage.breadcrumbHome')}</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <Link href="/profile" className={styles.breadcrumbLink}>{t('recentlyViewedPage.breadcrumbProfile')}</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbActive}>{t('recentlyViewedPage.breadcrumbCurrent')}</span>
      </nav>

      <div className={styles.filterHeader}>
        <p className={styles.filterTitle}>{t('recentlyViewedPage.title')}</p>
        <p className={styles.count}>{t('recentlyViewedPage.count', { count: ordered.length })}</p>
      </div>

      {isLoading ? (
        <div className={styles.grid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: 320, borderRadius: 12, background: '#f0f0f0' }} />
          ))}
        </div>
      ) : ordered.length > 0 ? (
        <div className={styles.grid}>
          {ordered.map((catalog: any) => (
            <CatalogCard
              key={catalog.uuid}
              catalog={catalog}
              onNavigate={() => router.push(buildCatalogUrl(catalog))}
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
