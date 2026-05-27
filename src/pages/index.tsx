import React, { useState, useEffect, useCallback } from 'react';
import * as qs from 'qs';
import { Box, Grid, Typography } from '@mui/material';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { getAllCatalogs } from '@homeberris/http/catalogApi';
import styles from '@homeberris/pages/index.module.css';
import { CatalogItem } from '@homeberris/types/catalog';
import CarouselCatalog from '@homeberris/components/CarouselCatalog';
import { QueryClient, dehydrate, useInfiniteQuery } from 'react-query';
import { CategoryItem, SubCategoryItem } from '@homeberris/types/category';
import FavoriteItem from '@homeberris/features/favorites/components/FavoriteItems';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';

const ITEMS_PER_PAGE = 20;

export default function Home({ }: InferGetStaticPropsType<
  typeof getServerSideProps
>) {
  const { t } = useTranslation('common');
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategoryItem | null>(null);

  // Формируем запрос с фильтрами и пагинацией
  const buildQuery = (page: number = 1) => {
    const filters: any = {
      queryMeta: {
        paginate: true,
        limit: ITEMS_PER_PAGE,
        page: page
      }
    };

    if (selectedCategory) {
      filters.includeMeta = [
        {
          association: 'category',
          where: {
            uuid: selectedCategory.uuid
          }
        }
      ];
    }

    if (selectedSubCategory) {
      if (!filters.includeMeta) {
        filters.includeMeta = [];
      }
      filters.includeMeta.push({
        association: 'subCategorie',
        where: {
          uuid: selectedSubCategory.uuid
        }
      });
    }

    return qs.stringify(filters);
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery(
    ['getAllCatalogs', selectedCategory?.uuid, selectedSubCategory?.uuid],
    ({ pageParam = 1 }) => getAllCatalogs(buildQuery(pageParam)),
    {
      getNextPageParam: (lastPage) => {
        const { meta } = lastPage;
        const totalPages = Math.ceil(meta.count / ITEMS_PER_PAGE);
        const currentPage = meta.page || 1;
        return currentPage < totalPages ? currentPage + 1 : undefined;
      },
      enabled: true,
      refetchOnWindowFocus: false
    }
  );

  // Объединяем все страницы в один массив
  const catalogs = data?.pages?.flatMap(page => page?.data || []) || [];

  // Обработчик скролла для бесконечной загрузки
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 1000 // Загружаем за 1000px до конца
    ) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <Box className={styles.body}>
      <CarouselCatalog />
      <Typography
        variant="h5"
        fontWeight="bold"
        className={styles.recomendedTitle}
      >
        {selectedCategory
          ? selectedSubCategory
            ? `${selectedSubCategory.name}`
            : `${selectedCategory.name}`
          : `${t('catalog.title.fallback')}`}
      </Typography>
      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <Typography>{t('catalog.loading')}</Typography>
        </Box>
      ) : (
        <>
          <Grid className={styles.container} container spacing={2.5}>
            {catalogs && catalogs.length > 0 ? (
              catalogs.map((catalog: CatalogItem, index: number) => (
                <FavoriteItem catalog={catalog} />
              ))
            ) : (
              <Box p={4} width="100%">
                <Typography variant="body1" color="text.secondary" textAlign="center">
                  {t('catalog.empty')}
                </Typography>
              </Box>
            )}
          </Grid>
          {isFetchingNextPage && (
            <Box display="flex" justifyContent="center" p={4}>
              <Typography>{t('catalog.loadingMore')}</Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

// export async function getServerSideProps() {
//   const queryClient = new QueryClient();
//   await queryClient.prefetchQuery(['getAllCatalogs', null, null], () =>
//     getAllCatalogs(
//       qs.stringify({
//         queryMeta: {
//           paginate: true,
//           limit: ITEMS_PER_PAGE,
//           page: 1
//         }
//       })
//     )
//   );

//   return {
//     props: {
//       dehydratedState: dehydrate(queryClient)
//     }
//   };
// }

export async function getServerSideProps({ locale }: { locale: string }) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(['getAllCatalogs', null, null], () =>
    getAllCatalogs(
      qs.stringify({
        queryMeta: {
          paginate: true,
          limit: ITEMS_PER_PAGE,
          page: 1
        }
      })
    )
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      ...(await serverSideTranslations(locale ?? 'ru', ['common', 'catalog']))
    }
  };
}