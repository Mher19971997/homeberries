import React from 'react';
import { Box, Grid, Typography } from '@mui/material';


const EmptyFavorite: React.FC = () => {
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
                    В избранном пока нет товаров
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Добавляйте понравившиеся товары, нажимая на сердечко на карточке товара.
                </Typography>
            </Box>
        </Grid>
    );
};

export default EmptyFavorite;

