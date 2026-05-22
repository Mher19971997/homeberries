import React from 'react';
import Link from 'next/link';
import { Box, Breadcrumbs, Grid, Typography, Link as MuiLink } from '@mui/material';

import { useFavorites } from '@homeberris/context/favoritesContext';
import styles from '@homeberris/pages/catalog/[category]/index.module.css';
import EmptyFavorite from '@homeberris/features/favorites/components/EmptyFavorite';
import FavoriteItem from '@homeberris/features/favorites/components/FavoriteItems';

const FavoritesPage: React.FC = () => {
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
          Главная
        </MuiLink>
        <Typography color="text.primary">Избранное</Typography>
      </Breadcrumbs>

      <Box className={styles.filterHeader}>
        <Typography className={styles.filterTitle}>Избранное</Typography>
        <Typography className={styles.count}>{items?.length || 0} товаров</Typography>
      </Box>

      <Grid container spacing={2.5} className={styles.container}>
        {renderFavorites()}
      </Grid>
    </Box>
  );
};

export default FavoritesPage;