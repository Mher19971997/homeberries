import React from 'react';
import { Box, Grid } from '@mui/material';
import CatalogCard from '@homeberris/components/CatalogCard';
import styles from '@homeberris/pages/catalog/[category]/index.module.css';
import { useRouter } from 'next/router';

const FavoriteItem: React.FC<{ catalog: any, sortPanelOne?: boolean }> = ({ catalog, sortPanelOne = false }) => {
    const router = useRouter();

    return (
        <Grid item lg={2} md={4} sm={4} xs={6} xl={2} key={catalog.uuid}>
            <Box className={styles.cardWrapper}>
                <CatalogCard
                    catalogsPage={true}
                    sortPanelOne={sortPanelOne}
                    catalog={catalog}
                    onNavigate={() => {
                        const categoryName = catalog.category?.name || 'Каталог';
                        const subCategoryName = (catalog as any).subCategorie?.name;
                        if (subCategoryName) {
                            router.push(
                                `/catalog/${encodeURIComponent(categoryName)}/${encodeURIComponent(
                                    subCategoryName
                                )}/${catalog.uuid}`
                            );
                        } else {
                            router.push(
                                `/catalog/${encodeURIComponent(categoryName)}/${catalog.uuid}`
                            );
                        }
                    }}
                />
            </Box>
        </Grid>
    );
};

export default FavoriteItem;