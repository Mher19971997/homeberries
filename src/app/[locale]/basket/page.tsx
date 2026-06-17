'use client';

import React from 'react';
import { useFormatPrice } from '@homeberris/utils/formatPrice';
import styles from '@homeberris/app/[locale]/basket/index.module.css';
import paginationStyles from '@homeberris/app/[locale]/catalog/[category]/index.module.css';
import { PaginationLeft, PaginationRight } from '@homeberris/assets/icons/catalog';
import BasketItem from '@homeberris/components/BasketItem';
import { BasketDataItem } from '@homeberris/types/basket';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAllBaskets,
  removeBasketCatalog,
  updateBasketQuantity as updateRemoteBasketQuantity,
} from '@homeberris/http/basketApi';
import { getDeliveryAddressApi } from '@homeberris/http/deliveryAddressApi';
import { getProfile } from '@homeberris/http/userApi';
import qs from 'qs';
import { useCookies } from 'react-cookie';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { useAuth } from '@homeberris/hooks/useAuth';
import { useToast } from '@homeberris/hooks/useToast';
import { useTranslation } from 'react-i18next';
import {
  getBasketItems,
  removeFromBasket,
  updateBasketItemQuantity,
} from '@homeberris/utils/indexedDB';
import SelectPaymentMethod from '@homeberris/components/SelectPaymentMethod';
import CheckoutFlow from '@homeberris/components/CheckoutFlow';
import AuthGuard from '@homeberris/components/AuthGuard';
import Spinner from '@homeberris/components/Spinner';

export default function BasketPage() {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const router = useRouter();
  const [cookies] = useCookies(['token']);
  const isAuth = useAuth();
  const { showToast } = useToast();

  const [localBaskets, setLocalBaskets] = React.useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [basketPage, setBasketPage] = React.useState(1);
  const BASKET_LIMIT = 3;
  const [promoCode, setPromoCode] = React.useState('');
  const [bonusCard, setBonusCard] = React.useState('');
  const [bonusCardError, setBonusCardError] = React.useState(false);
  const [emptyBasketError, setEmptyBasketError] = React.useState(false);

  const { data: baskets, isLoading: isBasketsLoading } = useQuery({
    queryKey: ['getAllBaskets'],
    queryFn: () =>
      getAllBaskets(qs.stringify({ queryMeta: { paginate: true } }), cookies.token),
    enabled: !!isAuth && !!cookies.token,
    retry: false,
  });

  React.useEffect(() => {
    if (!isAuth) {
      getBasketItems().then(setLocalBaskets).catch(console.error);
      const handler = () => getBasketItems().then(setLocalBaskets);
      window.addEventListener('basketUpdated', handler);
      return () => window.removeEventListener('basketUpdated', handler);
    }
  }, [isAuth]);

  const currentBaskets = isAuth
    ? baskets
    : { data: localBaskets, meta: { count: localBaskets.length } };

  const allBasketItems = currentBaskets?.data || [];
  const totalBasketPages = Math.max(1, Math.ceil(allBasketItems.length / BASKET_LIMIT));
  const pagedBasketItems = allBasketItems.slice((basketPage - 1) * BASKET_LIMIT, basketPage * BASKET_LIMIT);

  const TAX_RATE = 0.021; // ~$50 on $2347
  const SHIPPING = 29;

  const subtotal = React.useMemo(() => {
    if (!currentBaskets?.data) return 0;
    return currentBaskets.data.reduce((sum: number, item: BasketDataItem) => {
      return sum + (Number(item?.catalog?.price) || 0) * (item.quantity || 1);
    }, 0);
  }, [currentBaskets?.data]);

  const tax = Math.round(subtotal * TAX_RATE);
  const total = allBasketItems.length > 0 ? subtotal + tax + SHIPPING : 0;

  const handleCheckout = () => {
    if (allBasketItems.length === 0) {
      setEmptyBasketError(true);
      showToast(t('basket.summary.emptyBasketCheckout'), 'warning');
      return;
    }
    setEmptyBasketError(false);
    if (!bonusCard.trim()) {
      setBonusCardError(true);
      showToast(t('basket.summary.bonusRequired'), 'warning');
      return;
    }
    router.push(`/order`);
  };

  const handlePaymentSuccess = async (result: any) => {
    showToast('Payment successful! Order is being created...', 'success');
    setShowPaymentModal(false);
    await queryClient.invalidateQueries({ queryKey: ['getAllBaskets'] });
    setTimeout(async () => {
      await queryClient.invalidateQueries({ queryKey: ['getAllOrders'] });
      router.push(`/myorders/delivery?paymentSuccess=true&paymentIntentId=${result?.paymentIntentId || ''}`);
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    showToast(error || 'Payment error', 'error');
  };

  const { formatPrice } = useFormatPrice();


  if (!isAuth) {
    return (
      <AuthGuard
        icon={
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        }
        title={t('auth.modal.basketTitle')}
        subtitle={t('auth.modal.basketSubtitle')}
      />
    );
  }

  return (
    <>
    <div className={styles.page}>
      <div className={styles.left}>
        <h1 className={styles.title}>{t('basket.title')}</h1>

        <div className={styles.itemsList} style={{ position: 'relative', minHeight: '300px' }}>
          {isBasketsLoading && <Spinner overlay />}
          <div style={{ opacity: isBasketsLoading ? 0.4 : 1, transition: 'opacity 0.2s' }}>
          {allBasketItems.length > 0 ? (
            pagedBasketItems.map((basket: BasketDataItem, index: number) => (
              <BasketItem
                key={basket.uuid || index}
                basket={basket}
                isLocal={!isAuth}
                onRemove={async (uuid: string) => {
                  if (!isAuth) {
                    await removeFromBasket(uuid);
                    setLocalBaskets(await getBasketItems());
                  } else {
                    await removeBasketCatalog(uuid, cookies.token);
                    await queryClient.invalidateQueries({ queryKey: ['getAllBaskets'] });
                  }
                }}
                onUpdateQuantity={async (uuid: string, quantity: number) => {
                  if (!isAuth) {
                    await updateBasketItemQuantity(uuid, quantity);
                    setLocalBaskets(await getBasketItems());
                  } else {
                    await updateRemoteBasketQuantity(uuid, quantity, cookies.token);
                    await queryClient.invalidateQueries({ queryKey: ['getAllBaskets'] });
                  }
                }}
              />
            ))
          ) : (
            <p className={styles.emptyText}>{t('basket.empty')}</p>
          )}
          </div>
        </div>

        {totalBasketPages > 1 && (
          <div className={paginationStyles.pagination}>
            <button
              className={paginationStyles.pageBtn}
              onClick={() => setBasketPage(p => Math.max(1, p - 1))}
              disabled={basketPage === 1}
            >
              <PaginationLeft />
            </button>
            {(() => {
              const pages: (number | string)[] = [];
              if (totalBasketPages <= 4) {
                for (let i = 1; i <= totalBasketPages; i++) pages.push(i);
              } else {
                pages.push(1);
                if (basketPage > 3) pages.push('...');
                const start = Math.max(2, basketPage - 1);
                const end = basketPage <= 2
                  ? Math.min(totalBasketPages - 1, 3)
                  : Math.min(totalBasketPages - 1, basketPage + 1);
                for (let i = start; i <= end; i++) pages.push(i);
                if (basketPage < totalBasketPages - 2) pages.push('...');
                pages.push(totalBasketPages);
              }
              return pages.map((page, i) =>
                page === '...' ? (
                  <span key={`dots-${i}`} className={paginationStyles.pageDots}>...</span>
                ) : (
                  <button
                    key={page}
                    className={`${paginationStyles.pageBtn} ${basketPage === page ? paginationStyles.pageBtnActive : ''}`}
                    onClick={() => setBasketPage(page as number)}
                  >
                    {page}
                  </button>
                )
              );
            })()}
            <button
              className={paginationStyles.pageBtn}
              onClick={() => setBasketPage(p => Math.min(totalBasketPages, p + 1))}
              disabled={basketPage === totalBasketPages}
            >
              <PaginationRight />
            </button>
          </div>
        )}
      </div>

      <div className={styles.right}>
        <div className={styles.summaryCard}>
          <h2 className={styles.summaryTitle}>{t('basket.summary.title')}</h2>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t('basket.summary.promoLabel')}</label>
            <input
              className={styles.input}
              placeholder={t('basket.summary.promoPlaceholder')}
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              {t('basket.summary.bonusLabel')} <span style={{ color: 'red' }}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                className={styles.inputWithBtn}
                placeholder={t('basket.summary.bonusPlaceholder')}
                value={bonusCard}
                onChange={(e) => {
                  setBonusCard(e.target.value);
                  if (bonusCardError) setBonusCardError(false);
                }}
                required
              />
              <button className={styles.applyBtn}>{t('basket.summary.apply')}</button>
            </div>
            {bonusCardError && (
              <span className={styles.errorText}>{t('basket.summary.bonusRequired')}</span>
            )}
          </div>

          <div className={styles.summaryRowsContainer}>
            <div className={styles.summaryRow}>
              <span className={styles.rowLabelBold}>{t('basket.summary.subtotal')}</span>
              <span className={styles.bold}>{formatPrice(subtotal)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.rowLabelValue}>{t('basket.summary.tax')}</span>
              <span className={styles.rowValue}>{formatPrice(tax)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.rowLabelValue}>{t('basket.summary.shipping')}</span>
              <span className={styles.rowValue}>{formatPrice(allBasketItems.length > 0 ? SHIPPING : 0)}</span>
            </div>

            <div className={styles.summaryRow} style={{ marginTop: '24px' }}>
              <span className={styles.rowLabelBold}>{t('basket.summary.total')}</span>
              <span className={styles.totalPrice}>{formatPrice(total)}</span>
            </div>
          </div>

          {emptyBasketError && (
            <span className={styles.errorText}>{t('basket.summary.emptyBasketCheckout')}</span>
          )}

          <button className={styles.checkoutBtn} onClick={handleCheckout}>
            {t('basket.summary.checkout')}
          </button>
        </div>
      </div>

      {/* <SelectPaymentMethod
        amount={total * 100}
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      /> */}
    </div>
    <SelectPaymentMethod
      amount={total * 100}
      open={showPaymentModal}
      onClose={() => setShowPaymentModal(false)}
      onPaymentSuccess={handlePaymentSuccess}
      onPaymentError={handlePaymentError}
    />
    </>
  );
}
