import styles from "@homeberris/features/myorders/delivery/styles/index.module.css";

export const LoadingOrder = () => {
    return (
        <div className={styles.loadingList} suppressHydrationWarning>
            {[1, 2, 3].map((i) => (
                <div key={i} className={styles.orderCard} suppressHydrationWarning>
                    <div className={styles.skeleton} style={{ height: 120 }} suppressHydrationWarning />
                </div>
            ))}
        </div>
    );
};
