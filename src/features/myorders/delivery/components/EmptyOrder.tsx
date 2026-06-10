import styles from "@homeberris/features/myorders/delivery/styles/index.module.css";
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { useTranslation } from 'react-i18next';

export const EmptyOrder = ({ tabValue }: { tabValue: number }) => {
    const router = useRouter();
    const { t } = useTranslation('common');

    return (
        <div className={styles.emptyCard}>
            <div className={styles.emptyInner}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#e0e0e0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
                    <rect x="1" y="3" width="15" height="13" rx="1" />
                    <path d="M16 8h4l3 5v3h-7V8z" />
                    <circle cx="5.5" cy="18.5" r="1.5" />
                    <circle cx="18.5" cy="18.5" r="1.5" />
                </svg>
                <h6 className={styles.emptyTitle}>
                    {tabValue === 0 ? t('delivery.empty.noOrders') : t('delivery.empty.noOrdersFound')}
                </h6>
                <p className={styles.emptySubtitle}>
                    {tabValue === 0 ? t('delivery.empty.startShopping') : t('delivery.empty.tryOtherTab')}
                </p>
                {tabValue === 0 && (
                    <button className={styles.shopButton} onClick={() => router.push('/')}>
                        {t('delivery.empty.shopBtn')}
                    </button>
                )}
            </div>
        </div>
    );
};
