import React from 'react';
import { Box, Typography } from '@mui/material';
import styles from '@homeberris/components/OrderDeliveryAdress/index.module.css';
import { useTranslation } from 'react-i18next';

interface OrderDeliveryAdressProps {
  deliveryAdress?: {
    uuid: string;
    address: string;
    isDefault: string;
    createdAt: string
  };
}

const OrderDeliveryAdress: React.FC<OrderDeliveryAdressProps> = ({
  deliveryAdress
}) => {
  const { t } = useTranslation('common');
  
  return (
    <Box className={styles.box}>
      <Typography className={styles.title}>{t('basket.delivery.title')}</Typography>
      <Typography className={styles.addressText}>{deliveryAdress?.address}</Typography>
    </Box>
  );
};

export default OrderDeliveryAdress;
