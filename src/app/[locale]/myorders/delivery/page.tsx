'use client';

import { Suspense } from 'react';
import styles from '@homeberris/features/myorders/delivery/styles/index.module.css';
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
import { useTranslation } from 'react-i18next';

function DeliveryPage() {
  const delivery = useDelivery();
  const { t } = useTranslation('common');

  return (
    <div className={styles.body}>
      <div className={styles.container}>
      <TopNav />

      <h4 className={styles.pageTitle}>{t('delivery.pageTitle')}</h4>

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
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <DeliveryPage />
    </Suspense>
  );
}
