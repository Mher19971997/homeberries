'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { usePathname } from 'next/navigation';
import styles from './index.module.css';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const pathname = usePathname();

  if (!open) return null;

  const handleLogin = () => {
    onClose();
    router.push(`/security/login?redirect=${encodeURIComponent(pathname)}`);
  };

  const content = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="close">✕</button>

        <div className={styles.iconWrap}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>

        <h2 className={styles.title}>{t('auth.modal.title')}</h2>
        <p className={styles.subtitle}>{t('auth.modal.subtitle')}</p>

        <div className={styles.actions}>
          <button className={styles.loginBtn} onClick={handleLogin}>
            {t('auth.modal.loginBtn')}
          </button>
          <button className={styles.cancelBtn} onClick={onClose}>
            {t('auth.modal.cancelBtn')}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default AuthModal;
