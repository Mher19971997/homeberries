'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styles from './index.module.css';

const AboutPage: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>{t('nav.home')}</Link>
        <span className={styles.sep}>/</span>
        <span className={styles.breadcrumbActive}>{t('nav.about')}</span>
      </nav>
    </div>
  );
};

export default AboutPage;
