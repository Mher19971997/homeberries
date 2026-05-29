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
  Link as MuiLink,
  Chip
} from '@mui/material';

import { getAllCatalogs } from '@homeberris/http/catalogApi';
import { getMenuTree } from '@homeberris/http/categoryApi';
import { getBrandsByCategory } from '@homeberris/http/brandApi';
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

// styles
import styles from '@homeberris/pages/catalog/[category]/index.module.css';
import { QueryClient, dehydrate, useQuery } from '@tanstack/react-query';
import FilterMenu from '@homeberris/layouts/FilterMenu';
import TuneIcon from '@mui/icons-material/Tune';
import { ListResult } from '@homeberris/types/filter';
import FavoriteItem from '@homeberris/features/favorites/components/FavoriteItems';

export default function CatalogPage() {

  const router = useRouter();
  const params = useParams();
  const category = params?.category;
  const categoryName = typeof category === 'string' ? decodeURIComponent(category) : '';

  // Формируем путь для breadcrumbs на основе текущего маршрута
  const breadcrumbPath = categoryName ? `/catalog/${encodeURIComponent(categoryName)}` : '/catalog';

  const [openMenu, setOpenMenu] = React.useState<boolean>(false);
  const [sortPanelOne, setSortPanelOne] = React.useState<boolean>(false);
  const [sortBy, setSortBy] = React.useState<string>('popularity');
  const [priceRange, setPriceRange] = React.useState<{ min: number; max: number } | null>(null);
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>([]);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  const ITEMS_PER_PAGE = 20;

  // Базовый диапазон цен (будет уточнён после загрузки товаров)
  const baseMinPrice = 0;
  const baseMaxPrice = 100000000;

  // Получаем дерево меню для отображения подкатегорий
  const { data: menuTree } = useQuery({ queryKey: ['getMenuTree'], queryFn: getMenuTree });
  const categories = menuTree || [];
  const categoryData = categories.find((c: CategoryItem) => c.name === categoryName);
  const categoryUuid = categoryData?.uuid;
  const subCategories = categoryData?.subCategories || [];

  // Получаем бренды для категории
  const { data: brandsData } = useQuery({
    queryKey: ['getBrandsByCategory', categoryUuid],
    queryFn: () => getBrandsByCategory(categoryUuid || ''),
    enabled: !!categoryUuid,
  });
  const brands = brandsData?.data || [];

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
    queryKey: ['getAllCatalogsByCategory', categoryName, sortBy, priceRange, selectedBrands, currentPage],
    queryFn: () => getAllCatalogs(buildQuery()),
    enabled: !!categoryName,
  });

  // Сбрасываем страницу при изменении фильтров
  React.useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, priceRange, selectedBrands]);

  // Сортировка на клиенте для популярности и скидки
  const sortedCatalogs = React.useMemo(() => {
    if (!catalogs?.data) return catalogs;

    let sorted = [...catalogs.data];

    if (sortBy === 'popularity') {
      // Сортируем по популярности (можно добавить поле popularity в будущем)
      sorted.sort((a, b) => {
        const aRating = a.comments?.length || 0;
        const bRating = b.comments?.length || 0;
        return bRating - aRating;
      });
    } else if (sortBy === 'discount') {
      // Сортируем по размеру скидки
      sorted.sort((a, b) => {
        const aPrice = Number(a.price) || 0;
        const bPrice = Number(b.price) || 0;
        // Предполагаем, что есть старое поле цены (можно добавить в будущем)
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
        <MuiLink component={Link} color="inherit" href={breadcrumbPath}>
          {categoryName}
        </MuiLink>
      </Breadcrumbs>
      <Box className={styles.filterHeader}>
        <Typography className={styles.filterTitle}>
          {categoryName}
        </Typography>
        <Typography className={styles.count}>
          {catalogs?.meta?.count || 0} товаров
        </Typography>
      </Box>


      {/* Список подкатегорий - flex layout */}
      {subCategories.length > 0 && (
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
              display: { xs: 'flex', md: 'none' },
              overflowX: 'auto',
              gap: 1,
              mb: 2,
              pb: 1,
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {subCategories.map((subCategory: SubCategoryItem) => {
              // Проверяем, есть ли товары в этой подкатегории
              const hasProducts = catalogs?.data?.some(
                (catalog: CatalogItem) => catalog.subCategorie?.uuid === subCategory.uuid
              ) || false;

              // Показываем подкатегорию только если в ней есть товары или если она не имеет дочерних элементов
              const shouldShow = hasProducts || (!subCategory.children || subCategory.children.length === 0);

              if (!shouldShow) return null;

              return (
                <Chip
                  key={subCategory.uuid}
                  onClick={() => router.push(`/catalog/${categoryName}/${subCategory.name}`)}
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
                  label={subCategory.name}
                />
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
            <FavoriteItem sortPanelOne={sortPanelOne} catalog={catalog} />
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
                  В этой категории пока нет товаров
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
                  onClick={() => router.push('/catalog')}
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
                  Перейти в каталог
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

