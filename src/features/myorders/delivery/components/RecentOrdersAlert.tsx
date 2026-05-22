import { Alert, AlertTitle, Box, Typography } from '@mui/material';

export const RecentOrdersAlert = ({ recentOrders }: { recentOrders: any }) => {
    return (
        <Alert
            severity="info"
            sx={{
                mb: 3,
                borderRadius: 2,
                backgroundColor: '#eff6ff',
                border: '1px solid #3b82f6'
            }}
        >
            <AlertTitle sx={{ fontWeight: 600 }}>
                Показаны только что купленные товары ({recentOrders.length})
            </AlertTitle>
            <Typography variant="body2" sx={{ mt: 1 }}>
                Ниже отображаются товары, которые вы только что оплатили.
                Для просмотра всех заказов переключитесь на вкладку &quot;Все&quot;.
            </Typography>
        </Alert>
    );
};
