import { useMemo, useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useCookies } from 'react-cookie';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { useSearchParams } from 'next/navigation';
import * as qs from 'qs';
import { getAllOrders, OrderItem } from '@homeberris/http/orderApi';
import { getPaymentIntent } from '@homeberris/http/paymentApi';
import { useToast } from '@homeberris/hooks/useToast';
import { useTranslation } from 'next-i18next';

const processingStatuses = new Set([
  'processing',
  'in_progress',
  'pending',
  'paid'
]);

const deliveredStatuses = new Set(['delivered', 'completed']);
const cancelledStatuses = new Set(['cancelled', 'canceled']);

const PAGE_SIZE = 10;

export const useDelivery = () => {
  const { t } = useTranslation('common');
  const [cookies] = useCookies(['token']);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [menuOrder, setMenuOrder] = useState<OrderItem | null>(null);
  const [orderToPay, setOrderToPay] = useState<OrderItem | null>(null);
  const [detailOrder, setDetailOrder] = useState<OrderItem | null>(null);

  const searchParams = useSearchParams();
  const paymentSuccess = searchParams?.get('paymentSuccess');
  const paymentIntentId = searchParams?.get('paymentIntentId');
  const isPaymentSuccess =
    paymentSuccess === 'true' && Boolean(paymentIntentId);

  // При смене таба сбрасываем страницу
  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, value: number) => {
      setTabValue(value);
      setPage(1);
    },
    []
  );

  const statusFilter: Record<number, string | null> = {
    0: null,
    1: 'processing,in_progress,pending,paid',
    2: 'shipped',
    3: 'delivered,completed',
    4: 'cancelled,canceled',
  };

  const { data: orders, isLoading } = useQuery({
    queryKey: ['getAllOrders', page, tabValue],
    queryFn: () => {
      const filter = statusFilter[tabValue];
      return getAllOrders(
        qs.stringify({
          queryMeta: { paginate: true, limit: PAGE_SIZE, page, order: { createdAt: 'DESC' } },
          ...(filter ? { filterMeta: { status: { in: filter.split(',') } } } : {}),
        }),
        cookies.token
      );
    },
    enabled: !!cookies.token,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const { data: paymentInfo } = useQuery({
    queryKey: ['getPaymentIntent', paymentIntentId],
    queryFn: () => getPaymentIntent(paymentIntentId as string),
    enabled: Boolean(paymentIntentId && cookies.token),
  });

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
    if (isPaymentSuccess && recentOrders.length > 0) return recentOrders;
    return orders.data;
  }, [orders?.data, isPaymentSuccess, recentOrders]);

  const totalCount = orders?.meta?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handleMenuOpen = useCallback(
    (e: React.MouseEvent<HTMLElement>, order: OrderItem) => {
      setAnchorEl(e.currentTarget);
      setMenuOrder(order);
    },
    []
  );

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setMenuOrder(null);
  }, []);

  const handlePayOrder = useCallback((order: OrderItem) => {
    setOrderToPay(order);
  }, []);

  const handlePaymentSuccess = useCallback(async () => {
    showToast(t('delivery.success.title'), 'success');
    setOrderToPay(null);
    await queryClient.invalidateQueries({ queryKey: ['getAllOrders'] });
  }, [queryClient, showToast]);

  const handlePaymentError = useCallback(
    (err: string) => {
      showToast(err || t('delivery.paymentError'), 'error');
    },
    [showToast]
  );

  useEffect(() => {
    if (!isPaymentSuccess) return;

    const timer = setTimeout(() => {
      router.replace('/myorders/delivery');
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
    menuOrder,
    orderToPay,
    setOrderToPay,
    detailOrder,
    setDetailOrder,
    page,
    setPage,
    totalPages,
    totalCount,
    handleTabChange,
    handleMenuOpen,
    handleMenuClose,
    handlePayOrder,
    handlePaymentSuccess,
    handlePaymentError
  };
};
