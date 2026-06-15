import React from 'react';
import { Grid, Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { useTranslation } from 'next-i18next';

interface Props {
  isLoading: boolean;
}

export const CreateCarActions: React.FC<Props> = ({ isLoading }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  return (
    <Grid item xs={12}>
      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button variant="outlined" onClick={() => router.push('/cars')}>{t('cars.create.actions.cancel')}</Button>
        <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={isLoading}>
          {isLoading ? t('cars.create.actions.creating') : t('cars.create.actions.create')}
        </Button>
      </Box>
    </Grid>
  );
};
