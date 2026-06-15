import { useTranslation } from "next-i18next";
import { Paper, Typography, Grid, Chip, Box, Button } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import styles from '@homeberris/features/cars/styles/carDetail.module.css';

interface CarSpecsProps {
  car: any;
  setAiDialogOpen: (open: boolean) => void;
}

export const CarSpecs = ({ car, setAiDialogOpen }: CarSpecsProps) => {
  const { t } = useTranslation("common");
  const comfort = car.comfort_features || {};
  const multimedia = car.multimedia_features || {};
  const safety = car.safety_features || {};

  // Основные характеристики
  const specsData = [
    { label: t('cars.specs.year'), value: car.year },
    { label: t('cars.specs.mileage'), value: car.mileage ? `${new Intl.NumberFormat('ru-RU').format(car.mileage)} км` : null },
    { label: t('cars.specs.color'), value: car.color },
    { label: t('cars.specs.engineType'), value: car.engine_type },
    { label: t('cars.specs.engineVolume'), value: car.engine_volume ? `${car.engine_volume} л` : null },
    { label: t('cars.specs.power'), value: car.engine_power_hp ? `${car.engine_power_hp} л.с.` : null },
    { label: t('cars.specs.transmission'), value: car.transmission },
    { label: t('cars.specs.drive'), value: car.drive_type },
    { label: t('cars.specs.tireSize'), value: car.tire_size },
    { label: t('cars.specs.wheelSize'), value: car.wheel_size },
    { label: t('cars.specs.fuelCity'), value: car.fuel_consumption_city ? `${car.fuel_consumption_city} л/100 км` : null },
    { label: t('cars.specs.fuelHighway'), value: car.fuel_consumption_highway ? `${car.fuel_consumption_highway} л/100 км` : null },
  ].filter(spec => spec.value !== undefined && spec.value !== null);

  // Оснащение
  const featuresData = [
    { value: comfort.sunroof, label: t('cars.equipment.sunroof') },
    { value: comfort.panoramic_roof, label: t('cars.equipment.panoramicRoof') },
    { value: comfort.heated_seats, label: t('cars.equipment.heatedSeats') },
    { value: multimedia.navigation, label: t('cars.equipment.navigation') },
    { value: multimedia.premium_audio, label: t('cars.equipment.premiumAudio') },
    { value: safety.turbo, label: t('cars.equipment.turbo') },
    { value: safety.parking_sensors, label: t('cars.equipment.parkingSensors') },
  ].filter(f => f.value);

  return (
    <>
      {/* Основные характеристики */}
      <Paper className={styles.specs} sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" className={styles.specsTitle} sx={{ mb: 2 }}>
          {t('cars.specs.title')}
        </Typography>
        <Grid container spacing={2}>
          {specsData.map((spec, i) => (
            <Grid item xs={6} key={i}>
              <Typography variant="body2" color="text.secondary">{spec.label}</Typography>
              <Typography variant="body1">{spec.value}</Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Оснащение */}
      {featuresData.length > 0 && (
        <Paper className={styles.specs} sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6" className={styles.specsTitle} sx={{ mb: 1 }}>
            {t('cars.equipment.title')}
          </Typography>
          <Grid container spacing={1}>
            {featuresData.map((f, i) => (
              <Grid item key={i}>
                <Chip label={f.label} color="default" size="small" />
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* AI помощник */}
      <Paper className={styles.specs} sx={{ mt: 3, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" className={styles.specsTitle}>
            {t('cars.aiHelper.title')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SmartToyIcon />}
            onClick={() => setAiDialogOpen(true)}
          >
            {t('cars.aiHelper.button')}
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {t('cars.aiHelper.description')}
        </Typography>
      </Paper>
    </>
  );
};
