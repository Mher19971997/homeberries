import { Box, Typography, Chip } from '@mui/material';
import { useState } from 'react';
import styles from '@homeberris/features/cars/styles/carDetail.module.css';
import { useTranslation } from 'next-i18next';

export const CarInfo = ({ car }: any) => {
  const { t } = useTranslation('common');
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 200); // эффект на 200мс
  };

  return (
    <Box
      className={`${styles.container} ${clicked ? styles.clicked : ''}`}
      onClick={handleClick}
    >
      <Typography variant="h4" className={styles.title}>
        {car.title}
      </Typography>

      <Box className={styles.priceContainer}>
        <Typography variant="h5" className={styles.price}>
          {new Intl.NumberFormat('ru-RU').format(car.price)} {car.currency}
        </Typography>

        {car.is_new && (
          <Chip label={t('carInfo.new')} color="primary" className={styles.chip} />
        )}
      </Box>

      {car.description && (
        <Typography className={styles.description}>
          {car.description}
        </Typography>
      )}
    </Box>
  );
};
