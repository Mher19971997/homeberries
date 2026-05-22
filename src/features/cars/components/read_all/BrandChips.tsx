import { Box, Chip } from '@mui/material';

export const BrandChips = ({
    carMenu,
    brandId,
    router,
}: any) => {
    return (
        <Box
            sx={{
                display: { xs: 'flex', md: 'none' },
                overflowX: 'auto',
                gap: 1,
                mb: 2,
                pb: 1,
                '&::-webkit-scrollbar': { display: 'none' },
            }}
        >
            <Chip
                label="Все"
                clickable
                color={!brandId ? 'primary' : 'default'}
                onClick={() => router.push('/cars')}
            />

            {carMenu?.map((brand: any) => (
                <Chip
                    key={brand.uuid}
                    label={brand.brand}
                    clickable
                    color={brand.uuid === brandId ? 'primary' : 'default'}
                    onClick={() =>
                        router.push({
                            pathname: '/cars',
                            query: { brand: brand.uuid },
                        })
                    }
                />
            ))}
        </Box>
    );
};
