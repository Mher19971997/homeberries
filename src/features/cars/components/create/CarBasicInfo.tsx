import { Card, Typography, Grid, Divider, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import styles from '@homeberris/features/cars/styles/carDetail.module.css';
import { IFormData } from '@homeberris/features/cars/types';

interface Props {
  formData: IFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  brands: any;
  models: any;
  subModels: any;
}

export default function CarBasicInfo({ formData, handleChange, brands, models, subModels }: Props) {
  return (
    <Grid item xs={12}>
      <Card className={styles.sectionCard}> 
        <Typography variant="h6" className={styles.sectionTitle}>Основная информация</Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField fullWidth label="Название автомобиля" name="title" value={formData.title} onChange={handleChange} required variant="outlined" />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>Бренд</InputLabel>
              <Select name="brand_id" value={formData.brand_id} onChange={handleChange as any} label="Бренд">
                <MenuItem value="">Выберите бренд</MenuItem>
                {brands?.data?.map((b: any) => <MenuItem key={b.uuid} value={b.uuid}>{b.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>Модель</InputLabel>
              <Select name="model_id" value={formData.model_id} onChange={handleChange as any} label="Модель" disabled={!formData.brand_id}>
                <MenuItem value="">Выберите модель</MenuItem>
                {models?.data?.map((m: any) => <MenuItem key={m.uuid} value={m.uuid}>{m.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Подмодель</InputLabel>
              <Select name="sub_model_id" value={formData.sub_model_id} onChange={handleChange as any} label="Подмодель" disabled={!formData.model_id}>
                <MenuItem value="">Не выбрано</MenuItem>
                {subModels?.data?.map((s: any) => <MenuItem key={s.uuid} value={s.uuid}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Описание" name="description" value={formData.description} onChange={handleChange} multiline rows={4} placeholder="Опишите состояние автомобиля, комплектацию, особенности..." />
          </Grid>
        </Grid>
      </Card>
    </Grid>
  );
}