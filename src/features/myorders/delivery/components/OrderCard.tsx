import React from 'react';
import styles from "@homeberris/features/myorders/delivery/styles/index.module.css";
import { OrderItem } from '@homeberris/http/orderApi';
import { formatDate, formatPrice } from '@homeberris/features/myorders/delivery';
import { useTranslation } from 'react-i18next';

interface Props {
  order: OrderItem;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>) => void;
  onPay: (order: OrderItem) => void;
}

export const OrderCard = React.memo(
  ({ order, onMenuOpen, onPay }: Props) => {
    const { t } = useTranslation('common');
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

    return (
      <div className={styles.orderCard}>
        <div className={styles.orderHeader}>
          <div>
            <span className={styles.orderMeta}>{t('delivery.card.orderNum')}{order.uuid.substring(0, 8).toUpperCase()}</span>
            <span className={styles.orderMeta} style={{ marginLeft: 16 }}>{formatDate(order.createdAt)}</span>
          </div>
          <div className={styles.orderHeaderRight}>
            <span className={`${styles.statusChip} ${styles[`status_${status}`] || styles.status_default}`}>
              {getStatusLabel(status)}
            </span>
            <button className={styles.menuBtn} onClick={onMenuOpen}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.divider} />

        <p className={styles.productName}>{order.catalog?.name}</p>
        <p className={styles.orderQty}>{t('delivery.card.qty')} {order.quantity}</p>
        <p className={styles.orderPrice}>{formatPrice(order.price)}</p>

        {status === 'pending' && (
          <button className={styles.payButton} onClick={() => onPay(order)}>
            {t('delivery.card.payBtn')}
          </button>
        )}
      </div>
    );
  }
);
