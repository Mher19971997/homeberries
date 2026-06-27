'use client';

import React, { useEffect, useState } from 'react';
import { Ticket, X } from 'lucide-react';
import styles from './index.module.css';

interface PromoNotificationProps {
  code: string;
  discountPercent: number;
  onClose: () => void;
}

const PromoNotification: React.FC<PromoNotificationProps> = ({ code, discountPercent, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 350);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`${styles.notification} ${visible ? styles.visible : ''}`}>
      <div className={styles.icon}>
        <Ticket size={22} strokeWidth={1.8} />
      </div>
      <div className={styles.content}>
        <div className={styles.title}>Вам отправлен промокод!</div>
        <div className={styles.code}>{code}</div>
        <div className={styles.discount}>Скидка {discountPercent}%</div>
      </div>
      <button className={styles.close} onClick={() => { setVisible(false); setTimeout(onClose, 350); }}>
        <X size={16} />
      </button>
    </div>
  );
};

export default PromoNotification;
