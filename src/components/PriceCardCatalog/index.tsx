import { Box, Button, Card, Typography } from '@mui/material';
import React from 'react';
import styles from '@homeberris/components/PriceCardCatalog/index.module.css';
import ILikeCatalogPage from '../Icons/ILikeCatalogPage';
import { useTranslation } from 'next-i18next';
interface PriceCardCatalogProps {
  price: number | string;
}

const PriceCardCatalog: React.FC<PriceCardCatalogProps> = (props) => {
  const { t } = useTranslation('common');
  const { price } = props as PriceCardCatalogProps;
  return (
    <Card className={styles.body}>
      <Box className={styles.cardHeader}>
        <Typography>{price}</Typography>
        <Box className={styles.likeBtn}>
          <ILikeCatalogPage color='black' />
        </Box>
      </Box>
      <Box className={styles.btnGroup}>
        <Button
          fullWidth
          variant='contained'
          className={styles.btnGroupContained}
        >
          {t('productPurchaseCard.addToCart')}
        </Button>
        <Button
          fullWidth
          variant='outlined'
          className={styles.btnGroupOutlined}
        >
          {t('productPurchaseCard.buyNow')}
        </Button>
      </Box>
    </Card>
  );
};

export default PriceCardCatalog;
