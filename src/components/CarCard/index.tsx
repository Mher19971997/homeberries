import React from 'react';
import { useTranslation } from "next-i18next";
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
  const { t } = useTranslation("common");
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
      sedan: t('cars.bodyType.sedan'),
      hatchback: t('cars.bodyType.hatchback'),
      wagon: t('cars.bodyType.wagon'),
      coupe: t('cars.bodyType.coupe'),
      suv: t('cars.bodyType.suv'),
      crossover: t('cars.bodyType.crossover'),
      minivan: t('cars.bodyType.minivan'),
      pickup: t('cars.bodyType.pickup'),
      convertible: t('cars.bodyType.convertible'),
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
          {car.is_new && <Chip size="small" color="primary" label={t('cars.card.isNew')} />}
          {car.mileage === 0 && !car.is_new && (
            <Chip size="small" color="secondary" label={t('cars.card.noMileage')} />
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
              {car.year ? ` · ${car.year} ${t('cars.units.year')}` : ''}
            </Typography>
          </Box>
        </Box>
        <Box className={styles.priceContainer}>
          <Typography className={styles.price}>
            {formatNumber(car.price)} {car.currency || '֏'}
          </Typography>
        </Box>

        <Box className={styles.chipRow}>
          {car.engine_volume && (
            <Chip
              size="small"
              label={`${car.engine_volume} ${t('cars.units.litre')}`}
              variant="outlined"
            />
          )}
          {car.engine_power_hp && (
            <Chip
              size="small"
              label={`${car.engine_power_hp} ${t('cars.units.hp')}`}
              variant="outlined"
            />
          )}
          {car.transmission && (
            <Chip
              size="small"
              label={car.transmission === 'automatic' ? t('cars.card.transmission.automatic') : car.transmission === 'manual' ? t('cars.card.transmission.manual') : car.transmission}
              variant="outlined"
            />
          )}
          {car.drive_type && (
            <Chip
              size="small"
              label={car.drive_type === 'awd' ? t('cars.card.drive.awd') : car.drive_type === 'fwd' ? t('cars.card.drive.fwd') : car.drive_type === 'rwd' ? t('cars.card.drive.rwd') : car.drive_type}
              variant="outlined"
            />
          )}
        </Box>

        <Box className={styles.specRow}>
          {car.mileage !== undefined && (
            <Box>
              <Typography className={styles.specLabel}>{t('cars.card.mileageLabel')}</Typography>
              <Typography className={styles.specValue}>
                {formatNumber(car.mileage)} {t('cars.units.km')}
              </Typography>
            </Box>
          )}
          {car.color && (
            <Box>
              <Typography className={styles.specLabel}>{t('cars.card.colorLabel')}</Typography>
              <Typography className={styles.specValue}>{car.color}</Typography>
            </Box>
          )}
          {car.tire_size && (
            <Box>
              <Typography className={styles.specLabel}>{t('cars.card.tiresLabel')}</Typography>
              <Typography className={styles.specValue}>{car.tire_size}</Typography>
            </Box>
          )}
          {car.wheel_size && (
            <Box>
              <Typography className={styles.specLabel}>{t('cars.card.wheelsLabel')}</Typography>
              <Typography className={styles.specValue}>{car.wheel_size}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CarCard;

