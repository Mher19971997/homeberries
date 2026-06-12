import React from 'react';
import { Grid, TextField, FormControlLabel, Checkbox, Box } from '@mui/material';
import { IFormData } from '@homeberris/features/cars/types';

interface Props {
  formData: IFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const CarPriceYear: React.FC<Props> = ({ formData, handleChange }) => {
  return (
    <Grid item xs={12} md={6}>
      <Box>
        <TextField
          fullWidth
          label="Цена (֏)"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          label="Год выпуска"
          name="year"
          type="number"
          value={formData.year}
          onChange={handleChange}
          required
          inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
        />
        <TextField
          fullWidth
          label="Пробег (км)"
          name="mileage"
          type="number"
          value={formData.mileage}
          onChange={handleChange}
          disabled={formData.is_new}
        />
        <FormControlLabel
          control={
            <Checkbox
              name="is_new"
              checked={formData.is_new}
              onChange={handleChange}
            />
          }
          label="Новый автомобиль"
        />
      </Box>
    </Grid>
  );
};
