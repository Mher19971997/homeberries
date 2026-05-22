import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  CircularProgress,
  Grid
} from '@mui/material';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { getMenuTree } from '@homeberris/http/categoryApi';
import { CategoryItem, SubCategoryItem } from '@homeberris/types/category';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import styles from './index.module.css';

interface CategoryMultiDropdownProps {
  onCategorySelect?: (category: CategoryItem) => void;
  onSubCategorySelect?: (subCategory: SubCategoryItem) => void;
  onCloseMenu?: () => void;
}

const CategoryMultiDropdown: React.FC<CategoryMultiDropdownProps> = ({
  onCategorySelect,
  onSubCategorySelect,
  onCloseMenu
}) => {
  const router = useRouter();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [subCategoryPosition, setSubCategoryPosition] = useState({ top: 0, left: 0 });
  const [isClient, setIsClient] = useState(false);
  const categoryRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const subCategoryPanelRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Проверка на клиентскую сторону
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Загрузка полного дерева меню
  const {
    data: menuTree,
    isLoading: isLoadingCategories
  } = useQuery('getMenuTree', getMenuTree);

  const categories = menuTree || [];

  // Обработка наведения на категорию
  const handleCategoryMouseEnter = (category: CategoryItem, event: React.MouseEvent<HTMLDivElement>) => {
    if (!isClient) return;
    
    // Очищаем предыдущий таймаут
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    const categoryUuid = category.uuid;
    setHoveredCategory(categoryUuid);
    onCategorySelect?.(category);
    // Панель подкатегорий на весь экран справа от левого меню
    // (ширина левого меню сейчас 300px, см. LeftMenu/index.module.css)
    if (typeof window !== 'undefined') {
      setSubCategoryPosition({
        top: 0,
        left: 300
      });
    }
  };

  const handleCategoryMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isClient) return;

    // Проверяем, не переходим ли мы на панель подкатегорий
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (relatedTarget && subCategoryPanelRef.current?.contains(relatedTarget)) {
      return; // Не закрываем, если переходим на панель
    }
    
    // Не закрываем сразу, даем время перейти на панель подкатегорий
    hoverTimeoutRef.current = setTimeout(() => {
      if (subCategoryPanelRef.current && typeof window !== 'undefined') {
        const panelElement = subCategoryPanelRef.current;
        if (!panelElement.matches(':hover')) {
          setHoveredCategory(null);
        }
      }
    }, 150);
  };

  // Очистка таймаута при размонтировании
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleSubCategoryPanelMouseEnter = () => {
    // Оставляем панель открытой
  };

  const handleSubCategoryPanelMouseLeave = () => {
    setHoveredCategory(null);
  };

  // Обработка клика по категории
  const handleCategoryClick = (category: CategoryItem) => {
    router.push(`/catalog/${category.name}`);
    setHoveredCategory(null);
    onCloseMenu?.();
  };

  // Обработка клика по подкатегории
  const handleSubCategoryClick = (subCategory: SubCategoryItem, category: CategoryItem, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    // Если есть дочерние элементы, не переходим, а показываем их
    if (subCategory.children && subCategory.children.length > 0) {
      return;
    }
    
    onSubCategorySelect?.(subCategory);
    router.push(`/catalog/${category.name}/${subCategory.name}`);
    setHoveredCategory(null);
    onCloseMenu?.();
  };

  // Получаем категорию с подкатегориями для текущей наведенной категории
  const hoveredCategoryData = hoveredCategory
    ? categories.find((c: CategoryItem) => c.uuid === hoveredCategory)
    : null;

  // Рекурсивная функция для отображения подкатегорий
  const renderSubCategories = (subCategories: SubCategoryItem[] = [], level: number = 0, category: CategoryItem) => {
    if (!subCategories || subCategories.length === 0) return null;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {subCategories.map((subCategory: SubCategoryItem) => {
          const hasChildren = subCategory.children && subCategory.children.length > 0;
          
          return (
            <Box key={subCategory.uuid} sx={{ position: 'relative' }}>
              <ListItemButton
                onClick={(e) => handleSubCategoryClick(subCategory, category, e)}
                className={styles.subCategoryItem}
                sx={{
                  pl: `${16 + level * 16}px !important`,
                  py: '8px !important',
                  '&:hover': {
                    backgroundColor: hasChildren ? 'rgba(102, 126, 234, 0.12)' : 'rgba(102, 126, 234, 0.08)',
                  }
                }}
              >
                <ListItemText
                  primary={subCategory.name}
                  primaryTypographyProps={{
                    fontSize: '14px',
                    fontWeight: hasChildren ? 600 : 400
                  }}
                />
                {hasChildren && (
                  <ArrowForwardIosIcon sx={{ fontSize: 14, ml: 1, color: '#667eea' }} />
                )}
              </ListItemButton>
              {hasChildren && (
                <Box sx={{ pl: 2, borderLeft: '2px solid #e8e8f0', ml: 2 }}>
                  {renderSubCategories(subCategory.children, level + 1, category)}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Box className={styles.categoryMultiDropdown}>
      {isLoadingCategories ? (
        <Box display="flex" justifyContent="center" alignItems="center" p={3}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <List component="nav" className={styles.categoryList}>
          {categories.map((category: CategoryItem) => {
            const hasSubCategories = category.subCategories && category.subCategories.length > 0;
            const isHovered = hoveredCategory === category.uuid;

            return (
              <ListItem
                key={category.uuid}
                disablePadding
                ref={(el) => {
                  categoryRefs.current[category.uuid] = el;
                }}
              >
                <ListItemButton
                  onMouseEnter={(e) => handleCategoryMouseEnter(category, e)}
                  onMouseLeave={(e) => handleCategoryMouseLeave(e)}
                  onClick={() => handleCategoryClick(category)}
                  className={`${styles.categoryItem} ${isHovered ? styles.categoryItemHovered : ''}`}
                >
                  <ListItemText
                    primary={category.name}
                    primaryTypographyProps={{
                      fontSize: '14px',
                      fontWeight: isHovered ? 600 : 400
                    }}
                  />
                  {hasSubCategories && (
                    <ArrowForwardIosIcon sx={{ fontSize: 16, ml: 1 }} />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      )}

      {/* Панель подкатегорий - рендерим только на клиенте */}
      {isClient && hoveredCategory && hoveredCategoryData && hoveredCategoryData.subCategories && hoveredCategoryData.subCategories.length > 0 && (
        <Paper
          ref={subCategoryPanelRef}
          className={styles.subCategoryPanel}
          onMouseEnter={handleSubCategoryPanelMouseEnter}
          onMouseLeave={handleSubCategoryPanelMouseLeave}
          sx={{
            position: 'fixed',
            top: `${subCategoryPosition.top}px`,
            left: `${subCategoryPosition.left}px`,
            right: 0,
            bottom: 0,
            zIndex: 1001,
            width: 'calc(100vw - 70%)',
            maxWidth: 'none',
            maxHeight: '100vh',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          <Box className={styles.subCategoryHeader}>
            <Typography variant="h6" fontWeight={600}>
              {hoveredCategoryData.name}
            </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {hoveredCategoryData.subCategories.map((subCategory: SubCategoryItem) => {
                const hasChildren = subCategory.children && subCategory.children.length > 0;
                
                return (
                  <Grid item xs={hasChildren ? 6 : 12} key={subCategory.uuid}>
                    <Box
                      sx={{
                        borderRight: hasChildren ? '1px solid #e8e8f0' : 'none',
                        pr: hasChildren ? 2 : 0
                      }}
                    >
                      <ListItemButton
                        onClick={(e) => handleSubCategoryClick(subCategory, hoveredCategoryData, e)}
                        className={styles.subCategoryItem}
                        sx={{
                          py: '10px !important',
                          px: '12px !important',
                          borderRadius: '8px',
                          mb: hasChildren ? 1 : 0.5,
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          }
                        }}
                      >
                        <ListItemText
                          primary={subCategory.name}
                          primaryTypographyProps={{
                            fontSize: '15px',
                            fontWeight: hasChildren ? 600 : 500
                          }}
                        />
                        {hasChildren && (
                          <ArrowForwardIosIcon sx={{ fontSize: 14, ml: 1, color: '#667eea' }} />
                        )}
                      </ListItemButton>
                      {hasChildren && (
                        <Box sx={{ pl: 1 }}>
                          {renderSubCategories(subCategory.children, 0, hoveredCategoryData)}
                        </Box>
                      )}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default CategoryMultiDropdown;
