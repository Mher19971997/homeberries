import { Card, Typography, Grid, Divider, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import styles from '@homeberris/features/cars/styles/carDetail.module.css';
import { IFormData } from '@homeberris/features/cars/types';
import { useTranslation } from 'next-i18next';

interface Props {
  formData: IFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  brands: any;
  models: any;
  subModels: any;
}

export default function CarBasicInfo({ formData, handleChange, brands, models, subModels }: Props) {
  const { t } = useTranslation('common');
  return (
    <Grid item xs={12}>
      <Card className={styles.sectionCard}> 
        <Typography variant="h6" className={styles.sectionTitle}>{t('cars.create.basicInfo.title')}</Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField fullWidth label={t('cars.create.basicInfo.carName')} name="title" value={formData.title} onChange={handleChange} required variant="outlined" />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>{t('cars.create.basicInfo.brand')}</InputLabel>
              <Select name="brand_id" value={formData.brand_id} onChange={handleChange as any} label={t('cars.create.basicInfo.brand')}>
                <MenuItem value="">{t('cars.create.basicInfo.selectBrand')}</MenuItem>
                {brands?.data?.map((b: any) => <MenuItem key={b.uuid} value={b.uuid}>{b.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>{t('cars.create.basicInfo.model')}</InputLabel>
              <Select name="model_id" value={formData.model_id} onChange={handleChange as any} label={t('cars.create.basicInfo.model')} disabled={!formData.brand_id}>
                <MenuItem value="">{t('cars.create.basicInfo.selectModel')}</MenuItem>
                {models?.data?.map((m: any) => <MenuItem key={m.uuid} value={m.uuid}>{m.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>{t('cars.create.basicInfo.subModel')}</InputLabel>
              <Select name="sub_model_id" value={formData.sub_model_id} onChange={handleChange as any} label={t('cars.create.basicInfo.subModel')} disabled={!formData.model_id}>
                <MenuItem value="">{t('cars.create.basicInfo.notSelected')}</MenuItem>
                {subModels?.data?.map((s: any) => <MenuItem key={s.uuid} value={s.uuid}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label={t('cars.create.basicInfo.description')} name="description" value={formData.description} onChange={handleChange} multiline rows={4} placeholder={t('cars.create.basicInfo.descriptionPlaceholder')} />
          </Grid>
        </Grid>
      </Card>
    </Grid>
  );
}