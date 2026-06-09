import styles from "@homeberris/features/myorders/delivery/styles/index.module.css";
import { useTranslation } from 'react-i18next';

export const TabsOrder = ({ tabValue, handleTabChange, orders }: { tabValue: any, handleTabChange: any, orders: any }) => {
    const { t } = useTranslation('common');

    const tabs = [
        { label: `${t('delivery.tabs.all')} (${orders?.data?.length || 0})` },
        {
            label: `${t('delivery.tabs.processing')} (${orders?.data?.filter(
                (o: any) =>
                    o.status?.toLowerCase() === 'processing' ||
                    o.status?.toLowerCase() === 'in_progress' ||
                    o.status?.toLowerCase() === 'pending'
            ).length || 0})`
        },
        {
            label: `${t('delivery.tabs.shipped')} (${orders?.data?.filter((o: any) => o.status?.toLowerCase() === 'shipped').length || 0})`
        },
        {
            label: `${t('delivery.tabs.delivered')} (${orders?.data?.filter(
                (o: any) =>
                    o.status?.toLowerCase() === 'delivered' ||
                    o.status?.toLowerCase() === 'completed'
            ).length || 0})`
        },
        {
            label: `${t('delivery.tabs.cancelled')} (${orders?.data?.filter(
                (o: any) =>
                    o.status?.toLowerCase() === 'cancelled' ||
                    o.status?.toLowerCase() === 'canceled'
            ).length || 0})`
        },
    ];

    return (
        <div className={styles.tabsWrapper}>
            {tabs.map((tab, i) => (
                <button
                    key={i}
                    className={`${styles.tab} ${tabValue === i ? styles.tabActive : ''}`}
                    onClick={() => handleTabChange(null, i)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};
