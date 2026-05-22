import { useMemo, useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';
import * as qs from 'qs';
import { getAllOrders, OrderItem } from '@homeberris/http/orderApi';
import { getPaymentIntent } from '@homeberris/http/paymentApi';
import { useToast } from '@homeberris/hooks/useToast';

const processingStatuses = new Set([
  'processing',
  'in_progress',
  'pending',
  'paid'
]);

const deliveredStatuses = new Set(['delivered', 'completed']);
const cancelledStatuses = new Set(['cancelled', 'canceled']);

export const useDelivery = () => {
  const [cookies] = useCookies(['token']);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [orderToPay, setOrderToPay] = useState<OrderItem | null>(null);

  const { paymentSuccess, paymentIntentId } = router.query;
  const isPaymentSuccess =
    paymentSuccess === 'true' && Boolean(paymentIntentId);

  const { data: orders, isLoading } = useQuery(
    ['getAllOrders'],
    () =>
      getAllOrders(
        qs.stringify({ queryMeta: { paginate: true } }),
        cookies.token
      ),
    {
      enabled: !!cookies.token,
      refetchOnWindowFocus: false
    }
  );

  const { data: paymentInfo } = useQuery(
    ['getPaymentIntent', paymentIntentId],
    () => getPaymentIntent(paymentIntentId as string),
    {
      enabled: Boolean(paymentIntentId && cookies.token)
    }
  );

  const recentOrders = useMemo(() => {
    if (!orders?.data) return [];
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    return orders.data.filter((order) => {
      const status = order.status?.toLowerCase() || '';
      const created = new Date(order.createdAt).getTime();

      return created >= fiveMinutesAgo &&
        (status === 'paid' || status === 'pending');
    });
  }, [orders?.data]);

  const filteredOrders = useMemo(() => {
    if (!orders?.data) return [];

    if (isPaymentSuccess && recentOrders.length > 0)
      return recentOrders;

    switch (tabValue) {
      case 1:
        return orders.data.filter(o =>
          processingStatuses.has(o.status?.toLowerCase() || '')
        );
      case 2:
        return orders.data.filter(
          o => o.status?.toLowerCase() === 'shipped'
        );
      case 3:
        return orders.data.filter(o =>
          deliveredStatuses.has(o.status?.toLowerCase() || '')
        );
      case 4:
        return orders.data.filter(o =>
          cancelledStatuses.has(o.status?.toLowerCase() || '')
        );
      default:
        return orders.data;
    }
  }, [orders?.data, tabValue, isPaymentSuccess, recentOrders]);

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, value: number) => {
      setTabValue(value);
    },
    []
  );

  const handleMenuOpen = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(e.currentTarget);
    },
    []
  );

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handlePayOrder = useCallback((order: OrderItem) => {
    setOrderToPay(order);
  }, []);

  const handlePaymentSuccess = useCallback(async () => {
    showToast('Платеж успешно обработан!', 'success');
    setOrderToPay(null);
    await queryClient.invalidateQueries({ queryKey: ['getAllOrders'] });
  }, [queryClient, showToast]);

  const handlePaymentError = useCallback(
    (err: string) => {
      showToast(err || 'Ошибка оплаты', 'error');
    },
    [showToast]
  );

  useEffect(() => {
    if (!isPaymentSuccess) return;

    const timer = setTimeout(() => {
      router.replace('/myorders/delivery', undefined, {
        shallow: true
      });
    }, 8000);

    return () => clearTimeout(timer);
  }, [isPaymentSuccess, router]);

  return {
    tabValue,
    isLoading,
    orders,
    paymentInfo,
    filteredOrders,
    recentOrders,
    isPaymentSuccess,
    anchorEl,
    orderToPay,
    setOrderToPay,
    handleTabChange,
    handleMenuOpen,
    handleMenuClose,
    handlePayOrder,
    handlePaymentSuccess,
    handlePaymentError
  };
};
