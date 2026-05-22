import { getCatalogByUud } from '@homeberris/http/catalogApi';
import { getAllCatalogs } from '@homeberris/http/catalogApi';
import { getMenuTree, getSubCategoryByName } from '@homeberris/http/categoryApi';
import { InferGetStaticPropsType } from 'next';
import React from 'react';
import { Grid, Box, Typography, CircularProgress } from '@mui/material';
import { useToast } from '@homeberris/hooks/useToast';
import Toast from '@homeberris/components/Toast';
import * as qs from 'qs';
import { QueryClient, dehydrate, useQuery } from 'react-query';
import { useRouter } from 'next/router';
import ProductPageContent from '@homeberris/components/ProductPageContent';
import SubCategoryPageContent from '@homeberris/components/SubCategoryPageContent';
import { CategoryItem, SubCategoryItem } from '@homeberris/types/category';
import { CatalogItem } from '@homeberris/types/catalog';

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

// Рекурсивная функция для поиска подкатегории по имени
const findSubCategoryByName = (name: string, subCategories: SubCategoryItem[]): SubCategoryItem | null => {
  if (!subCategories) return null;
  for (const sub of subCategories) {
    if (sub.name === name) {
      return sub;
    }
    if (sub.children && sub.children.length > 0) {
      const found = findSubCategoryByName(name, sub.children);
      if (found) return found;
    }
  }
  return null;
};

export default function Catalog({
  isProduct,
  catalog,
  subCategoryUuid,
  subCategoryName,
  categoryName,
  subCategoryData,
  categoryData
}: InferGetStaticPropsType<typeof getServerSideProps>) {
  const route = useRouter();
  const { category, slug } = route.query;

  const decodedCategoryName = categoryName || (typeof category === 'string' ? decodeURIComponent(category) : '');
  const decodedSubCategoryName = subCategoryName || '';
  console.log(decodedSubCategoryName, 546565);

  const catalogUuid = typeof slug === 'string' ? slug : '';

  const { toast, showError, hideToast } = useToast();

  // Если это продукт (UUID), загружаем данные продукта
  const { data: productCatalog, isLoading: isLoadingProduct } = useQuery<CatalogItem | null>(
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
      enabled: isProduct && !!catalogUuid && isUUID(catalogUuid),
      retry: 1,
      onError: (err: any) => {
        const errorMessage = err?.response?.data?.message || 'Ошибка при загрузке товара';
        showError(errorMessage);
      }
    }
  );
  console.log(productCatalog?.category?.name, 5454546);

  const finalCatalog: CatalogItem | undefined = (catalog as CatalogItem | null) || (productCatalog as CatalogItem | null) || undefined;

  if (isProduct) {
    // Это страница продукта
    if (isLoadingProduct) {
      return (
        <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '50vh', p: 3 }}>
          <CircularProgress />
        </Grid>
      );
    }

    if (!isLoadingProduct && !finalCatalog) {
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
          subCategoryName={productCatalog?.category?.name || decodedSubCategoryName}
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
  } else {
    return (
      <SubCategoryPageContent
        subCategoryUuid={subCategoryUuid || null}
        subCategoryName={productCatalog?.category?.name || decodedSubCategoryName}
        categoryName={decodedCategoryName}
        subCategoryData={subCategoryData || null}
        categoryData={categoryData || null}
      />
    );
  }
}

export async function getServerSideProps({
  params
}: {
  params: { category: string; slug: string };
}) {
  const queryClient = new QueryClient();

  try {
    if (!params?.slug || !params?.category) {
      return {
        notFound: true,
      };
    }

    // Декодируем параметры
    const decodedSlug = decodeURIComponent(params.slug);
    const decodedCategory = decodeURIComponent(params.category);

    // Проверяем, является ли slug UUID
    const isProduct = isUUIDServer(decodedSlug);

    if (isProduct) {
      // Это продукт (UUID) - загружаем данные продукта
      try {
        await queryClient.prefetchQuery(
          ['getCatalogByUud', params.slug],
          () =>
            getCatalogByUud(
              params.slug,
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

        const catalog = await queryClient.getQueryData(['getCatalogByUud', params.slug]);

        return {
          props: {
            dehydratedState: dehydrate(queryClient),
            isProduct: true,
            catalog: catalog || null,
            categoryName: decodedCategory
          }
        };
      } catch (error) {
        console.error('Error fetching product:', error);
        return {
          notFound: true,
        };
      }
    } else {
      // Это подкатегория - загружаем данные подкатегории
      // Получаем меню для поиска UUID подкатегории
      const menuTree = await queryClient.fetchQuery('getMenuTree', getMenuTree, {
        retry: false,
      });

      // Находим категорию и подкатегорию в дереве
      const categoryData = menuTree?.find((c: any) => c.name === decodedCategory);

      // Рекурсивная функция для поиска подкатегории
      const findSubCategoryByNameServer = (name: string, subCategories: any[]): any => {
        if (!subCategories) return null;
        for (const sub of subCategories) {
          if (sub.name === name) {
            return sub;
          }
          if (sub.children && sub.children.length > 0) {
            const found = findSubCategoryByNameServer(name, sub.children);
            if (found) return found;
          }
        }
        return null;
      };

      // Сначала пытаемся найти в дереве меню
      let subCategoryData = categoryData?.subCategories
        ? findSubCategoryByNameServer(decodedSlug, categoryData.subCategories)
        : null;
      let subCategoryUuid = subCategoryData?.uuid;

      // Если не нашли в дереве меню, пытаемся получить через API
      if (!subCategoryUuid && categoryData?.uuid) {
        try {
          const subCategoryFromApi = await getSubCategoryByName(decodedSlug, categoryData.uuid);
          if (subCategoryFromApi) {
            subCategoryUuid = subCategoryFromApi.uuid;
            subCategoryData = subCategoryFromApi;
          }
        } catch (error) {
          console.log('Error fetching subcategory from API:', error);
        }
      }

      // Пытаемся получить продукты
      try {
        await queryClient.prefetchQuery(
          ['getAllCatalogsBySubCategory', decodedCategory, decodedSlug, subCategoryUuid || null],
          () =>
            getAllCatalogs(
              qs.stringify({
                includeMeta: [
                  {
                    association: 'category',
                    where: {
                      name: decodedCategory
                    }
                  },
                  {
                    association: 'subCategorie',
                    where: subCategoryUuid ? {
                      uuid: subCategoryUuid
                    } : {
                      name: decodedSlug
                    }
                  }
                ],
                ...(subCategoryUuid && {
                  where: {
                    subCategoryUuid: subCategoryUuid
                  }
                }),
                queryMeta: {
                  paginate: true
                }
              })
            ),
          { retry: false }
        );
      } catch (queryError) {
        console.log('Error fetching products for subcategory:', queryError);
      }

      return {
        props: {
          dehydratedState: dehydrate(queryClient),
          isProduct: false,
          subCategoryUuid: subCategoryUuid || null,
          subCategoryName: decodedSlug,
          categoryName: decodedCategory,
          subCategoryData: subCategoryData || null,
          categoryData: categoryData || null
        }
      };
    }
  } catch (error) {
    console.error('getServerSideProps error:', error);
    return {
      notFound: true,
    };
  }
}
