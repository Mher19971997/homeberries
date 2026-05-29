'use client';

import React from 'react';
import * as qs from 'qs';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  Grid,
  Box,
  Breadcrumbs,
  Typography,
  Button,
  IconButton,
  Pagination,
  Link as MuiLink
} from '@mui/material';

import { getAllCatalogs } from '@homeberris/http/catalogApi';
import { getBrandsBySubCategory } from '@homeberris/http/brandApi';
import { CatalogItem } from '@homeberris/types/catalog';
import { CategoryItem, SubCategoryItem } from '@homeberris/types/category';
import { BrandItem } from '@homeberris/types/brand';

// Custom Components
import CatalogCard from '@homeberris/components/CatalogCard';
import VerticalToggleButtons from '@homeberris/components/VerticalToggleButtons';
import SortFilter from '@homeberris/components/SortFilter';
import PriceFilter from '@homeberris/components/PriceFilter';
import BrandFilter from '@homeberris/components/BrandFilter';
import GridViewIcon from '@mui/icons-material/GridView';
import { CircularProgress } from '@mui/material';

// styles
import styles from '@homeberris/pages/catalog/[category]/index.module.css';
import { useQuery } from '@tanstack/react-query';
import FilterMenu from '@homeberris/layouts/FilterMenu';
import TuneIcon from '@mui/icons-material/Tune';
import { ListResult } from '@homeberris/types/filter';

interface SubCategoryPageContentProps {
  subCategoryUuid: string | null;
  subCategoryName: string;
  categoryName: string;
  subCategoryData: SubCategoryItem | null;
  categoryData: CategoryItem | null;
}

export default function SubCategoryPageContent({ 
  subCategoryUuid, 
  subCategoryName, 
  categoryName,
  subCategoryData,
  categoryData
}: SubCategoryPageContentProps) {
  const router = useRouter();
  const params = useParams();
  const category = params?.category as string | undefined;
  const slug = params?.slug as string | undefined;
  
  // Формируем пути для breadcrumbs на основе query параметров
  const decodedCategory = typeof category === 'string' ? decodeURIComponent(category) : categoryName;
  const categoryPath = decodedCategory ? `/catalog/${encodeURIComponent(decodedCategory)}` : '/catalog';
  
  // Формируем путь для подкатегории
  const decodedSlug = typeof slug === 'string' ? decodeURIComponent(slug) : subCategoryName;
  const subCategoryPath = decodedCategory && decodedSlug 
    ? `/catalog/${encodeURIComponent(decodedCategory)}/${encodeURIComponent(decodedSlug)}`
    : categoryPath;
  
  const [openMenu, setOpenMenu] = React.useState<boolean>(false);
  const [sortPanelOne, setSortPanelOne] = React.useState<boolean>(false);
  const [sortBy, setSortBy] = React.useState<string>('popularity');
  const [priceRange, setPriceRange] = React.useState<{ min: number; max: number } | null>(null);
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>([]);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  
  const ITEMS_PER_PAGE = 20;

  // Базовый диапазон цен (уточняется после загрузки товаров)
  const baseMinPrice = 0;
  const baseMaxPrice = 100000000;

  const buildQuery = () => {
    const filters: any = {
      includeMeta: [
        {
          association: 'category',
          where: {
            name: categoryName
          }
        },
        {
          association: 'subCategorie',
          where: subCategoryUuid ? {
            uuid: subCategoryUuid
          } : {
            name: subCategoryName
          }
        },
        {
          association: 'brand'
        }
      ],
      queryMeta: {
        paginate: true,
        limit: ITEMS_PER_PAGE,
        page: currentPage
      }
    };

    // Фильтр по цене
    if (priceRange) {
      filters.where = {
        ...filters.where,
        price: {
          $gte: priceRange.min,
          $lte: priceRange.max
        }
      };
    }

    // Фильтр по брендам
    if (selectedBrands.length > 0) {
      if (!filters.filterMeta) {
        filters.filterMeta = {};
      }
      filters.filterMeta.brandUuid = {
        in: selectedBrands
      };
    }

    // Сортировка
    if (sortBy === 'price_asc') {
      filters.queryMeta.order = [['price', 'ASC']];
    } else if (sortBy === 'price_desc') {
      filters.queryMeta.order = [['price', 'DESC']];
    } else if (sortBy === 'rating') {
      filters.queryMeta.order = [['rating', 'DESC']];
    } else if (sortBy === 'newest') {
      filters.queryMeta.order = [['createdAt', 'DESC']];
    }

    return qs.stringify(filters);
  };

  const { data: catalogs } = useQuery<{
    data: CatalogItem[];
    meta: ListResult;
  }>({
    queryKey: ['getAllCatalogsBySubCategory', categoryName, subCategoryName, subCategoryUuid || null, sortBy, priceRange, selectedBrands, currentPage],
    queryFn: () => getAllCatalogs(buildQuery()),
    enabled: !!categoryName && !!subCategoryName,
  });

  // Сбрасываем страницу при изменении фильтров
  React.useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, priceRange, selectedBrands]);

  // Получаем бренды через API для подкатегории (если есть UUID)
  const { data: brandsData } = useQuery({
    queryKey: ['getBrandsBySubCategory', subCategoryUuid],
    queryFn: () => getBrandsBySubCategory(subCategoryUuid || ''),
    enabled: !!subCategoryUuid,
    retry: false,
  });

  // Получаем бренды из загруженных товаров
  const brandsFromCatalogs = React.useMemo(() => {
    if (!catalogs?.data) return [];
    const brandMap = new Map<string, BrandItem>();
    catalogs.data.forEach((catalog: CatalogItem) => {
      if (catalog.brand && catalog.brand.uuid && !brandMap.has(catalog.brand.uuid)) {
        brandMap.set(catalog.brand.uuid, catalog.brand);
      }
    });
    return Array.from(brandMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [catalogs?.data]);

  // Используем бренды из API, если они есть, иначе из товаров
  const brands = React.useMemo(() => {
    if (brandsData?.data && brandsData.data.length > 0) {
      return brandsData.data;
    }
    return brandsFromCatalogs;
  }, [brandsData?.data, brandsFromCatalogs]);

  // Сортировка на клиенте для популярности и скидки
  const sortedCatalogs = React.useMemo(() => {
    if (!catalogs?.data) return catalogs;
    
    let sorted = [...catalogs.data];
    
    if (sortBy === 'popularity') {
      sorted.sort((a, b) => {
        const aRating = a.comments?.length || 0;
        const bRating = b.comments?.length || 0;
        return bRating - aRating;
      });
    } else if (sortBy === 'discount') {
      sorted.sort((a, b) => {
        const aPrice = Number(a.price) || 0;
        const bPrice = Number(b.price) || 0;
        return bPrice - aPrice;
      });
    }
    
    return { ...catalogs, data: sorted };
  }, [catalogs, sortBy]);

  const closeMenu = () => setOpenMenu(false);
  const openRightMenu = () => setOpenMenu(true);

  const selectOneSortPanel = () => setSortPanelOne(true);
  const cancelSelectedSortpanel = () => setSortPanelOne(false);

  return (
    <Box className={styles.body}>
      <FilterMenu
        closeMenu={closeMenu}
        isOpen={openMenu}
        openRightMenu={openRightMenu}
      />
      <Breadcrumbs aria-label="breadcrumb" className={styles.breadcrumb}>
        <MuiLink component={Link} color="inherit" href="/">
          Главная
        </MuiLink>
        <MuiLink component={Link} color="inherit" href={categoryPath}>
          {categoryName}
        </MuiLink>
        {selectedBrands.length > 0 && brands.find((b: BrandItem) => selectedBrands.includes(b.uuid)) ? (
          <Typography color="text.primary">
            {brands.find((b: BrandItem) => selectedBrands.includes(b.uuid))?.name || subCategoryName}
          </Typography>
        ) : (
          <Typography color="text.primary">
            {subCategoryName}
          </Typography>
        )}
      </Breadcrumbs>
      <Box className={styles.filterHeader}>
        <Typography className={styles.filterTitle}>
          {subCategoryName}
        </Typography>
        <Typography className={styles.count}>
          {catalogs?.meta?.count || 0} товаров
        </Typography>
      </Box>


      {/* Список дочерних подкатегорий - показываем только если есть товары в текущей подкатегории */}
      {subCategoryData?.children && subCategoryData.children.length > 0 && 
       catalogs?.data && catalogs.data.length > 0 && (
        <Box sx={{ mb: 4, mt: 3 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              mb: 2, 
              color: '#242424',
              fontSize: '18px'
            }}
          >
            Категории
          </Typography>
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            {subCategoryData.children.map((childSubCategory: SubCategoryItem) => {
              // Проверяем, есть ли товары в этой дочерней подкатегории
              const hasProducts = catalogs?.data?.some(
                (catalog: CatalogItem) => catalog.subCategorie?.uuid === childSubCategory.uuid
              ) || false;

              // Показываем дочернюю подкатегорию только если в ней есть товары
              if (!hasProducts) return null;

              return (
                <Link
                  key={childSubCategory.uuid}
                  href={`/catalog/${categoryName}/${childSubCategory.name}`}
                  style={{
                    textDecoration: 'none',
                    color: '#666',
                    fontSize: '14px',
                    padding: '12px 20px',
                    transition: 'all 0.2s ease',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    display: 'inline-block'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#667eea';
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.backgroundColor = '#f5f7ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#666';
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.backgroundColor = '#fff';
                  }}
                >
                  {childSubCategory.name}
                </Link>
              );
            })}
          </Box>
        </Box>
      )}

      <Box className={styles.filterBlock}>
        <Box className={styles.filterPopovers}>
          <SortFilter 
            value={sortBy}
            onChange={setSortBy}
          />
          <PriceFilter
            minPrice={(() => {
              if (!catalogs?.data || catalogs.data.length === 0) return baseMinPrice;
              const prices = catalogs.data
                .map((c: CatalogItem) => Number(c.price) || 0)
                .filter((p) => p > 0);
              if (!prices.length) return baseMinPrice;
              return Math.min(...prices);
            })()}
            maxPrice={(() => {
              if (!catalogs?.data || catalogs.data.length === 0) return baseMaxPrice;
              const prices = catalogs.data
                .map((c: CatalogItem) => Number(c.price) || 0)
                .filter((p) => p > 0);
              if (!prices.length) return baseMaxPrice;
              return Math.max(...prices);
            })()}
            onApply={(min, max) => setPriceRange({ min, max })}
          />
          <BrandFilter
            brands={brands}
            selectedBrands={selectedBrands}
            onChange={setSelectedBrands}
          />
          <Box className={styles.btnGroup}>
            <Button
              className={styles.openBtn}
              variant='contained'
              onClick={openRightMenu}
              startIcon={<TuneIcon />}
            >
              Все фильтры
            </Button>
          </Box>
        </Box>
        <Box className={styles.VerticalToggleButtonsLG}>
          <VerticalToggleButtons
            selectOneSortPanel={selectOneSortPanel}
            cancelSelectedSortpanel={cancelSelectedSortpanel}
          />
        </Box>
      </Box>
      <Box className={styles.mobileFilters}>
        <GridViewIcon />
        <Typography>По популярности</Typography>
        <IconButton onClick={openRightMenu}>
          <TuneIcon />
        </IconButton>
      </Box>
      <Grid className={styles.container} container spacing={2.5}>
        {sortedCatalogs?.data && sortedCatalogs.data.length > 0 ? (
          sortedCatalogs.data.map((catalog: CatalogItem) => (
            <Grid 
              item 
              lg={sortPanelOne ? 4 : 2} 
              md={4} 
              sm={4}
              xs={6} 
              xl={sortPanelOne ? 4 : 2}
              key={catalog.uuid}
            >
              <Box className={styles.cardWrapper}>
                <CatalogCard
                  catalogsPage={true}
                  sortPanelOne={sortPanelOne}
                  catalog={catalog}
                  onNavigate={() =>
                    router.push(
                      `/catalog/${categoryName}/${subCategoryName}/${catalog.uuid}`
                    )
                  }
                />
              </Box>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box 
              display="flex" 
              justifyContent="center" 
              alignItems="center" 
              p={4}
              sx={{ minHeight: '420px' }}
            >
              <Box
                sx={{
                  maxWidth: 560,
                  width: '100%',
                  textAlign: 'center',
                  backgroundColor: '#ffffff',
                  borderRadius: 3,
                  boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)',
                  px: 6,
                  py: 5,
                }}
              >
                <Typography
                  variant="h5"
                  color="text.primary"
                  sx={{ mb: 2, fontWeight: 600, fontSize: '22px' }}
                >
                  В этой подкатегории пока нет товаров
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 4, fontSize: '15px' }}
                >
                  Мы работаем над пополнением ассортимента. Загляните позже!
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => router.push(`/catalog/${categoryName}`)}
                  sx={{
                    mt: 1,
                    px: 4,
                    py: 1.5,
                    borderRadius: '999px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '15px',
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    boxShadow: '0 12px 30px rgba(37, 99, 235, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
                      boxShadow: '0 16px 40px rgba(37, 99, 235, 0.55)',
                    },
                  }}
                >
                  Вернуться в категорию &quot;{categoryName}&quot;
                </Button>
              </Box>
            </Box>
          </Grid>
        )}
      </Grid>
      
      {/* Пагинация */}
      {catalogs?.meta && catalogs.meta.count > ITEMS_PER_PAGE && (
        <Box display="flex" justifyContent="center" mt={4} mb={4}>
          <Pagination
            count={Math.ceil(catalogs.meta.count / ITEMS_PER_PAGE)}
            page={currentPage}
            onChange={(event, value) => setCurrentPage(value)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
}
