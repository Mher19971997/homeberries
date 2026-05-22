import { Box } from '@mui/material';
import React from 'react';
import styles from '@homeberris/components/SelectPaymentItem/index.module.css';

interface SelectPaymentItemProps {
  children: React.ReactNode;
}

const SelectPaymentItem: React.FC<SelectPaymentItemProps> = ({ children }) => {
  return <Box className={styles.body}>{children}</Box>;
};

export default SelectPaymentItem;
