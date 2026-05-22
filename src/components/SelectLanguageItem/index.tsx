import React from 'react';
import { Box, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import styles from '@homeberris/components/SelectLanguageItem/index.module.css';

interface SelectLanguageItemProps {
  flagIconName: string;
  currency: string;
  description: string;
  language: string;
  isSelected?: boolean;
  onSelect?: () => void;
}

const SelectLanguageItem: React.FC<SelectLanguageItemProps> = (props) => {
  const { flagIconName, currency, description, language, isSelected = false, onSelect } = props;

  return (
    <Box
      className={`${styles.body} ${isSelected ? styles.selected : ''}`}
      onClick={onSelect}
    >
      <Box className={styles.flagContainer}>
        <span className={`fi ${flagIconName} ${styles.flagIcon}`}></span>
      </Box>
      <Box className={styles.content}>
        <Box className={styles.header}>
          <Typography className={styles.currency}>{currency}</Typography>
          <Typography className={styles.language}>{language}</Typography>
        </Box>
        <Typography className={styles.description}>{description}</Typography>
      </Box>
      {isSelected && (
        <Box className={styles.checkIcon}>
          <CheckIcon fontSize="small" />
        </Box>
      )}
    </Box>
  );
};

export default SelectLanguageItem;
