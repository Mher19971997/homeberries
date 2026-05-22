import { Box, Grid } from '@mui/material';
import { BrandChips, CarsBreadcrumbs, CarsFiltersDesktop, CarsGrid, ModelChips, useCarsCatalog } from '@homeberris/features/cars';
import styles from './index.module.css';


export default function CarsCatalog() {
  const catalog = useCarsCatalog();

  return (
    <Box className={styles.body}>
      <CarsBreadcrumbs {...catalog} />

      <BrandChips {...catalog} />
      <ModelChips {...catalog} />

      <Box className={styles.filterHeader}>
        ...
      </Box>

      <Grid container spacing={3} className={styles.container}>
        <CarsFiltersDesktop {...catalog} />
        <CarsGrid {...catalog} />
      </Grid>
    </Box>

  );
}