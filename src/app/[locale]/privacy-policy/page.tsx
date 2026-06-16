'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './index.module.css';
import Breadcrumb from '@homeberris/components/Breadcrumb';

const PrivacyPolicyPage: React.FC = () => {
  const { t } = useTranslation('common');

  const sections = ['collect', 'use', 'share', 'security', 'rights', 'contact'] as const;

  return (
    <div className={styles.page}>
      <Breadcrumb items={[
        { label: t('nav.home'), href: '/' },
        { label: t('privacyPolicy.breadcrumb') },
      ]} />

      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>{t('privacyPolicy.hero.title')}</h1>
        <p className={styles.heroDate}>{t('privacyPolicy.hero.updated')}</p>
      </div>

      <div className={styles.content}>
        <p className={styles.intro}>{t('privacyPolicy.intro')}</p>

        <div className={styles.sections}>
          {sections.map((key) => (
            <div key={key} className={styles.section}>
              <h2 className={styles.sectionTitle}>{t(`privacyPolicy.sections.${key}.title`)}</h2>
              <p className={styles.sectionText}>{t(`privacyPolicy.sections.${key}.text`)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
