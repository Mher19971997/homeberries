import React from 'react';
import { Box, Typography } from '@mui/material';
import AiAssistant from '@homeberris/components/AiAssistant';
import styles from './index.module.css';

export default function AiAssistantPage() {
  return (
    <Box className={styles.container}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, textAlign: 'center' }}>
        AI Помощник
      </Typography>

      <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
        <AiAssistant />
      </Box>
    </Box>
  );
}
