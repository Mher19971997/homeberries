'use client';

import React from 'react';
import {
  Box,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Tooltip,
  Typography,
  Divider
} from '@mui/material';
import ICamera from '../Icons/ICamera';
import ISearch from '../Icons/ISearch';
import styles from '@homeberris/components/SearchInput/index.module.css';
import SarchAutoCompliteItem from '../SarchAutoCompliteItem';
import { useQuery } from '@tanstack/react-query';
import { searchCatalog } from '@homeberris/http/catalogApi';
import { searchCategories } from '@homeberris/http/categoryApi';
// import { searchCars } from '@homeberris/http/carApi';
import qs from 'qs';
import { useDebounce } from '@homeberris/hooks/useDebounce';
import PhotoSearchModal from '../PhotoSearchModal';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import FolderIcon from '@mui/icons-material/Folder';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useTranslation } from 'react-i18next';

interface SearchInputProps {}

const SearchInput: React.FC<SearchInputProps> = () => {
  const { t } = useTranslation('common');
  const [focused, setFocused] = React.useState(false);
  const [checkSearch, setCheckSearch] = React.useState(false);
  const [photoSearchOpen, setPhotoSearchOpen] = React.useState(false);
  const router = useRouter();
  
  const onFocus = () => {
    setFocused(true);
    setCheckSearch(true);
  };
  const onBlur = () => {
    // Задержка для клика по результатам
    setTimeout(() => {
      setFocused(false);
    }, 200);
  };
  const [catalogName, setCatalogName] = React.useState('');
  const debaunceSearch = useDebounce(catalogName, 300);

  // Поиск по каталогу
  const { data: filterCatalogs } = useQuery({
    queryKey: ['searchCatalog', debaunceSearch],
    queryFn: () =>
      searchCatalog(
        qs.stringify({
          filterMeta: {
            websearchQuery: {
              name: debaunceSearch
            }
          },
          queryMeta: {
            limit: 5
          }
        })
      ),
    enabled: !!debaunceSearch && debaunceSearch.length > 0
  });

  // Поиск по категориям
  const { data: filterCategories } = useQuery({
    queryKey: ['searchCategories', debaunceSearch],
    queryFn: () => searchCategories(debaunceSearch),
    enabled: !!debaunceSearch && debaunceSearch.length > 0
  });

  // Поиск по автомобилям
  // const { data: filterCars } = useQuery(
  //   ['searchCars', debaunceSearch],
  //   () => searchCars(debaunceSearch),
  //   {
  //     enabled: !!debaunceSearch && debaunceSearch.length > 0,
  //   }
  // );

  const handlePhotoSearch = async (imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      // Здесь будет запрос к backend для поиска по изображению
      // Пока что перенаправляем на страницу каталога
      router.push('/catalog');
    } catch (error) {
      console.error('Ошибка поиска по фото:', error);
    }
  };

  const hasResults = 
    (filterCatalogs && (filterCatalogs as any).data && (filterCatalogs as any).data.length > 0) ||
    (filterCategories?.data && filterCategories.data.length > 0)
    // (filterCars && (filterCars as any).data && (filterCars as any).data.length > 0);

  return (
    <Box className={styles.body}>
      <OutlinedInput
        onFocus={onFocus}
        onBlur={onBlur}
        value={catalogName}
        onChange={(e: any) => {
          setCatalogName(e.target.value);
        }}
        onKeyPress={(e: any) => {
          if (e.key === 'Enter' && catalogName.trim()) {
            router.push(`/catalog?search=${encodeURIComponent(catalogName.trim())}`);
            setCheckSearch(false);
            setCatalogName('');
            setFocused(false);
          }
        }}
        className={[
          ((focused && !!catalogName.length) && styles.focusedInput) || styles.input,
          checkSearch && styles.focusedInputInSelect].join(' ')
        }
        required
        fullWidth
        placeholder={`${t('search.placeholderSpecific')}`}
        endAdornment={
          <InputAdornment position='end'>
            <Tooltip title={`${t('search.photoTitle')}`}>
              <IconButton 
                edge='end'
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  setPhotoSearchOpen(true);
                }}
              >
                <ICamera color={(!focused && '#9d9da5') || 'black'} />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        }
        startAdornment={
          <InputAdornment position='start'>
            <IconButton 
              edge='start'
              onClick={() => {
                if (catalogName.trim()) {
                  router.push(`/catalog?search=${encodeURIComponent(catalogName.trim())}`);
                  setCheckSearch(false);
                  setCatalogName('');
                  setFocused(false);
                }
              }}
            >
              <ISearch color={(!focused && '#9d9da5') || 'black'} />
            </IconButton>
          </InputAdornment>
        }
      />
      {(focused && (hasResults || debaunceSearch.length > 0)) && (
        <Box className={styles.autoComplite}>
          {filterCategories?.data && filterCategories.data.length > 0 && (
            <>
              <Box className={styles.sectionHeader}>
                <FolderIcon className={styles.sectionIcon} />
                <Typography className={styles.sectionTitle}>Категории</Typography>
              </Box>
              {filterCategories.data.map((category: any, index: number) => (
                <SarchAutoCompliteItem
                  key={`category-${index}`}
                  name={category.name}
                  uuid={category.uuid}
                  type="category"
                  checkSearch={checkSearch}
                  setCheckSearch={setCheckSearch}
                  setCatalogName={setCatalogName}
                  catalogName={catalogName}
                />
              ))}
              {filterCatalogs && (filterCatalogs as any).data && (filterCatalogs as any).data.length > 0 && (
                <Divider sx={{ my: 1 }} />
              )}
            </>
          )}
          {filterCatalogs && (filterCatalogs as any).data && (filterCatalogs as any).data.length > 0 && (
            <>
              {(!filterCategories?.data || filterCategories.data.length === 0) && (
                <Box className={styles.sectionHeader}>
                  <InventoryIcon className={styles.sectionIcon} />
                  <Typography className={styles.sectionTitle}>Товары</Typography>
                </Box>
              )}
              {(filterCatalogs as any).data.map((catalog: any, index: number) => (
                <SarchAutoCompliteItem
                  key={`catalog-${index}`}
                  name={catalog.name}
                  uuid={catalog.uuid}
                  categoryName={catalog.category?.name || 'Каталог'}
                  subCategoryName={catalog.subCategorie?.name}
                  type="catalog"
                  checkSearch={checkSearch}
                  setCheckSearch={setCheckSearch}
                  setCatalogName={setCatalogName}
                  catalogName={catalogName}
                />
              ))}
            </>
          )}

          {/* {filterCars && (filterCars as any).data && (filterCars as any).data.length > 0 && (
            <>
              <Box className={styles.sectionHeader}>
                <InventoryIcon className={styles.sectionIcon} />
                <Typography className={styles.sectionTitle}>Автомобили</Typography>
              </Box>
              {(filterCars as any).data.map((car: any, index: number) => (
                <SarchAutoCompliteItem
                  key={`car-${index}`}
                  name={car.title}
                  uuid={car.uuid}
                  type="car"
                  checkSearch={checkSearch}
                  setCheckSearch={setCheckSearch}
                  setCatalogName={setCatalogName}
                  catalogName={catalogName}
                />
              ))}
            </>
          )} */}

          {!hasResults && debaunceSearch.length > 0 && (
            <Box className={styles.noResults}>
              <Typography className={styles.noResultsText}>
                Ничего не найдено
              </Typography>
            </Box>
          )}
        </Box>
      )}
      <PhotoSearchModal
        open={photoSearchOpen}
        onClose={() => setPhotoSearchOpen(false)}
        onSearch={handlePhotoSearch}
      />
    </Box>
  );
};

export default SearchInput;
