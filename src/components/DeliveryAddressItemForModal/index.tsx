import { Box, Typography } from '@mui/material';
import React from 'react';
import styles from '@homeberris/components/DeliveryAddressItemForModal/index.module.css';

interface DeliveryAddressItemForModalProps {
  address: string;
}

const DeliveryAddressItemForModal: React.FC<
  DeliveryAddressItemForModalProps
> = ({ address }) => {
  return (
    <Box className={styles.body}>
      <Typography>{address}</Typography>
    </Box>
  );
};

export default DeliveryAddressItemForModal;
