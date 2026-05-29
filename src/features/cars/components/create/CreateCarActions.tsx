import React from 'react';
import { Grid, Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';

interface Props {
  isLoading: boolean;
}

export const CreateCarActions: React.FC<Props> = ({ isLoading }) => {
  const router = useRouter();
  return (
    <Grid item xs={12}>
      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button variant="outlined" onClick={() => router.push('/cars')}>Отмена</Button>
        <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={isLoading}>
          {isLoading ? 'Создание...' : 'Создать автомобиль'}
        </Button>
      </Box>
    </Grid>
  );
};
