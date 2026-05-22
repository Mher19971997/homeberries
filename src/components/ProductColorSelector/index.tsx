import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import styles from './index.module.css';

interface ColorOption {
  name: string;
  value: string; // hex color
  image?: string;
}

interface ProductColorSelectorProps {
  colors?: ColorOption[];
  onColorSelect?: (color: ColorOption) => void;
}

const ProductColorSelector: React.FC<ProductColorSelectorProps> = ({
  colors = [
    { name: 'черный', value: '#000000' },
    { name: 'белый', value: '#FFFFFF' },
    { name: 'бежевый', value: '#F5F5DC' },
    { name: 'бирюзовый', value: '#40E0D0' },
    { name: 'светло-серый', value: '#D3D3D3' },
    { name: 'темно-серый', value: '#696969' }
  ],
  onColorSelect
}) => {
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(colors[0] || null);

  const handleColorClick = (color: ColorOption) => {
    setSelectedColor(color);
    onColorSelect?.(color);
  };

  return (
    <Box className={styles.container}>
      <Typography className={styles.label}>Цвет:</Typography>
      <Box className={styles.colorsContainer}>
        {colors.map((color) => {
          const isSelected = selectedColor?.name === color.name;
          return (
            <Box
              key={color.name}
              className={`${styles.colorItem} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleColorClick(color)}
            >
              <Box
                className={styles.colorCircle}
                style={{ backgroundColor: color.value }}
              />
              <Typography className={styles.colorName}>{color.name}</Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ProductColorSelector;
