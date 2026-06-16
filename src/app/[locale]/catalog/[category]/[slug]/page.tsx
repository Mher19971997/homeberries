'use client';

import { getCatalogByUud } from '@homeberris/http/catalogApi';
import { getMenuTree } from '@homeberris/http/categoryApi';
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
import { CategoryItem } from '@homeberris/types/category';

const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export default function Catalog() {
  const params = useParams();
  const decodedCategoryName = typeof params?.category === 'string' ? decodeURIComponent(params.category) : '';
  const slugStr = typeof params?.slug === 'string' ? decodeURIComponent(params.slug) : '';
  const isProduct = isUUID(slugStr);

  const { toast, showError, hideToast } = useToast();

  const getLoc = (val: any, locale: string): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return val[locale] || val.ru || val.en || '';
  };

  const { data: menuTree } = useQuery<CategoryItem[]>({
    queryKey: ['getMenuTree'],
    queryFn: getMenuTree,
    enabled: !isProduct,
  });

  const resolvedSubCategoryUuid = React.useMemo(() => {
    if (isProduct || !menuTree) return null;
    const slug = slugStr.toLowerCase();
    const cat = menuTree.find((c: CategoryItem) => {
      const en = getLoc(c.name, 'en').toLowerCase();
      const ru = getLoc(c.name, 'ru').toLowerCase();
      const decoded = decodedCategoryName.toLowerCase();
      return en === decoded || ru === decoded;
    });
    if (!cat?.subCategories) return null;
    const sub = cat.subCategories.find((s: any) => {
      const en = getLoc(s.name, 'en').toLowerCase();
      const ru = getLoc(s.name, 'ru').toLowerCase();
      const hy = getLoc(s.name, 'hy').toLowerCase();
      return en === slug || ru === slug || hy === slug;
    });
    return sub?.uuid || null;
  }, [menuTree, decodedCategoryName, slugStr, isProduct]);

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
      subCategoryUuid={resolvedSubCategoryUuid}
      subCategoryName={slugStr}
      categoryName={decodedCategoryName}
      subCategoryData={null}
      categoryData={null}
    />
  );
}
