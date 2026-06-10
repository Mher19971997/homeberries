import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  CircularProgress,
  Divider
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { useQuery } from '@tanstack/react-query';
import { getCategories, getSubCategories } from '@homeberris/http/categoryApi';
import { CategoryItem, SubCategoryItem } from '@homeberris/types/category';
import styles from './index.module.css';

interface CategorySelectorProps {
  onCategorySelect?: (category: CategoryItem) => void;
  onSubCategorySelect?: (subCategory: SubCategoryItem) => void;
  selectedCategoryUuid?: string;
  selectedSubCategoryUuid?: string;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  onCategorySelect,
  onSubCategorySelect,
  selectedCategoryUuid,
  selectedSubCategoryUuid
}) => {
  const router = useRouter();
  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    selectedCategoryUuid || null
  );

  // Загрузка категорий
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError
  } = useQuery({ queryKey: ['getCategories'], queryFn: getCategories });

  // Загрузка подкатегорий для выбранной категории
  const {
    data: subCategoriesData,
    isLoading: isLoadingSubCategories
  } = useQuery({
    queryKey: ['getSubCategories', selectedCategory],
    queryFn: () => getSubCategories(selectedCategory || undefined),
    enabled: !!selectedCategory,
  });

  const categories = categoriesData?.data || [];
  const subCategories = subCategoriesData?.data || [];

  // Обработка клика по категории
  const handleCategoryClick = (category: CategoryItem) => {
    const categoryUuid = category.uuid;
    const isOpen = openCategories[categoryUuid];

    setOpenCategories({
      ...openCategories,
      [categoryUuid]: !isOpen
    });

    if (!isOpen) {
      setSelectedCategory(categoryUuid);
      onCategorySelect?.(category);
    } else {
      setSelectedCategory(null);
    }
  };

  // Обработка клика по категории - переход на страницу категории
  const handleCategoryClickForNavigation = (category: CategoryItem) => {
    router.push(`/catalog/${category.name}`);
  };

  // Обработка клика по подкатегории
  const handleSubCategoryClick = (subCategory: SubCategoryItem, category: CategoryItem) => {
    onSubCategorySelect?.(subCategory);
    // Переход на страницу категории, подкатегория будет использована для фильтрации
    router.push(`/catalog/${category.name}`);
  };

  if (isLoadingCategories) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Загрузка категорий...
        </Typography>
      </Box>
    );
  }

  if (categoriesError) {
    return (
      <Box p={2}>
        <Typography color="error" variant="body2">
          Ошибка загрузки категорий. Пожалуйста, попробуйте позже.
        </Typography>
      </Box>
    );
  }

  if (categories.length === 0) {
    return (
      <Box p={2}>
        <Typography variant="body2" color="text.secondary">
          Категории не найдены
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={styles.categorySelector}>
      <Typography variant="h6" className={styles.title} gutterBottom>
        Категории
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <List component="nav" className={styles.categoryList}>
        {categories.map((category: CategoryItem) => {
          const isOpen = openCategories[category.uuid] || false;
          const isSelected = selectedCategory === category.uuid;
          const categorySubCategories = subCategories.filter(
            (sub: SubCategoryItem) => sub.categoryUuid === category.uuid
          );

          return (
            <React.Fragment key={category.uuid}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleCategoryClick(category)}
                  onDoubleClick={() => handleCategoryClickForNavigation(category)}
                  selected={isSelected}
                  className={styles.categoryItem}
                >
                  <ListItemText
                    primary={category.name}
                    primaryTypographyProps={{
                      fontWeight: isSelected ? 600 : 400
                    }}
                    onClick={() => handleCategoryClickForNavigation(category)}
                    sx={{ cursor: 'pointer', flex: 1 }}
                  />
                  {categorySubCategories.length > 0 && (
                    <Box onClick={(e) => e.stopPropagation()}>
                      {isOpen ? <ExpandLess /> : <ExpandMore />}
                    </Box>
                  )}
                </ListItemButton>
              </ListItem>
              {categorySubCategories.length > 0 && (
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding className={styles.subCategoryList}>
                    {isLoadingSubCategories ? (
                      <ListItem>
                        <CircularProgress size={20} />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          Загрузка...
                        </Typography>
                      </ListItem>
                    ) : (
                      categorySubCategories.map((subCategory: SubCategoryItem) => (
                        <ListItemButton
                          key={subCategory.uuid}
                          sx={{ pl: 4 }}
                          selected={selectedSubCategoryUuid === subCategory.uuid}
                          onClick={() => handleSubCategoryClick(subCategory, category)}
                          className={styles.subCategoryItem}
                        >
                          <ListItemText
                            primary={subCategory.name}
                            primaryTypographyProps={{
                              fontSize: '0.9rem'
                            }}
                          />
                        </ListItemButton>
                      ))
                    )}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );
};

export default CategorySelector;
