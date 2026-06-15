'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import styles from './index.module.css';

const ContactPage: React.FC = () => {
  const { t } = useTranslation('common');
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>{t('nav.home')}</Link>
        <span className={styles.sep}>/</span>
        <span className={styles.breadcrumbActive}>{t('nav.contact')}</span>
      </nav>
    </div>
  );
};

export default ContactPage;
