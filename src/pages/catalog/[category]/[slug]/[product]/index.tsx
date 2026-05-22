import { getCatalogByUud } from '@homeberris/http/catalogApi';
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { Grid, Box, Typography, CircularProgress } from '@mui/material';
import { CatalogItem } from '@homeberris/types/catalog';
import { useToast } from '@homeberris/hooks/useToast';
import Toast from '@homeberris/components/Toast';
import * as qs from 'qs';
import { QueryClient, dehydrate, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import ProductPageContent from '@homeberris/components/ProductPageContent';

// Helper function to check if string is UUID
const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Helper function to check if string is UUID (for server-side)
const isUUIDServer = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export default function Catalog({ 
  catalog: propCatalog,
  categoryName: propCategoryName,
  subCategoryName: propSubCategoryName
}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const route = useRouter();
  const { category, slug, product } = route.query;
  
  const categoryName = propCategoryName || (typeof category === 'string' ? decodeURIComponent(category) : '');
  const subCategoryName = propSubCategoryName || (typeof slug === 'string' ? decodeURIComponent(slug) : '');
  const catalogUuid = typeof product === 'string' ? product : '';

  const { toast, showError, hideToast } = useToast();
  
  const { data: catalog, isLoading } = useQuery<CatalogItem | null>(
    ['getCatalogByUud', catalogUuid],
    () => {
      return getCatalogByUud(
        catalogUuid,
        qs.stringify({
          includeMeta: [
            {
              association: 'category'
            },
            {
              association: 'subCategorie'
            },
            {
              association: 'images'
            },
            {
              association: 'groupOption',
              include: [
                {
                  association: 'options'
                }
              ]
            },
            {
              association: 'comments'
            },
            {
              association: 'brand'
            }
          ]
        })
      );
    },
    {
      enabled: !!catalogUuid && isUUID(catalogUuid),
      retry: 1,
      initialData: propCatalog as CatalogItem | null,
      onError: (err: any) => {
        const errorMessage = err?.response?.data?.message || 'Ошибка при загрузке товара';
        showError(errorMessage);
      }
    }
  );

  const finalCatalog: CatalogItem | undefined = (catalog as CatalogItem | null) || (propCatalog as CatalogItem | null) || undefined;

  if (isLoading) {
    return (
      <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '50vh', p: 3 }}>
        <CircularProgress />
      </Grid>
    );
  }

  if (!isLoading && !finalCatalog) {
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
        catalog={finalCatalog} 
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

export async function getServerSideProps({
  params
}: {
  params: { category: string; slug: string; product: string };
}) {
  const queryClient = new QueryClient();

  try {
    if (!params?.product || !params?.category || !params?.slug) {
      return {
        notFound: true,
      };
    }

    // Декодируем параметры
    const decodedProduct = decodeURIComponent(params.product);
    const decodedCategory = decodeURIComponent(params.category);
    const decodedSlug = decodeURIComponent(params.slug);

    // Проверяем, что product - это UUID
    if (!isUUIDServer(decodedProduct)) {
      return {
        notFound: true,
      };
    }

    await queryClient.prefetchQuery(
      ['getCatalogByUud', params.product],
      () =>
        getCatalogByUud(
          params.product,
          qs.stringify({
            includeMeta: [
              {
                association: 'category'
              },
              {
                association: 'subCategorie'
              },
              {
                association: 'images'
              },
              {
                association: 'groupOption',
                include: [
                  {
                    association: 'options'
                  }
                ]
              },
              {
                association: 'comments'
              },
              {
                association: 'brand'
              }
            ]
          })
        )
    );

    const catalog = await queryClient.getQueryData(['getCatalogByUud', params.product]);

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        catalog: catalog || null,
        categoryName: decodedCategory,
        subCategoryName: decodedSlug
      }
    };
  } catch (error) {
    console.error('getServerSideProps error:', error);
    return {
      notFound: true,
    };
  }
}
