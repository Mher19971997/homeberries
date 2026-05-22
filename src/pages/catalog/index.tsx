import React from 'react';
import * as qs from 'qs';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Grid,
  Box,
  Breadcrumbs,
  Typography,
  Link as MuiLink
} from '@mui/material';

import { getAllCatalogs, searchCatalog } from '@homeberris/http/catalogApi';
import { CatalogItem } from '@homeberris/types/catalog';

import { useQuery } from 'react-query';
import { ListResult } from '@homeberris/types/filter';

// styles
import styles from '@homeberris/pages/catalog/[category]/index.module.css';
import FavoriteItem from '@homeberris/features/favorites/components/FavoriteItems';

export default function SearchCatalog() {
  const router = useRouter();
  const { search } = router.query;
  const searchQuery = typeof search === 'string' ? search : '';

  const { data: catalogs, isLoading } = useQuery<{
    data: CatalogItem[];
    meta: ListResult;
  }>(
    ['searchCatalogs', searchQuery],
    () =>
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
    {
      enabled: router.isReady
    }
  );

  return (
    <Box className={styles.body}>
      <Breadcrumbs aria-label="breadcrumb" className={styles.breadcrumb}>
        <MuiLink component={Link} color="inherit" href="/">
          Главная
        </MuiLink>
        <Typography color="text.primary">
          {searchQuery ? `Поиск: ${searchQuery}` : 'Каталог'}
        </Typography>
      </Breadcrumbs>
      <Box className={styles.filterHeader}>
        <Typography className={styles.filterTitle}>
          {searchQuery ? `Результаты поиска: "${searchQuery}"` : 'Все товары'}
        </Typography>
        <Typography className={styles.count}>
          {catalogs?.meta?.count || 0} товаров
        </Typography>
      </Box>
      <Grid className={styles.container} container spacing={2.5}>
        {isLoading ? (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <Typography variant="h6" color="text.secondary">
                Загрузка...
              </Typography>
            </Box>
          </Grid>
        ) : catalogs?.data && catalogs.data.length > 0 ? (
          catalogs.data.map((catalog: CatalogItem) => (
            <FavoriteItem catalog={catalog} />
          ))
        ) : (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
              <Typography variant="h6" color="text.secondary">
                {searchQuery ? `По запросу "${searchQuery}" ничего не найдено` : 'Товары не найдены'}
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
