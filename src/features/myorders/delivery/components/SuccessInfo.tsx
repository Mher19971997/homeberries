import styles from "@homeberris/features/myorders/delivery/styles/index.module.css";
import PaymentIcons from '@homeberris/components/PaymentIcons';
import { useTranslation } from 'react-i18next';

export const SuccessInfo = ({ paymentInfo }: { paymentInfo: any }) => {
    const { t } = useTranslation('common');
    return (
        <div className={styles.successBox}>
            <div className={styles.successHeader}>
                <PaymentIcons />
                <p className={styles.successTitle}>{t('delivery.success.title')}</p>
            </div>
            <div className={styles.successDetails}>
                <p className={styles.successRow}><strong>{t('delivery.success.paymentId')}:</strong> {paymentInfo.id}</p>
                <p className={styles.successRow}><strong>{t('delivery.success.amount')}:</strong> {((paymentInfo.amount || 0) / 100).toFixed(2)} ₽</p>
                <p className={styles.successRow}><strong>{t('delivery.success.status')}:</strong> {paymentInfo.status === 'succeeded' ? t('delivery.success.paid') : paymentInfo.status}</p>
                {paymentInfo.description && (
                    <p className={styles.successRow}><strong>{t('delivery.success.description')}:</strong> {paymentInfo.description}</p>
                )}
            </div>
        </div>
    );
};
