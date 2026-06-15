import React from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { IFormData } from '@homeberris/features/cars/types';
import { useTranslation } from 'next-i18next';

interface Props {
  formData: IFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const CarEngineTransmission: React.FC<Props> = ({ formData, handleChange }) => {
  const { t } = useTranslation('common');
  return (
  <>
    <Grid item xs={12} md={6}>
      <FormControl fullWidth>
        <InputLabel>{t('cars.create.engine.engineType')}</InputLabel>
        <Select
          name="engine_type"
          value={formData.engine_type}
          onChange={handleChange as any}
        >
          <MenuItem value="">{t('cars.create.engine.notSelected')}</MenuItem>
          <MenuItem value="petrol">{t('cars.create.engine.petrol')}</MenuItem>
          <MenuItem value="diesel">{t('cars.create.engine.diesel')}</MenuItem>
          <MenuItem value="hybrid">{t('cars.create.engine.hybrid')}</MenuItem>
          <MenuItem value="electric">{t('cars.create.engine.electric')}</MenuItem>
        </Select>
      </FormControl>
    </Grid>
    <Grid item xs={12} md={3}>
      <TextField
        fullWidth
        label={t('cars.create.engine.volume')}
        name="engine_volume"
        type="number"
        value={formData.engine_volume}
        onChange={handleChange}
      />
    </Grid>
    <Grid item xs={12} md={3}>
      <TextField
        fullWidth
        label={t('cars.create.engine.power')}
        name="engine_power_hp"
        type="number"
        value={formData.engine_power_hp}
        onChange={handleChange}
      />
    </Grid>
    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label={t('cars.create.engine.fuelCity')}
        name="fuel_consumption_city"
        type="number"
        value={formData.fuel_consumption_city}
        onChange={handleChange}
      />
    </Grid>
    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label={t('cars.create.engine.fuelHighway')}
        name="fuel_consumption_highway"
        type="number"
        value={formData.fuel_consumption_highway}
        onChange={handleChange}
      />
    </Grid>
  </>
  );
};