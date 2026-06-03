import React from 'react';
import CatalogCard from '@homeberris/components/CatalogCard';
import styles from './FavoriteItems.module.css';
import { useRouter } from 'next/navigation';

const FavoriteItem: React.FC<{ catalog: any, sortPanelOne?: boolean }> = ({ catalog, sortPanelOne = false }) => {
    const router = useRouter();

    return (
        <div className={styles.item} key={catalog.uuid}>
            <div className={styles.cardWrapper}>
                <CatalogCard
                    // catalogsPage={true}
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
            </div>
        </div>
    );
};

export default FavoriteItem;

// import React from 'react';
// import { Box, Grid } from '@mui/material';
// import CatalogCard from '@homeberris/components/CatalogCard';
// import styles from '@homeberris/pages/catalog/[category]/index.module.css';
// import Link from 'next/link'; // Используем Link вместо useRouter

// const FavoriteItem: React.FC<{ catalog: any; sortPanelOne?: boolean }> = React.memo(({ catalog, sortPanelOne = false }) => {

//     // Формируем правильный URL для карточки заранее
//     const categoryName = catalog.category?.name || 'Каталог';
//     const subCategoryName = catalog.subCategorie?.name;

//     const cardUrl = subCategoryName
//         ? `/catalog/${encodeURIComponent(categoryName)}/${encodeURIComponent(subCategoryName)}/${catalog.uuid}`
//         : `/catalog/${encodeURIComponent(categoryName)}/${catalog.uuid}`;

//     return (
//         <Grid item lg={2} md={4} sm={4} xs={6} xl={2}>
//             <Box className={styles.cardWrapper}>
//                 {/* Оборачиваем в Link, чтобы переход работал нативно, без лишних ререндеров */}
//                 <Link href={cardUrl} passHref legacyBehavior>
//                     <a style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
//                         <CatalogCard
//                             catalogsPage={true}
//                             sortPanelOne={sortPanelOne}
//                             catalog={catalog}
//                         />
//                     </a>
//                 </Link>
//             </Box>
//         </Grid>
//     );
// });

// // React.memo спасет карточку от мигания, если родительский компонент перерендеривается
// export default FavoriteItem;
