import { Paper, Typography, Grid, Chip, Box, Button } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import styles from '@homeberris/features/cars/styles/carDetail.module.css';

interface CarSpecsProps {
  car: any;
  setAiDialogOpen: (open: boolean) => void;
}

export const CarSpecs = ({ car, setAiDialogOpen }: CarSpecsProps) => {
  const comfort = car.comfort_features || {};
  const multimedia = car.multimedia_features || {};
  const safety = car.safety_features || {};

  // Основные характеристики
  const specsData = [
    { label: 'Год выпуска', value: car.year },
    { label: 'Пробег', value: car.mileage ? `${new Intl.NumberFormat('ru-RU').format(car.mileage)} км` : null },
    { label: 'Цвет', value: car.color },
    { label: 'Тип двигателя', value: car.engine_type },
    { label: 'Объем двигателя', value: car.engine_volume ? `${car.engine_volume} л` : null },
    { label: 'Мощность', value: car.engine_power_hp ? `${car.engine_power_hp} л.с.` : null },
    { label: 'КПП', value: car.transmission },
    { label: 'Привод', value: car.drive_type },
    { label: 'Размер шин', value: car.tire_size },
    { label: 'Диски', value: car.wheel_size },
    { label: 'Расход в городе', value: car.fuel_consumption_city ? `${car.fuel_consumption_city} л/100 км` : null },
    { label: 'Расход по трассе', value: car.fuel_consumption_highway ? `${car.fuel_consumption_highway} л/100 км` : null },
  ].filter(spec => spec.value !== undefined && spec.value !== null);

  // Оснащение
  const featuresData = [
    { value: comfort.sunroof, label: 'Люк' },
    { value: comfort.panoramic_roof, label: 'Панорамная крыша' },
    { value: comfort.heated_seats, label: 'Подогрев сидений' },
    { value: multimedia.navigation, label: 'Навигация' },
    { value: multimedia.premium_audio, label: 'Премиальная аудиосистема' },
    { value: safety.turbo, label: 'Турбо' },
    { value: safety.parking_sensors, label: 'Парктроники' },
  ].filter(f => f.value);

  return (
    <>
      {/* Основные характеристики */}
      <Paper className={styles.specs} sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" className={styles.specsTitle} sx={{ mb: 2 }}>
          Характеристики
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
            Оснащение
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
            AI Помощник
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SmartToyIcon />}
            onClick={() => setAiDialogOpen(true)}
          >
            Получить совет
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Получите персональную рекомендацию по этому автомобилю от нашего AI-помощника.
          Узнайте о надёжности, стоимости обслуживания, популярности модели и многом другом.
        </Typography>
      </Paper>
    </>
  );
};
