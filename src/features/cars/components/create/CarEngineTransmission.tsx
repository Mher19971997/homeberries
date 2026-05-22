import React from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { IFormData } from '@homeberris/features/cars/types';

interface Props {
  formData: IFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const CarEngineTransmission: React.FC<Props> = ({ formData, handleChange }) => (
  <>
    <Grid item xs={12} md={6}>
      <FormControl fullWidth>
        <InputLabel>Тип двигателя</InputLabel>
        <Select
          name="engine_type"
          value={formData.engine_type}
          onChange={handleChange as any}
        >
          <MenuItem value="">Не выбрано</MenuItem>
          <MenuItem value="petrol">Бензин</MenuItem>
          <MenuItem value="diesel">Дизель</MenuItem>
          <MenuItem value="hybrid">Гибрид</MenuItem>
          <MenuItem value="electric">Электрический</MenuItem>
        </Select>
      </FormControl>
    </Grid>
    <Grid item xs={12} md={3}>
      <TextField
        fullWidth
        label="Объем (л)"
        name="engine_volume"
        type="number"
        value={formData.engine_volume}
        onChange={handleChange}
      />
    </Grid>
    <Grid item xs={12} md={3}>
      <TextField
        fullWidth
        label="Мощность (л.с.)"
        name="engine_power_hp"
        type="number"
        value={formData.engine_power_hp}
        onChange={handleChange}
      />
    </Grid>
    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label="Расход в городе (л/100км)"
        name="fuel_consumption_city"
        type="number"
        value={formData.fuel_consumption_city}
        onChange={handleChange}
      />
    </Grid>
    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label="Расход по трассе (л/100км)"
        name="fuel_consumption_highway"
        type="number"
        value={formData.fuel_consumption_highway}
        onChange={handleChange}
      />
    </Grid>
  </>
);