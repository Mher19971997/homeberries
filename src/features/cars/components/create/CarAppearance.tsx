import React from 'react';
import { Grid, TextField } from '@mui/material';
import { IFormData } from '@homeberris/features/cars/types';

interface Props {
  formData: IFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const CarAppearance: React.FC<Props> = ({ formData, handleChange }) => (
  <Grid item xs={12} md={6}>
    <TextField
      fullWidth
      label="Цвет"
      name="color"
      value={formData.color}
      onChange={handleChange}
    />
    <TextField
      fullWidth
      label="Размер шин"
      name="tire_size"
      value={formData.tire_size}
      onChange={handleChange}
    />
    <TextField
      fullWidth
      label="Размер дисков"
      name="wheel_size"
      value={formData.wheel_size}
      onChange={handleChange}
    />
  </Grid>
);