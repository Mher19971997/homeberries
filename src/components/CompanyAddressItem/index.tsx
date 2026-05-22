import { Box, Typography } from '@mui/material';
import React from 'react';
import styles from '@homeberris/components/CompanyAddressItem/index.module.css';
import { CompanyAddressData } from '@homeberris/http/companyAddressApi';

interface CompanyAddressItemProps {
  item: CompanyAddressData;
  setSelectedAddress: (item: CompanyAddressData) => void;
  selectedAddress: CompanyAddressData | null;
  handleSelect: (data: CompanyAddressData) => Promise<any>;
}

const CompanyAddressItem: React.FC<CompanyAddressItemProps> = ({
  item,
  setSelectedAddress,
  selectedAddress,
  handleSelect
}) => {
  const { uuid, address, company } = item;

  return (
    <Box
      className={`${styles.body} ${selectedAddress?.uuid === uuid ? styles.active : ''}`}
      onClick={() => {
        handleSelect(item);
        setSelectedAddress(item);
      }}
    >
      <Typography variant="subtitle1" fontWeight="bold">
        {company?.name || 'Компания'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {address}
      </Typography>
    </Box>
  );
};

export default CompanyAddressItem;
