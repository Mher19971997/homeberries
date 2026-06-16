'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import { useFavorites } from '@homeberris/context/favoritesContext';
import styles from '@homeberris/app/[locale]/favorites/index.module.css';
import EmptyFavorite from '@homeberris/features/favorites/components/EmptyFavorite';
import FavoriteItem from '@homeberris/features/favorites/components/FavoriteItems';
import { pluralizeItems } from '@homeberris/utils/formatPlural';
import { useTranslation } from 'react-i18next';
import { checkToken } from '@homeberris/utils/auth';
import AuthGuard from '@homeberris/components/AuthGuard';
import Breadcrumb from '@homeberris/components/Breadcrumb';

const FavoritesPage: React.FC = () => {
  const { t, ready } = useTranslation('common');
  const { items } = useFavorites();
  const isAuth = checkToken();

  const renderFavorites = () => {
    if (!items?.length) return <EmptyFavorite />;

    return items.map((catalog) => (
      <FavoriteItem key={catalog.uuid} catalog={catalog} />
    ));
  };

  if (!ready) return null;

  if (!isAuth) {
    return (
      <AuthGuard
        icon={
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        }
        title={t('auth.modal.favoritesTitle')}
        subtitle={t('auth.modal.favoritesSubtitle')}
      />
    );
  }

  return (
    <div className={styles.body}>
      <Breadcrumb items={[
        { label: t('favorites.breadcrumb.home'), href: '/' },
        { label: t('favorites.breadcrumb.title') },
      ]} />

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
