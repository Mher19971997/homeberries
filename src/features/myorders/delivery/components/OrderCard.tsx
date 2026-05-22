import React from 'react';
import {
  Card,
  Typography,
  Box,
  Button,
  Divider,
  Chip,
  IconButton
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PaymentIcon from '@mui/icons-material/Payment';
import { OrderItem } from '@homeberris/http/orderApi';
import { formatDate, formatPrice, getStatusColor, getStatusLabel } from '@homeberris/features/myorders/delivery';

interface Props {
  order: OrderItem;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>) => void;
  onPay: (order: OrderItem) => void;
}

export const OrderCard = React.memo(
  ({ order, onMenuOpen, onPay }: Props) => {
    const status = order.status?.toLowerCase() || '';

    return (
      <Card sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography variant="caption">
              Заказ №{order.uuid.substring(0, 8).toUpperCase()}
            </Typography>
            <Typography variant="caption" sx={{ ml: 2 }}>
              {formatDate(order.createdAt)}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={getStatusLabel(status)}
              color={getStatusColor(status)}
              size="small"
            />
            <IconButton size="small" onClick={onMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography fontWeight={600}>
          {order.catalog?.name}
        </Typography>

        <Typography sx={{ mt: 1 }}>
          Количество: {order.quantity}
        </Typography>

        <Typography fontWeight={700} sx={{ mt: 2 }}>
          {formatPrice(order.price)}
        </Typography>

        {status === 'pending' && (
          <Button
            variant="contained"
            startIcon={<PaymentIcon />}
            sx={{ mt: 2 }}
            onClick={() => onPay(order)}
          >
            Оплатить
          </Button>
        )}
      </Card>
    );
  }
);
