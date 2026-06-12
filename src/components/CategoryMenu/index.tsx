import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@homeberris/http/categoryApi';
import { CategoryItem } from '@homeberris/types/category';
import styles from './index.module.css';
import { useParams } from 'next/navigation';

const getLoc = (val: any, locale: string): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[locale] || val.ru || '';
};

const CategoryMenu: React.FC = () => {
  const router = useRouter();
  const routeParams = useParams();
  const locale = (routeParams?.locale as string) || 'ru';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    data: categoriesData,
    isLoading
  } = useQuery({ queryKey: ['getCategories'], queryFn: getCategories });

  const categories = categoriesData?.data || [];

  const handleCategoryClick = (category: CategoryItem) => {
    router.push(`/catalog/${encodeURIComponent(getLoc(category.name, 'en'))}`);
  };

  if (!isClient || isLoading) {
    return null;
  }

  return (
    <Box className={styles.categoryMenu}>
      <Box className={styles.menuContainer}>
        <Box className={styles.menuContent}>
          {categories.slice(0, 10).map((category: CategoryItem) => (
            <Box
              key={category.uuid}
              className={styles.menuItem}
              onClick={() => handleCategoryClick(category)}
            >
              <Typography className={styles.menuItemText}>
                {getLoc(category.name, locale)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default CategoryMenu;
