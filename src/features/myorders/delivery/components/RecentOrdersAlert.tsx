import styles from "@homeberris/features/myorders/delivery/styles/index.module.css";
import { useTranslation } from 'next-i18next';

export const RecentOrdersAlert = ({ recentOrders }: { recentOrders: any }) => {
    const { t } = useTranslation('common');
    return (
        <div className={styles.alertBox}>
            <p className={styles.alertTitle}>
                {t('delivery.recentOrders.title', { count: recentOrders.length })}
            </p>
            <p className={styles.alertText}>
                {t('delivery.recentOrders.text')}
            </p>
        </div>
    );
};
