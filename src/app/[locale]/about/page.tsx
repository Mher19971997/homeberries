'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './index.module.css';
import Breadcrumb from '@homeberris/components/Breadcrumb';

const AboutPage: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <div className={styles.page}>
      <Breadcrumb items={[
        { label: t('nav.home'), href: '/' },
        { label: t('nav.about') },
      ]} />
    </div>
  );
};

export default AboutPage;
