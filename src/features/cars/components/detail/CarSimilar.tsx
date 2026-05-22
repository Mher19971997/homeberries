import { Box, Grid, Typography } from '@mui/material';
import CarCard from '@homeberris/components/CarCard';

export const CarSimilar = ({ similarCars, router }: any) => {
  if (!similarCars?.length) return null;

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Похожие автомобили
      </Typography>

      <Grid container spacing={3}>
        {similarCars.map((car: any) => (
          <Grid item xs={12} sm={6} md={4} key={car.uuid}>
            <CarCard
              car={car}
              onClick={() => router.push(`/cars/${car.uuid}`)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
