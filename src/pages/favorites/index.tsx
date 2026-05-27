import React from 'react';
import Link from 'next/link';
import { Box, Breadcrumbs, Grid, Typography, Link as MuiLink } from '@mui/material';

import { useFavorites } from '@homeberris/context/favoritesContext';
import styles from '@homeberris/pages/catalog/[category]/index.module.css';
import EmptyFavorite from '@homeberris/features/favorites/components/EmptyFavorite';
import FavoriteItem from '@homeberris/features/favorites/components/FavoriteItems';
import dynamic from 'next/dynamic';
import { pluralizeItems } from '@homeberris/utils/formatPlural';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

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
    <Box className={styles.body}>
      <Breadcrumbs aria-label="breadcrumb" className={styles.breadcrumb}>
        <MuiLink component={Link} color="inherit" href="/">
          {t('favorites.breadcrumb.home')}
        </MuiLink>
        <Typography color="text.primary">{t('favorites.breadcrumb.title')}</Typography>
      </Breadcrumbs>

      <Box className={styles.filterHeader}>
        <Typography className={styles.filterTitle}>{t('favorites.header.title')}</Typography>
        <Typography className={styles.count}>{pluralizeItems(items?.length || 0)}</Typography>
      </Box>

      <Grid container spacing={2.5} className={styles.container}>
        {renderFavorites()}
      </Grid>
    </Box>
  );
};

// export default FavoritesPage;
export default dynamic(() => Promise.resolve(FavoritesPage), { ssr: false });

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ru', ['common'])),
    },
  };
}
