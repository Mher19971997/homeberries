import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';

const EmptyFavorite: React.FC = () => {
    const { t } = useTranslation('common');
    return (
        <Grid item xs={12}>
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                p={6}
                sx={{
                    minHeight: '400px',
                    textAlign: 'center'
                }}
            >
                <Typography variant="h5" color="text.primary" sx={{ mb: 2, fontWeight: 500 }}>
                    {t('catalogFavorites.emptyFavoritesTitle')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {t('catalogFavorites.emptyFavoritesDesc')}
                </Typography>
            </Box>
        </Grid>
    );
};

export default EmptyFavorite;

