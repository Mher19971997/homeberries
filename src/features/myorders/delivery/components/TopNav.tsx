import { Box, Typography } from '@mui/material';
import Link from 'next/link';
import styles from "@homeberris/features/myorders/delivery/styles/index.module.css";

export const TopNav = () => {
    return (
        <Box className={styles.topNav}>
            <Link href="/" className={styles.navLink}>
                <Typography>Главная</Typography>
            </Link>
            <Link href="/myorders/delivery" className={styles.navLink}>
                <Typography className={styles.navLinkActive}>Заказы</Typography>
            </Link>
            <Link href="/profile?tab=purchases" className={styles.navLink}>
                <Typography>Покупки</Typography>
            </Link>
            <Link href="/favorites" className={styles.navLink}>
                <Typography>Избранное</Typography>
            </Link>
            <Link href="/profile?tab=bank" className={styles.navLink}>
                <Typography>WB Банк</Typography>
            </Link>
            <Link href="/profile?tab=reviews" className={styles.navLink}>
                <Typography>Отзывы и вопросы</Typography>
            </Link>
            <Link href="/profile?tab=more" className={styles.navLink}>
                <Typography>Ещё разделы</Typography>
            </Link>
        </Box>
    );
};
