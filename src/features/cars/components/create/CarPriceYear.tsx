import React from 'react';
import { Grid, TextField, FormControlLabel, Checkbox, Box } from '@mui/material';
import { IFormData } from '@homeberris/features/cars/types';
import { useTranslation } from 'next-i18next';

interface Props {
  formData: IFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const CarPriceYear: React.FC<Props> = ({ formData, handleChange }) => {
  const { t } = useTranslation('common');
  return (
    <Grid item xs={12} md={6}>
      <Box>
        <TextField
          fullWidth
          label={t('cars.create.priceYear.price')}
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          label={t('cars.create.priceYear.year')}
          name="year"
          type="number"
          value={formData.year}
          onChange={handleChange}
          required
          inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
        />
        <TextField
          fullWidth
          label={t('cars.create.priceYear.mileage')}
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
          label={t('cars.create.priceYear.isNew')}
        />
      </Box>
    </Grid>
  );
};
