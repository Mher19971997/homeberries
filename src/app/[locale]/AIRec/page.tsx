'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import styles from '@homeberris/app/[locale]/ai-assistant/index.module.css';
import { useTranslation } from 'react-i18next';
import AIRec from '@homeberris/components/AIRec';

export default function AIRecPage() {
  const { t } = useTranslation('common');

  return (
    <Box className={styles.container}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, textAlign: 'center' }}>
        {t('aiAssistant.title')}
      </Typography>

      <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
        <AIRec />
      </Box>
    </Box>
  );
}
