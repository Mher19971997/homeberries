import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import PaymentIcons from '@homeberris/components/PaymentIcons';

export const SuccessInfo = ({ paymentInfo }: { paymentInfo: any }) => {
    return (
        <Alert
            severity="success"
            icon={<PaymentIcons />}
            sx={{
                mb: 3,
                borderRadius: 2,
                backgroundColor: '#f0f9ff',
                border: '1px solid #10b981'
            }}
        >
            <AlertTitle sx={{ fontWeight: 600, mb: 1 }}>
                Платеж успешно обработан!
            </AlertTitle>
            <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>ID платежа:</strong> {paymentInfo.id}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Сумма:</strong> {((paymentInfo.amount || 0) / 100).toFixed(2)} ₽
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Статус:</strong> {paymentInfo.status === 'succeeded' ? 'Оплачено' : paymentInfo.status}
                </Typography>
                {paymentInfo.description && (
                    <Typography variant="body2">
                        <strong>Описание:</strong> {paymentInfo.description}
                    </Typography>
                )}
            </Box>
        </Alert>
    );
};
