import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import styles from './index.module.css';

interface ProductSizeSelectorProps {
  sizes?: string[];
  onSizeSelect?: (size: string) => void;
}

const ProductSizeSelector: React.FC<ProductSizeSelectorProps> = ({
  sizes = ['XXS (42)', 'XS (44)', 'S (46)', 'M (48)', 'L (50)', 'XL (52)', 'XXL (54)', '3XL (56)', '4XL (58)', '5XL (60)'],
  onSizeSelect
}) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizeChart, setShowSizeChart] = useState(false);

  const handleSizeClick = (size: string) => {
    setSelectedSize(size);
    onSizeSelect?.(size);
  };

  return (
    <Box className={styles.container}>
      <Box className={styles.header}>
        <Typography className={styles.title}>Таблица размеров</Typography>
        <Button
          className={styles.sizeChartButton}
          onClick={() => setShowSizeChart(!showSizeChart)}
          endIcon={<ArrowForwardIosIcon className={showSizeChart ? styles.rotated : ''} />}
        >
          Таблица размеров
        </Button>
      </Box>
      <Box className={styles.sizesGrid}>
        {sizes.map((size) => {
          const isSelected = selectedSize === size;
          const isUnavailable = size === 'XL (52)'; // Пример недоступного размера
          return (
            <Button
              key={size}
              className={`${styles.sizeButton} ${isSelected ? styles.selected : ''} ${isUnavailable ? styles.unavailable : ''}`}
              onClick={() => !isUnavailable && handleSizeClick(size)}
              disabled={isUnavailable}
            >
              {size}
            </Button>
          );
        })}
      </Box>
    </Box>
  );
};

export default ProductSizeSelector;
