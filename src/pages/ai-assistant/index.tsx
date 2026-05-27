import React from 'react';
import { Box, Typography } from '@mui/material';
import AiAssistant from '@homeberris/components/AiAssistant';
import styles from './index.module.css';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';

export default function AiAssistantPage() {
  const { t } = useTranslation('common');

  return (
    <Box className={styles.container}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, textAlign: 'center' }}>
        {t('aiAssistant.title')}
      </Typography>

      <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
        <AiAssistant />
      </Box>
    </Box>
  );
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ru', ['common'])),
    },
  };
}
