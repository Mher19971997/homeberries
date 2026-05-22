import React, { useEffect, useCallback } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { useInfiniteQuery } from 'react-query';
import { getAllCatalogs } from '@homeberris/http/catalogApi';
import { CatalogItem } from '@homeberris/types/catalog';
import { useRouter } from 'next/router';
import qs from 'qs';
import { UUID } from 'crypto';
import styles from './index.module.css';
import FavoriteItem from '@homeberris/features/favorites/components/FavoriteItems';

const ITEMS_PER_PAGE = 20;

interface SimilarProductsProps {
  currentCatalogUuid: UUID;
  categoryUuid?: UUID;
  subCategoryUuid?: UUID;
}

const SimilarProducts: React.FC<SimilarProductsProps> = ({
  currentCatalogUuid,
  categoryUuid,
  subCategoryUuid
}) => {
  // Формируем запрос для получения похожих товаров
  const buildQuery = (page: number = 1) => {
    const filters: any = {
      queryMeta: {
        paginate: true,
        limit: ITEMS_PER_PAGE,
        page: page
      },
      includeMeta: [
        {
          association: 'images'
        },
        {
          association: 'category'
        },
        {
          association: 'subCategorie'
        }
      ]
    };

    // Фильтруем по категории и подкатегории
    if (subCategoryUuid) {
      // Если есть подкатегория, фильтруем по ней (более точное совпадение)
      filters.subCategoryUuid = subCategoryUuid;
    } else if (categoryUuid) {
      // Если нет подкатегории, фильтруем по категории
      filters.categoryUuid = categoryUuid;
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
    ['getSimilarCatalogs', currentCatalogUuid, categoryUuid, subCategoryUuid],
    ({ pageParam = 1 }) => getAllCatalogs(buildQuery(pageParam)),
    {
      getNextPageParam: (lastPage) => {
        const { meta } = lastPage;
        const totalPages = Math.ceil(meta.count / ITEMS_PER_PAGE);
        const currentPage = meta.page || 1;
        return currentPage < totalPages ? currentPage + 1 : undefined;
      },
      enabled: !!(categoryUuid || subCategoryUuid),
      refetchOnWindowFocus: false
    }
  );

  // Объединяем все страницы в один массив и фильтруем текущий товар
  const allProducts = data?.pages?.flatMap(page => page?.data || []) || [];
  const similarProducts: CatalogItem[] = allProducts.filter(
    (product: CatalogItem) => product.uuid !== currentCatalogUuid
  );

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

  // Если нет похожих товаров, не показываем блок
  if (!isLoading && similarProducts.length === 0) {
    return null;
  }

  return (
    <Box className={styles.container}>
      <Typography className={styles.title}>Смотрите также</Typography>
      {isLoading ? (
        <Box className={styles.loadingContainer}>
          <Typography>Загрузка похожих товаров...</Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={2.5} className={styles.productsGrid}>
            {similarProducts.map((product: CatalogItem) => (
              <FavoriteItem catalog={product} />
            ))}
          </Grid>
          {isFetchingNextPage && (
            <Box display="flex" justifyContent="center" p={4}>
              <Typography>Загрузка дополнительных товаров...</Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default SimilarProducts;
