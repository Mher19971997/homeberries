import { Paper, Typography, Box, Grid } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import styles from '@homeberris/features/cars/styles/carDetail.module.css';
import { useTranslation } from 'next-i18next';

interface CarStatisticsProps {
  statistics: any;
  currency?: string;
  car: any;
}

export const CarStatistics = ({ car, statistics, currency = '֏' }: CarStatisticsProps) => {
  const { t } = useTranslation('common');
  if (!statistics) return null;

  return (
    <Paper
      className={styles.specs}
      sx={{
        mt: 3,
        p: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {t('cars.statistics.title')} {statistics.modelName}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            {t('cars.statistics.averagePrice')}
          </Typography>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
            {new Intl.NumberFormat('ru-RU').format(statistics.averagePrice)} {car.currency || '֏'}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box display="flex" alignItems="center" gap={1}>
            {statistics.isCheaper ? (
              <TrendingDownIcon sx={{ color: '#4caf50' }} />
            ) : (
              <TrendingUpIcon sx={{ color: '#f44336' }} />
            )}
            <Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {statistics.isCheaper ? t('cars.statistics.cheaper') : t('cars.statistics.moreExpensive')}
              </Typography>
              <Typography variant="h6" sx={{ color: statistics.isCheaper ? '#4caf50' : '#f44336', fontWeight: 700 }}>
                {statistics.isCheaper ? '-' : '+'}{Math.abs(statistics.priceDifferencePercent)}% (
                {new Intl.NumberFormat('ru-RU').format(Math.abs(statistics.priceDifference))} {car.currency || '֏'})
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
            {t('cars.statistics.totalCars')} {statistics.modelName}: {statistics.totalCarsInModel}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};
