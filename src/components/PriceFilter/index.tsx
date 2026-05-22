import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, Divider, Slider } from '@mui/material';
import BasicPopover from '../BasicPopover';
import styles from './index.module.css';

interface PriceFilterProps {
  minPrice?: number;
  maxPrice?: number;
  onApply?: (min: number, max: number) => void;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU').format(Math.round(price));
};

const PriceFilter: React.FC<PriceFilterProps> = ({ 
  minPrice: initialMin = 0, 
  maxPrice: initialMax = 100000000,
  onApply 
}) => {
  const [minPrice, setMinPrice] = useState<number>(initialMin);
  const [maxPrice, setMaxPrice] = useState<number>(initialMax);
  const [tempMin, setTempMin] = useState<number>(initialMin);
  const [tempMax, setTempMax] = useState<number>(initialMax);
  const [isActive, setIsActive] = useState<boolean>(false);

  // Обновляем локальное состояние, когда меняется диапазон цен из пропсов
  useEffect(() => {
    setMinPrice(initialMin);
    setMaxPrice(initialMax);
    setTempMin(initialMin);
    setTempMax(initialMax);
    setIsActive(false);
  }, [initialMin, initialMax]);

  const title = isActive 
    ? `${formatPrice(tempMin)} - ${formatPrice(tempMax)} ₽`
    : 'Цена, ₽';

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setTempMin(Math.max(0, Math.min(value, tempMax - 1000)));
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || initialMax;
    setTempMax(Math.min(initialMax, Math.max(value, tempMin + 1000)));
  };

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    const [min, max] = newValue as number[];
    setTempMin(min);
    setTempMax(max);
  };

  const handleApply = () => {
    setMinPrice(tempMin);
    setMaxPrice(tempMax);
    setIsActive(true);
    onApply?.(tempMin, tempMax);
  };

  const handleReset = () => {
    setTempMin(initialMin);
    setTempMax(initialMax);
    setMinPrice(initialMin);
    setMaxPrice(initialMax);
    setIsActive(false);
    onApply?.(initialMin, initialMax);
  };

  return (
    <BasicPopover 
      title={title} 
      active={isActive}
    >
      <Box className={styles.popoverContent}>
        <Typography className={styles.popoverTitle}>Цена</Typography>
        <Divider sx={{ my: 1.5 }} />
        
        <Box className={styles.inputsContainer}>
          <TextField
            label="От"
            type="number"
            value={tempMin}
            onChange={handleMinChange}
            className={styles.priceInput}
            size="small"
            InputProps={{
              endAdornment: <Typography variant="body2" color="text.secondary">₽</Typography>
            }}
          />
          <Typography className={styles.dash}>—</Typography>
          <TextField
            label="До"
            type="number"
            value={tempMax}
            onChange={handleMaxChange}
            className={styles.priceInput}
            size="small"
            InputProps={{
              endAdornment: <Typography variant="body2" color="text.secondary">₽</Typography>
            }}
          />
        </Box>

        <Box className={styles.sliderContainer}>
          <Slider
            value={[tempMin, tempMax]}
            onChange={handleSliderChange}
            min={initialMin}
            max={initialMax}
            step={100}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${formatPrice(value)} ₽`}
            className={styles.slider}
            sx={{
              color: '#667eea',
              '& .MuiSlider-thumb': {
                border: '2px solid white',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
              },
              '& .MuiSlider-track': {
                border: 'none',
              },
            }}
          />
        </Box>

        <Box className={styles.actionsContainer}>
          {isActive && (
            <Button
              variant="text"
              onClick={handleReset}
              className={styles.resetButton}
            >
              Сбросить
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleApply}
            className={styles.applyButton}
              fullWidth={!isActive}
          >
            Применить
          </Button>
        </Box>
      </Box>
    </BasicPopover>
  );
};

export default PriceFilter;
