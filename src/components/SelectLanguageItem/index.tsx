'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import styles from '@homeberris/components/SelectLanguageItem/index.module.css';

interface SelectLanguageItemProps {
  flagIconName: string;
  language: string;
  isSelected?: boolean;
  onSelect?: () => void;
}

const SelectLanguageItem: React.FC<SelectLanguageItemProps> = (props) => {
  const { flagIconName, language, isSelected = false, onSelect } = props;

  return (
    <Box
      className={`${styles.body} ${isSelected ? styles.selected : ''}`}
      onClick={onSelect}
    >
      <Box className={styles.flagContainer}>
        <span className={`fi ${flagIconName} ${styles.flagIcon}`}></span>
      </Box>
      <Box className={styles.content}>
        <Typography className={styles.language}>{language}</Typography>
      </Box>
      {isSelected && (
        <Box className={styles.checkIcon}>
          <CheckIcon sx={{ fontSize: '14px' }} />
        </Box>
      )}
    </Box>
  );
};

export default SelectLanguageItem;