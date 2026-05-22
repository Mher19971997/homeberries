import { useState } from 'react';
import { Box, Grid, CircularProgress, Typography } from '@mui/material';
import { CarAiDialog, CarEquipment, CarGallery, CarInfo, CarSimilar, CarSpecs, CarStatistics, useCarDetail } from '@homeberris/features/cars';
import styles from '@homeberris/features/cars/styles/carDetail.module.css';


const Loading = () => (
  <Box className={styles.body}>
    <CircularProgress />
  </Box>
);

const NotFound = () => (
  <Box className={styles.body}>
    <Typography>Автомобиль не найден</Typography>
  </Box>
);


export default function CarDetailPage() {
  const { car, statistics, similarCars, isLoading, router } = useCarDetail();
  const [aiOpen, setAiOpen] = useState(false);

  const openAiDialog = () => setAiOpen(true);
  const closeAiDialog = () => setAiOpen(false);

  if (isLoading) return <Loading />;
  if (!car) return <NotFound />;

  return (
    <Box className={styles.body}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <CarGallery car={car} />
        </Grid>
        <Grid item xs={12} md={6}>
          <CarInfo car={car} />
          <CarSpecs car={car} setAiDialogOpen={openAiDialog} />
          <CarEquipment car={car} />
          <CarStatistics car={car} statistics={statistics} />
        </Grid>
      </Grid>
      <CarSimilar similarCars={similarCars} router={router} />
      <CarAiDialog open={aiOpen} onClose={closeAiDialog} car={car} />
    </Box>
  );
}