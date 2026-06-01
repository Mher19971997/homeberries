'use client';

import { Box, Typography, Button } from '@mui/material';
import styles from './index.module.css';

export default function BigSummerSale() {
  return (
    <Box className={styles.saleBanner}>
      <Box className={styles.overlayContent}>
        <Typography component="h2" className={styles.mainTitle}>
          Big Summer <span className={styles.boldText}>Sale</span>
        </Typography>

        <Typography className={styles.subtitle}>
          Commodo fames vitae vitae leo mauris in. Eu consequat.
        </Typography>

        <Button variant="outlined" className={styles.shopButton}>
          Shop Now
        </Button>
      </Box>
    </Box>
  );
}