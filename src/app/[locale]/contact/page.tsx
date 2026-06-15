'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './index.module.css';
import Breadcrumb from '@homeberris/components/Breadcrumb';

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
      <Breadcrumb items={[
        { label: t('nav.home'), href: '/' },
        { label: t('nav.contact') },
      ]} />
    </div>
  );
};

export default ContactPage;
