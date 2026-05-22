import React from 'react';
import { Box, Typography } from '@mui/material';
import styles from '@homeberris/components/OrderDeliveryAdress/index.module.css';

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
  return (
    <Box className={styles.box}>
      <Typography className={styles.title}>Доставка в пункт выдачи</Typography>
      <Typography className={styles.addressText}>{deliveryAdress?.address}</Typography>
    </Box>
  );
};

export default OrderDeliveryAdress;
