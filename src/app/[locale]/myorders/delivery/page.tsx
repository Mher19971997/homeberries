'use client';

import { Suspense } from 'react';
import styles from '@homeberris/features/myorders/delivery/styles/index.module.css';
import paginationStyles from '@homeberris/app/[locale]/catalog/[category]/index.module.css';
import { PaginationLeft, PaginationRight } from '@homeberris/assets/icons/catalog';
import { useDelivery } from '@homeberris/features/myorders/delivery/hooks/useDelivery';
import {
  OrderList,
  OrderMenu,
  PaymentModal,
  SuccessInfo,
  RecentOrdersAlert,
  TabsOrder,
  OrderDetailModal,
} from '@homeberris/features/myorders/delivery/components';
import { useTranslation } from 'react-i18next';

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  if (totalPages <= 4) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    const start = Math.max(2, page - 1);
    const end = page <= 2 ? Math.min(totalPages - 1, 3) : Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className={paginationStyles.pagination}>
      <button className={paginationStyles.pageBtn} onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1}>
        <PaginationLeft />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className={paginationStyles.pageDots}>...</span>
        ) : (
          <button
            key={p}
            className={`${paginationStyles.pageBtn} ${page === p ? paginationStyles.pageBtnActive : ''}`}
            onClick={() => onPage(p as number)}
          >
            {p}
          </button>
        )
      )}
      <button className={paginationStyles.pageBtn} onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
        <PaginationRight />
      </button>
    </div>
  );
}

function DeliveryPage() {
  const delivery = useDelivery();
  const { t } = useTranslation('common');

  return (
    <div className={styles.body}>
      <div className={styles.container}>
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

        <Pagination
          page={delivery.page}
          totalPages={delivery.totalPages}
          onPage={delivery.setPage}
        />

        <OrderMenu
          anchorEl={delivery.anchorEl}
          onClose={delivery.handleMenuClose}
          onDetails={() => delivery.setDetailOrder(delivery.menuOrder)}
        />

        <OrderDetailModal
          order={delivery.detailOrder}
          onClose={() => delivery.setDetailOrder(null)}
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
