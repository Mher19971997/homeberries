'use client';

import { getCatalogByUud } from '@homeberris/http/catalogApi';
import React from 'react';
import { Grid, Box, Typography, CircularProgress } from '@mui/material';
import { CatalogItem } from '@homeberris/types/catalog';
import { useToast } from '@homeberris/hooks/useToast';
import Toast from '@homeberris/components/Toast';
import * as qs from 'qs';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import ProductPageContent from '@homeberris/components/ProductPageContent';

const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export default function Catalog() {
  const params = useParams();
  const categoryName = typeof params?.category === 'string' ? decodeURIComponent(params.category) : '';
  const subCategoryName = typeof params?.slug === 'string' ? decodeURIComponent(params.slug) : '';
  const catalogUuid = typeof params?.product === 'string' ? params.product : '';

  const { toast, hideToast } = useToast();

  const { data: catalog, isLoading } = useQuery<CatalogItem | null>({
    queryKey: ['getCatalogByUud', catalogUuid],
    queryFn: () =>
      getCatalogByUud(
        catalogUuid,
        qs.stringify({
          includeMeta: [
            { association: 'category' },
            { association: 'subCategorie' },
            { association: 'images' },
            { association: 'groupOption', include: [{ association: 'options' }] },
            { association: 'comments' },
            { association: 'brand' }
          ]
        })
      ),
    enabled: !!catalogUuid && isUUID(catalogUuid),
    retry: 1,
  });

  if (isLoading) {
    return (
      <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '50vh', p: 3 }}>
        <CircularProgress />
      </Grid>
    );
  }

  if (!catalog) {
    return (
      <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '50vh', p: 3 }}>
        <Box textAlign="center">
          <Typography color="error" variant="h6" gutterBottom>
            Продукт не найден
          </Typography>
        </Box>
      </Grid>
    );
  }

  return (
    <>
      <ProductPageContent
        catalog={catalog}
        categoryName={categoryName}
        subCategoryName={subCategoryName}
      />
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </>
  );
}
