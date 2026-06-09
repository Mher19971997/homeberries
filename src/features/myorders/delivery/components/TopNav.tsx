import Link from 'next/link';
import styles from "@homeberris/features/myorders/delivery/styles/index.module.css";
import { useTranslation } from 'react-i18next';

export const TopNav = () => {
    const { t } = useTranslation('common');
    return (
        <div className={styles.topNav}>
            <Link href="/" className={styles.navLink}>{t('delivery.topNav.home')}</Link>
            <Link href="/myorders/delivery" className={`${styles.navLink} ${styles.navLinkActive}`}>{t('delivery.topNav.orders')}</Link>
            <Link href="/profile?tab=purchases" className={styles.navLink}>{t('delivery.topNav.purchases')}</Link>
            <Link href="/favorites" className={styles.navLink}>{t('delivery.topNav.favorites')}</Link>
            <Link href="/profile?tab=bank" className={styles.navLink}>{t('delivery.topNav.bank')}</Link>
            <Link href="/profile?tab=reviews" className={styles.navLink}>{t('delivery.topNav.reviews')}</Link>
            <Link href="/profile?tab=more" className={styles.navLink}>{t('delivery.topNav.moreSections')}</Link>
        </div>
    );
};
