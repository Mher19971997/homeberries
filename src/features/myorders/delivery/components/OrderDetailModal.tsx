'use client';

import { useEffect } from 'react';
import { OrderItem } from '@homeberris/http/orderApi';
import { useTranslation } from 'react-i18next';
import styles from '@homeberris/features/myorders/delivery/styles/index.module.css';

const BASE_URL = 'http://localhost:6001';

const getLoc = (val: any, locale = 'en'): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[locale] || val.en || val.ru || '';
};

interface Props {
  order: OrderItem | null;
  onClose: () => void;
}

export const OrderDetailModal = ({ order, onClose }: Props) => {
  const { t, i18n } = useTranslation('common');

  useEffect(() => {
    if (!order) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [order, onClose]);

  if (!order) return null;

  const imageUrl = order.catalog?.images?.[0]?.image
    ? `${BASE_URL}/${order.catalog.images[0].image}`
    : null;

  const status = order.status?.toLowerCase() || '';

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'delivered':
      case 'completed': return t('delivery.status.delivered');
      case 'cancelled':
      case 'canceled': return t('delivery.status.cancelled');
      case 'processing':
      case 'in_progress': return t('delivery.status.processing');
      case 'shipped': return t('delivery.status.shipped');
      case 'pending': return t('delivery.status.pending');
      case 'paid': return t('delivery.status.paid');
      default: return s || t('delivery.status.unknown');
    }
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleString(i18n.language, {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <p className={styles.modalTitle}>{t('delivery.detail.title')}</p>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>
          {imageUrl && (
            <div className={styles.modalImageWrap}>
              <img src={imageUrl} alt="" className={styles.modalImage} />
            </div>
          )}

          <p className={styles.modalProductName}>
            {getLoc(order.catalog?.name, i18n.language)}
          </p>

          <div className={styles.modalRows}>
            <div className={styles.modalRow}>
              <span className={styles.modalRowLabel}>{t('delivery.detail.orderNum')}</span>
              <span className={styles.modalRowValue}>#{order.order_N || order.uuid.substring(0, 8).toUpperCase()}</span>
            </div>
            <div className={styles.modalRow}>
              <span className={styles.modalRowLabel}>{t('delivery.detail.status')}</span>
              <span className={`${styles.statusChip} ${styles[`status_${status}`] || styles.status_default}`}>
                {getStatusLabel(status)}
              </span>
            </div>
            <div className={styles.modalRow}>
              <span className={styles.modalRowLabel}>{t('delivery.detail.qty')}</span>
              <span className={styles.modalRowValue}>{order.quantity}</span>
            </div>
            <div className={styles.modalRow}>
              <span className={styles.modalRowLabel}>{t('delivery.detail.price')}</span>
              <span className={styles.modalRowValue}>{order.price} AMD</span>
            </div>
            <div className={styles.modalRow}>
              <span className={styles.modalRowLabel}>{t('delivery.detail.date')}</span>
              <span className={styles.modalRowValue}>{formatDate(order.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
