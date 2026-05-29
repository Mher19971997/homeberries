import React from 'react';
import { Box, Typography, Chip, IconButton } from '@mui/material';
import Image from 'next/image';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import styles from './index.module.css';
import type { Car } from '@homeberris/http/carApi';
import { useFavorites } from '@homeberris/context/favoritesContext';

interface CarCardProps {
  car: Car;
  brandName?: string;
  modelName?: string;
  bodyType?: string; // Тип кузова из subModel
  onClick?: () => void;
}

const CarCard: React.FC<CarCardProps> = ({ car, brandName, modelName, bodyType, onClick }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const mainImagePath = car.main_image
    ? (car.main_image.startsWith('/') ? car.main_image : `/${car.main_image}`)
    : '/images/cardEmpty.png';

  const title = car.title || `${brandName || ''} ${modelName || ''} ${car.year || ''}`.trim();

  const formatNumber = (value?: number) =>
    typeof value === 'number' ? new Intl.NumberFormat('ru-RU').format(value) : '';

  // Преобразуем автомобиль в формат для избранного
  const carAsCatalogItem = {
    uuid: car.uuid as any,
    name: car.title,
    description: car.description || '',
    price: car.price.toString(),
    categoryUuid: car.brand_id || '',
    subCategoryUuid: car.model_id || '',
    images: car.main_image ? [{ image: car.main_image }] : [],
    category: { name: brandName || '' },
    subCategorie: { name: modelName || '' },
    colors: [],
    infos: [],
    comments: [],
    groupOption: [],
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(carAsCatalogItem as any);
  };

  // Перевод типа кузова на русский
  const getBodyTypeLabel = (type?: string) => {
    if (!type) return '';
    const bodyTypes: { [key: string]: string } = {
      sedan: 'Седан',
      hatchback: 'Хэтчбек',
      wagon: 'Универсал',
      coupe: 'Купе',
      suv: 'Внедорожник',
      crossover: 'Кроссовер',
      minivan: 'Минивэн',
      pickup: 'Пикап',
      convertible: 'Кабриолет',
    };
    return bodyTypes[type.toLowerCase()] || type;
  };

  return (
    <Box className={styles.card} onClick={onClick}>
      <Box className={styles.imageContainer}>
        <Box className={styles.image}>
          <Image
            src={baseUrl + mainImagePath}
            alt={title}
            fill
            style={{ objectFit: 'cover' }}
          />
        </Box>
        <Box className={styles.badgeRow}>
          {car.is_new && <Chip size="small" color="primary" label="Новый" />}
          {car.mileage === 0 && !car.is_new && (
            <Chip size="small" color="secondary" label="Без пробега" />
          )}
          {bodyType && (
            <Chip size="small" label={getBodyTypeLabel(bodyType)} sx={{ bgcolor: 'rgba(102, 126, 234, 0.9)', color: 'white' }} />
          )}
        </Box>
        <IconButton
          className={styles.favoriteButton}
          onClick={handleFavoriteClick}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 2,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
          }}
        >
          {isFavorite(car.uuid) ? (
            <FavoriteIcon sx={{ color: '#ff6b9d', fontSize: 24 }} />
          ) : (
            <FavoriteBorderIcon sx={{ color: '#666', fontSize: 24 }} />
          )}
        </IconButton>
      </Box>

      <Box className={styles.info}>
        <Box className={styles.titleRow}>
          <Box flex={1}>
            <Typography className={styles.title}>{title}</Typography>
            <Typography className={styles.subtitle}>
              {brandName && `${brandName} `}
              {modelName}
              {car.year ? ` · ${car.year} г.` : ''}
            </Typography>
          </Box>
        </Box>
        <Box className={styles.priceContainer}>
          <Typography className={styles.price}>
            {formatNumber(car.price)} {car.currency || '₽'}
          </Typography>
        </Box>

        <Box className={styles.chipRow}>
          {car.engine_volume && (
            <Chip
              size="small"
              label={`${car.engine_volume} л`}
              variant="outlined"
            />
          )}
          {car.engine_power_hp && (
            <Chip
              size="small"
              label={`${car.engine_power_hp} л.с.`}
              variant="outlined"
            />
          )}
          {car.transmission && (
            <Chip
              size="small"
              label={car.transmission === 'automatic' ? 'Автомат' : car.transmission === 'manual' ? 'Механика' : car.transmission}
              variant="outlined"
            />
          )}
          {car.drive_type && (
            <Chip
              size="small"
              label={car.drive_type === 'awd' ? 'Полный привод' : car.drive_type === 'fwd' ? 'Передний привод' : car.drive_type === 'rwd' ? 'Задний привод' : car.drive_type}
              variant="outlined"
            />
          )}
        </Box>

        <Box className={styles.specRow}>
          {car.mileage !== undefined && (
            <Box>
              <Typography className={styles.specLabel}>Пробег</Typography>
              <Typography className={styles.specValue}>
                {formatNumber(car.mileage)} км
              </Typography>
            </Box>
          )}
          {car.color && (
            <Box>
              <Typography className={styles.specLabel}>Цвет</Typography>
              <Typography className={styles.specValue}>{car.color}</Typography>
            </Box>
          )}
          {car.tire_size && (
            <Box>
              <Typography className={styles.specLabel}>Шины</Typography>
              <Typography className={styles.specValue}>{car.tire_size}</Typography>
            </Box>
          )}
          {car.wheel_size && (
            <Box>
              <Typography className={styles.specLabel}>Диски</Typography>
              <Typography className={styles.specValue}>{car.wheel_size}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CarCard;

