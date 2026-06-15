'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { usePathname } from 'next/navigation';
import styles from './index.module.css';

interface AuthGuardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ icon, title, subtitle }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const pathname = usePathname();

  // if (!ready) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.iconWrap}>{icon}</div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.subtitle}>{subtitle}</p>
      <button
        className={styles.loginBtn}
        onClick={() => router.push(`/security/login?redirect=${encodeURIComponent(pathname)}`)}
      >
        {t('auth.modal.loginBtn')}
      </button>
    </div>
  );
};

export default AuthGuard;
