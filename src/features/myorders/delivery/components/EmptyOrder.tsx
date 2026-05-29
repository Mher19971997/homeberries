import { Box, Button, Card, Typography } from '@mui/material';
import styles from "@homeberris/features/myorders/delivery/styles/index.module.css";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { useRouter } from 'next/navigation';

export const EmptyOrder = ({ tabValue }: { tabValue: number }) => {
    const router = useRouter();

    return (
        <Card className={styles.emptyCard}>
            <Box textAlign="center" py={6}>
                <LocalShippingIcon sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {tabValue === 0
                        ? 'У вас пока нет заказов'
                        : 'Заказы с таким статусом не найдены'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {tabValue === 0
                        ? 'Начните делать покупки, и ваши заказы появятся здесь'
                        : 'Попробуйте выбрать другую вкладку'}
                </Typography>
                {tabValue === 0 && (
                    <Button
                        variant="contained"
                        className={styles.shopButton}
                        onClick={() => router.push('/')}
                    >
                        Перейти к покупкам
                    </Button>
                )}
            </Box>
        </Card>
    );
};
