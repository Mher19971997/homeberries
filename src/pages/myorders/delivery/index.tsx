import { Box, Typography } from '@mui/material';
import {
  useDelivery
} from '@homeberris/features/myorders/delivery/hooks/useDelivery';
import {
  OrderList,
  OrderMenu,
  PaymentModal,
  SuccessInfo,
  RecentOrdersAlert,
  TabsOrder,
  TopNav
} from '@homeberris/features/myorders/delivery/components';

export default function DeliveryPage() {
  const delivery = useDelivery();

  return (
    <Box>
      <TopNav />

      <Typography variant="h4" sx={{ mb: 3 }}>
        Мои заказы
      </Typography>

      {delivery.isPaymentSuccess && delivery.paymentInfo && (
        <SuccessInfo paymentInfo={delivery.paymentInfo} />
      )}

      {delivery.isPaymentSuccess && delivery.recentOrders.length > 0 && (
        <RecentOrdersAlert recentOrders={delivery.recentOrders} />
      )}

      <TabsOrder
        tabValue={delivery.tabValue}
        handleTabChange={delivery.handleTabChange}
        orders={delivery.orders}
      />

      <OrderList
        isLoading={delivery.isLoading}
        orders={delivery.filteredOrders}
        tabValue={delivery.tabValue}
        onMenuOpen={delivery.handleMenuOpen}
        onPay={delivery.handlePayOrder}
      />

      <OrderMenu
        anchorEl={delivery.anchorEl}
        onClose={delivery.handleMenuClose}
      />

      <PaymentModal
        order={delivery.orderToPay}
        onClose={() => delivery.setOrderToPay(null)}
        onSuccess={delivery.handlePaymentSuccess}
        onError={delivery.handlePaymentError}
      />
    </Box>
  );
}