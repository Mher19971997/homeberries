import React from 'react';
import { Grid, TextField } from '@mui/material';
import { IFormData } from '@homeberris/features/cars/types';
import { useTranslation } from 'next-i18next';

interface Props {
  formData: IFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const CarAppearance: React.FC<Props> = ({ formData, handleChange }) => {
  const { t } = useTranslation('common');
  return (
  <Grid item xs={12} md={6}>
    <TextField
      fullWidth
      label={t('cars.create.appearance.color')}
      name="color"
      value={formData.color}
      onChange={handleChange}
    />
    <TextField
      fullWidth
      label={t('cars.create.appearance.tireSize')}
      name="tire_size"
      value={formData.tire_size}
      onChange={handleChange}
    />
    <TextField
      fullWidth
      label={t('cars.create.appearance.wheelSize')}
      name="wheel_size"
      value={formData.wheel_size}
      onChange={handleChange}
    />
  </Grid>
  );
};