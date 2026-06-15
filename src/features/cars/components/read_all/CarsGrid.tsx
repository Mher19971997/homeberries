import { Grid, Box, CircularProgress, Typography } from '@mui/material';
import CarCard from '@homeberris/components/CarCard';
import { useTranslation } from 'next-i18next';

export const CarsGrid = ({ cars, isLoading, router }: any) => {
  const { t } = useTranslation('common');
  return (
    <Grid item xs={12} md={9}>
      <Grid container spacing={2}>
        {isLoading ? (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          </Grid>
        ) : cars.length > 0 ? (
          cars.map((car: any) => (
            <Grid item xs={12} sm={6} lg={4} key={car.uuid}>
              <CarCard
                car={car}
                onClick={() => router.push(`/cars/${car.uuid}`)}
              />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography textAlign="center" p={4}>
              {t('carsGrid.notFound')}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};
