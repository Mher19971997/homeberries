import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import { useFavorites } from '@homeberris/context/favoritesContext';
import styles from './index.module.css';
import EmptyFavorite from '@homeberris/features/favorites/components/EmptyFavorite';
import FavoriteItem from '@homeberris/features/favorites/components/FavoriteItems';
import { pluralizeItems } from '@homeberris/utils/formatPlural';
import { useTranslation } from 'react-i18next';

const FavoritesPage: React.FC = () => {
  const { t } = useTranslation('common');
  const { items } = useFavorites();

  const renderFavorites = () => {
    if (!items?.length) return <EmptyFavorite />;

    return items.map((catalog) => (
      <FavoriteItem key={catalog.uuid} catalog={catalog} />
    ));
  };

  return (
    <div className={styles.body}>
      <nav className={styles.breadcrumb} aria-label="breadcrumb">
        <Link href="/" className={styles.breadcrumbLink}>
          {t('favorites.breadcrumb.home')}
        </Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbActive}>
          {t('favorites.breadcrumb.title')}
        </span>
      </nav>

      <div className={styles.filterHeader}>
        <p className={styles.filterTitle}>{t('favorites.header.title')}</p>
        <p className={styles.count}>{pluralizeItems(items?.length || 0)}</p>
      </div>

      {items?.length ? (
        <div className={styles.grid}>
          {renderFavorites()}
        </div>
      ) : (
        <EmptyFavorite />
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(FavoritesPage), { ssr: false });

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {},
  };
}
