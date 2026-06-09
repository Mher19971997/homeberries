import styles from "@homeberris/features/myorders/delivery/styles/index.module.css";

export const RecentOrdersAlert = ({ recentOrders }: { recentOrders: any }) => {
    return (
        <div className={styles.alertBox}>
            <p className={styles.alertTitle}>
                Показаны только что купленные товары ({recentOrders.length})
            </p>
            <p className={styles.alertText}>
                Ниже отображаются товары, которые вы только что оплатили.
                Для просмотра всех заказов переключитесь на вкладку &quot;Все&quot;.
            </p>
        </div>
    );
};
