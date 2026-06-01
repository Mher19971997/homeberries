'use client';

import { useState } from 'react';
import * as qs from 'qs';
import { Box, Grid, Typography } from '@mui/material';
import { getAllCatalogs } from '@homeberris/http/catalogApi';
import styles from '@homeberris/pages/index.module.css';
import { CatalogItem } from '@homeberris/types/catalog';
import CarouselCatalog from '@homeberris/components/CarouselCatalog';
import { useQuery } from '@tanstack/react-query';
import { CategoryItem, SubCategoryItem } from '@homeberris/types/category';
import FavoriteItem from '@homeberris/features/favorites/components/FavoriteItems';
import { useTranslation } from 'react-i18next';
import SmallerBanners from '@homeberris/components/SmallerBanners';
import BrowseByCategory from '@homeberris/components/BrowseByCategory';
import ProductGridBanners from '@homeberris/components/ProductGridBanners';
import CatalogCard from '@homeberris/components/CatalogCard';
import Footer from '@homeberris/layouts/Footer';
import BigSummerSale from '@homeberris/components/BigSummerSale';

const ITEMS_LIMIT = 8;

export default function Home() {
  const { t } = useTranslation('common');
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategoryItem | null>(null);

  const [activeTab, setActiveTab] = useState<'new' | 'bestseller' | 'featured'>('new');

  const buildQuery = () => {
    const filters: any = {
      queryMeta: { paginate: true, limit: ITEMS_LIMIT, page: 1 },
    };

    if (selectedCategory) {
      filters.includeMeta = [
        { association: 'category', where: { uuid: selectedCategory.uuid } },
      ];
    }

    if (selectedSubCategory) {
      if (!filters.includeMeta) filters.includeMeta = [];
      filters.includeMeta.push({
        association: 'subCategorie',
        where: { uuid: selectedSubCategory.uuid },
      });
    }

    return qs.stringify(filters);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['getAllCatalogs', selectedCategory?.uuid, selectedSubCategory?.uuid],
    queryFn: () => getAllCatalogs(buildQuery()),
  });

  const { data: discountData, isLoading: isDiscountLoading } = useQuery({
    queryKey: ['getDiscountCatalogs'],
    queryFn: () => getAllCatalogs(qs.stringify({ queryMeta: { paginate: true, limit: 4, page: 1 } })),
  });

  const catalogs: CatalogItem[] = (data?.data || []).slice(0, 8);
  const discountCatalogs: CatalogItem[] = (discountData?.data || []).slice(0, 4);

  return (
    <Box className={styles.body}>
      <CarouselCatalog />
      <SmallerBanners />
      <BrowseByCategory />
      <Box
        sx={{
          display: 'flex',
          gap: '32px',
          marginBottom: '32px',
          paddingLeft: '36px',
          maxWidth: '1280px',
          height: '32px',
          margin: '56px auto 32px auto'
        }}
      >
        <Typography
          onClick={() => setActiveTab('new')}
          sx={{
            fontSize: '18px',
            fontWeight: 500,
            cursor: 'pointer',
            color: activeTab === 'new' ? '#000000' : '#8b8b8b',
            borderBottom: activeTab === 'new' ? '2px solid #000000' : '2px solid transparent',
            paddingBottom: '6px',
            fontFamily: '-apple-system, "Inter", sans-serif',
            transition: 'all 0.2s ease'
          }}
        >
          New Arrival
        </Typography>
        <Typography
          onClick={() => setActiveTab('bestseller')}
          sx={{
            fontSize: '18px',
            fontWeight: 500,
            cursor: 'pointer',
            color: activeTab === 'bestseller' ? '#000000' : '#8b8b8b',
            borderBottom: activeTab === 'bestseller' ? '2px solid #000000' : '2px solid transparent',
            paddingBottom: '6px',
            fontFamily: '-apple-system, "Inter", sans-serif',
            transition: 'all 0.2s ease'
          }}
        >
          Bestseller
        </Typography>
        <Typography
          onClick={() => setActiveTab('featured')}
          sx={{
            fontSize: '18px',
            fontWeight: 500,
            cursor: 'pointer',
            color: activeTab === 'featured' ? '#000000' : '#8b8b8b',
            borderBottom: activeTab === 'featured' ? '2px solid #000000' : '2px solid transparent',
            paddingBottom: '6px',
            fontFamily: '-apple-system, "Inter", sans-serif',
            transition: 'all 0.2s ease'
          }}
        >
          Featured Products
        </Typography>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <Typography>{t('catalog.loading')}</Typography>
        </Box>
      ) : (
        <Box sx={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <Grid
            className={styles.container}
            container
            columnSpacing={2}
            rowSpacing={2}
            justifyContent="flex-start"
          >
            {catalogs.length > 0 ? (
              catalogs.map((catalog, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={catalog?.uuid || index}
                >
                  <FavoriteItem catalog={catalog} />
                </Grid>
              ))
            ) : (
              <Box p={4} width="100%">
                <Typography textAlign="center">
                  {t('catalog.empty')}
                </Typography>
              </Box>
            )}
          </Grid>
        </Box>
      )}
      <ProductGridBanners />
      <Box sx={{ width: '100%', maxWidth: '1280px', margin: '56px auto 80px auto', padding: '0 16px' }}>
        <Typography
          sx={{
            fontSize: '24px',
            fontWeight: 500,
            color: '#000000',
            marginBottom: '32px',
            fontFamily: '-apple-system, "Inter", sans-serif',
            textAlign: 'left'
          }}
        >
          Discounts up to -50%
        </Typography>

        {isDiscountLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <Typography>{t('catalog.loading')}</Typography>
          </Box>
        ) : (
          <Grid container columnSpacing={2} rowSpacing={2} justifyContent="flex-start">
            {discountCatalogs.length > 0 ? (
              discountCatalogs.map((catalog, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={`discount-${catalog?.uuid || index}`}>
                  <CatalogCard catalog={catalog} />
                </Grid>
              ))
            ) : (
              <Box p={4} width="100%">
                <Typography textAlign="center">{t('catalog.empty')}</Typography>
              </Box>
            )}
          </Grid>
        )}
      </Box>
      <BigSummerSale />
      <Footer />
    </Box>
  );
}







// 'use client';

// import React, { useState, useEffect, useCallback } from 'react';
// import * as qs from 'qs';
// import { Box, Grid, Typography } from '@mui/material';
// import { getAllCatalogs } from '@homeberris/http/catalogApi';
// import styles from '@homeberris/pages/index.module.css';
// import { CatalogItem } from '@homeberris/types/catalog';
// import CarouselCatalog from '@homeberris/components/CarouselCatalog';
// import { useInfiniteQuery } from '@tanstack/react-query';
// import { CategoryItem, SubCategoryItem } from '@homeberris/types/category';
// import FavoriteItem from '@homeberris/features/favorites/components/FavoriteItems';
// import { useTranslation } from 'react-i18next';
// import SmallerBanners from '@homeberris/components/SmallerBanners';
// import BrowseByCategory from '@homeberris/components/BrowseByCategory';

// const ITEMS_PER_PAGE = 20;

// export default function Home() {
//   const { t } = useTranslation('common');
//   const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
//   const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategoryItem | null>(null);

//   const buildQuery = (page: number = 1) => {
//     const filters: any = {
//       queryMeta: { paginate: true, limit: ITEMS_PER_PAGE, page },
//     };
//     if (selectedCategory) {
//       filters.includeMeta = [{ association: 'category', where: { uuid: selectedCategory.uuid } }];
//     }
//     if (selectedSubCategory) {
//       if (!filters.includeMeta) filters.includeMeta = [];
//       filters.includeMeta.push({ association: 'subCategorie', where: { uuid: selectedSubCategory.uuid } });
//     }
//     return qs.stringify(filters);
//   };

//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
//     queryKey: ['getAllCatalogs', selectedCategory?.uuid, selectedSubCategory?.uuid],
//     queryFn: ({ pageParam }) => getAllCatalogs(buildQuery(pageParam as number)),
//     initialPageParam: 1,
//     getNextPageParam: (lastPage: any) => {
//       const { meta } = lastPage;
//       const totalPages = Math.ceil(meta.count / ITEMS_PER_PAGE);
//       const currentPage = meta.page || 1;
//       return currentPage < totalPages ? currentPage + 1 : undefined;
//     },
//   });

//   const catalogs = data?.pages?.flatMap((page: any) => page?.data || []) || [];

//   const handleScroll = useCallback(() => {
//     if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
//       if (hasNextPage && !isFetchingNextPage) fetchNextPage();
//     }
//   }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

//   useEffect(() => {
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, [handleScroll]);

//   return (
//     <Box className={styles.body}>
//       <CarouselCatalog />
//       <SmallerBanners />
//       <BrowseByCategory />
//       <Typography variant="h5" fontWeight="bold" className={styles.recomendedTitle}>
//         {selectedCategory
//           ? selectedSubCategory
//             ? `${selectedSubCategory.name}`
//             : `${selectedCategory.name}`
//           : `${t('catalog.title.fallback')}`}
//       </Typography>
//       {isLoading ? (
//         <Box display="flex" justifyContent="center" p={4}>
//           <Typography>{t('catalog.loading')}</Typography>
//         </Box>
//       ) : (
//         <>
//           <Grid className={styles.container} container spacing={2.5}>
//             {catalogs && catalogs.length > 0 ? (
//               catalogs.map((catalog: CatalogItem, index: number) => (
//                 <FavoriteItem key={catalog?.uuid || index} catalog={catalog} />
//               ))
//             ) : (
//               <Box p={4} width="100%">
//                 <Typography variant="body1" color="text.secondary" textAlign="center">
//                   {t('catalog.empty')}
//                 </Typography>
//               </Box>
//             )}
//           </Grid>
//           {isFetchingNextPage && (
//             <Box display="flex" justifyContent="center" p={4}>
//               <Typography>{t('catalog.loadingMore')}</Typography>
//             </Box>
//           )}
//         </>
//       )}
//     </Box>
//   );
// }
