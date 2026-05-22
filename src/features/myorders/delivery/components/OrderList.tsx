import { Grid } from '@mui/material';
import { OrderItem } from '@homeberris/http/orderApi';
import { EmptyOrder, LoadingOrder, OrderCard } from '@homeberris/features/myorders/delivery';

interface Props {
  isLoading: boolean;
  orders: OrderItem[];
  tabValue: number;
  onMenuOpen: any;
  onPay: any;
}

export const OrderList = ({
  isLoading,
  orders,
  tabValue,
  onMenuOpen,
  onPay
}: Props) => {
  if (isLoading) return <LoadingOrder />;
  if (orders.length === 0) return <EmptyOrder tabValue={tabValue} />;

  return (
    <Grid container spacing={2}>
      {orders.map(order => (
        <Grid item xs={12} key={order.uuid}>
          <OrderCard
            order={order}
            onMenuOpen={onMenuOpen}
            onPay={onPay}
          />
        </Grid>
      ))}
    </Grid>
  );
};
