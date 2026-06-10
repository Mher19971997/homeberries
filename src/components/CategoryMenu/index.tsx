import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@homeberris/http/categoryApi';
import { CategoryItem } from '@homeberris/types/category';
import styles from './index.module.css';

const CategoryMenu: React.FC = () => {
  const router = useRouter();
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
    router.push(`/catalog/${category.name}`);
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
                {category.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default CategoryMenu;
