'use client';

import { getCatalogByUud } from '@homeberris/http/catalogApi';
import React from 'react';
import { Grid, Box, Typography, CircularProgress } from '@mui/material';
import { useToast } from '@homeberris/hooks/useToast';
import Toast from '@homeberris/components/Toast';
import * as qs from 'qs';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import ProductPageContent from '@homeberris/components/ProductPageContent';
import SubCategoryPageContent from '@homeberris/components/SubCategoryPageContent';
import { CatalogItem } from '@homeberris/types/catalog';

const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export default function Catalog() {
  const params = useParams();
  const decodedCategoryName = typeof params?.category === 'string' ? decodeURIComponent(params.category) : '';
  const slugStr = typeof params?.slug === 'string' ? params.slug : '';
  const isProduct = isUUID(slugStr);

  const { toast, showError, hideToast } = useToast();

  const { data: productCatalog, isLoading: isLoadingProduct } = useQuery<CatalogItem | null>({
    queryKey: ['getCatalogByUud', slugStr],
    queryFn: () =>
      getCatalogByUud(
        slugStr,
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
    enabled: isProduct && !!slugStr,
    retry: 1,
  });

  if (isProduct) {
    if (isLoadingProduct) {
      return (
        <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '50vh', p: 3 }}>
          <CircularProgress />
        </Grid>
      );
    }

    if (!productCatalog) {
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
          catalog={productCatalog}
          subCategoryName={productCatalog?.category?.name || ''}
          categoryName={decodedCategoryName}
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

  return (
    <SubCategoryPageContent
      subCategoryUuid={null}
      subCategoryName={slugStr}
      categoryName={decodedCategoryName}
      subCategoryData={null}
      categoryData={null}
    />
  );
}
