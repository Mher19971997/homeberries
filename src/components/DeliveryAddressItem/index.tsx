import { Box, Typography } from '@mui/material';
import React from 'react';
import styles from '@homeberris/components/DeliveryAddressItem/index.module.css';
import { deliveryAddressData } from '@homeberris/types/deliveryAddress';

interface DeliveryAddressItemProps {
  item: deliveryAddressData;
  setSelectedAddress: (item: deliveryAddressData) => void;
  selectedAddress: deliveryAddressData | null;
  handleSelect: (data: deliveryAddressData) => Promise<any>;
}

const DeliveryAddressItem: React.FC<DeliveryAddressItemProps> = ({
  item,
  setSelectedAddress,
  selectedAddress,
  handleSelect
}) => {
  const { uuid, address } = item;

  return (
    <Box
      className={`${styles.body} ${selectedAddress?.uuid === uuid ? styles.active : ''}`}
      onClick={() => {
        handleSelect(item);
        setSelectedAddress(item);
      }}
    >
      <Typography>{address}</Typography>
    </Box>
  );
};

export default DeliveryAddressItem;
