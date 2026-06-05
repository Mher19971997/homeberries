import React from 'react';
import styles from '@homeberris/pages/basket/index.module.css';
import paginationStyles from '@homeberris/pages/catalog/[category]/index.module.css';
import { PaginationLeft, PaginationRight } from '@homeberris/assets/icons/catalog';
import BasketItem from '@homeberris/components/BasketItem';
import { BasketDataItem } from '@homeberris/types/basket';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllBaskets } from '@homeberris/http/basketApi';
import { getDeliveryAddressApi } from '@homeberris/http/deliveryAddressApi';
import { getProfile } from '@homeberris/http/userApi';
import qs from 'qs';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/navigation';
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

  const { data: baskets } = useQuery({
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
  const total = subtotal + tax + SHIPPING;

  const handleCheckout = () => {
    // if (!isAuth) { router.push('/security/login'); return; }
    // if (!currentBaskets?.data?.length) { showToast('Basket is empty', 'warning'); return; }
    // setShowPaymentModal(true);
      console.log('checkout clicked');
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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(price);


  return (
    <>
    <div className={styles.page}>
      <div className={styles.left}>
        <h1 className={styles.title}>{t('basket.title')}</h1>

        <div className={styles.itemsList}>
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
                  }
                }}
                onUpdateQuantity={async (uuid: string, quantity: number) => {
                  if (!isAuth) {
                    await updateBasketItemQuantity(uuid, quantity);
                    setLocalBaskets(await getBasketItems());
                  }
                }}
              />
            ))
          ) : (
            <p className={styles.emptyText}>{t('basket.empty')}</p>
          )}
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
            {Array.from({ length: totalBasketPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`${paginationStyles.pageBtn} ${basketPage === page ? paginationStyles.pageBtnActive : ''}`}
                onClick={() => setBasketPage(page)}
              >
                {page}
              </button>
            ))}
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
            <label className={styles.fieldLabel}>{t('basket.summary.bonusLabel')}</label>
            <div className={styles.inputWrapper}>
              <input
                className={styles.inputWithBtn}
                placeholder={t('basket.summary.bonusPlaceholder')}
                value={bonusCard}
                onChange={(e) => setBonusCard(e.target.value)}
              />
              <button className={styles.applyBtn}>{t('basket.summary.apply')}</button>
            </div>
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
              <span className={styles.rowValue}>{formatPrice(SHIPPING)}</span>
            </div>

            <div className={styles.summaryRow} style={{ marginTop: '24px' }}>
              <span className={styles.rowLabelBold}>{t('basket.summary.total')}</span>
              <span className={styles.totalPrice}>{formatPrice(total)}</span>
            </div>
          </div>

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













// import React, { useEffect } from 'react';
// import {
//   Accordion,
//   AccordionDetails,
//   AccordionSummary,
//   Badge,
//   Box,
//   Button,
//   Card,
//   Checkbox,
//   Grid,
//   Typography
// } from '@mui/material';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import { BasketDataItem } from '@homeberris/types/basket';

// // http
// import { QueryClient, dehydrate, useQuery, useQueryClient } from '@tanstack/react-query';
// import { getAllBaskets } from '@homeberris/http/basketApi';
// import qs from 'qs';

// // Components
// import SelectPaymentMethod from '@homeberris/components/SelectPaymentMethod';
// import { useToast } from '@homeberris/hooks/useToast';
// import OrderDeliveryAdress from '@homeberris/components/OrderDeliveryAdress';
// import BasketItem from '@homeberris/components/BasketItem';
// import PaymentIcons from '@homeberris/components/PaymentIcons';
// import { getDeliveryAddressApi } from '@homeberris/http/deliveryAddressApi';
// import styles from '@homeberris/pages/basket/index.module.css';
// import { getProfile } from '@homeberris/http/userApi';
// import ContactMailIcon from '@mui/icons-material/ContactMail';
// import { User } from '@homeberris/types/user';
// import { getTokenFromCookie, checkToken } from '@homeberris/utils/auth';
// import { useCookies } from 'react-cookie';
// import { useRouter } from 'next/navigation';
// import { getBasketItems, removeFromBasket, updateBasketItemQuantity, clearBasket } from '@homeberris/utils/indexedDB';
// import { useAuth } from '@homeberris/hooks/useAuth';
// import { useTranslation } from 'react-i18next';

// export default function BasketPage() {
//   const { t } = useTranslation('common');
//   const queryClient = useQueryClient();
//   const router = useRouter();
//   const mainRef = React.useRef<any>(null); //represents main section
//   const orderRef = React.useRef<any>(null); //represents main section
//   const [expanded, setExpanded] = React.useState<boolean>(true);
//   const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set());

//   // Обработчик изменения выбора товара
//   const handleItemSelect = (uuid: string, selected: boolean) => {
//     setSelectedItems((prev) => {
//       const newSet = new Set(prev);
//       if (selected) {
//         newSet.add(uuid);
//       } else {
//         newSet.delete(uuid);
//       }
//       return newSet;
//     });
//   };

//   // Обработчик выбора всех товаров
//   const handleSelectAll = (selected: boolean) => {
//     if (currentBaskets?.data) {
//       if (selected) {
//         const allUuids = new Set<string>();
//         currentBaskets.data.forEach((basket: BasketDataItem) => {
//           if (basket.uuid) {
//             allUuids.add(basket.uuid);
//           }
//         });
//         setSelectedItems(allUuids);
//       } else {
//         setSelectedItems(new Set());
//       }
//     }
//   };

//   const handleScroll = (ref: any) => {
//     if (ref) {
//       window?.scrollTo({
//         top: ref.offsetTop - 20,
//         left: 0,
//         behavior: 'smooth'
//       });
//     }
//   };
//   const [cookies] = useCookies(['token']);
//   // const isAuth = checkToken();
//   const isAuth = useAuth();

//   const [localBaskets, setLocalBaskets] = React.useState<any[]>([]);

//   const { data: user } = useQuery<User>({
//     queryKey: ['getProfile'],
//     queryFn: () => getProfile(cookies.token),
//     enabled: !!isAuth && !!cookies.token,
//     retry: false,
//   });

//   const { data: baskets } = useQuery({
//     queryKey: ['getAllBaskets'],
//     queryFn: () => getAllBaskets(qs.stringify({ queryMeta: { paginate: true } }), cookies.token),
//     enabled: !!isAuth && !!cookies.token,
//     retry: false,
//   });

//   // Загружаем корзину из IndexedDB для неавторизованных пользователей
//   React.useEffect(() => {
//     const loadLocalBasket = async () => {
//       if (!isAuth) {
//         try {
//           const items = await getBasketItems();
//           setLocalBaskets(items);
//         } catch (error) {
//           console.error('Ошибка при загрузке корзины из IndexedDB:', error);
//         }
//       }
//     };

//     loadLocalBasket();

//     // Слушаем обновления корзины
//     if (typeof window !== 'undefined') {
//       const handleBasketUpdate = () => {
//         loadLocalBasket();
//       };

//       window.addEventListener('basketUpdated', handleBasketUpdate);

//       return () => {
//         window.removeEventListener('basketUpdated', handleBasketUpdate);
//       };
//     }
//   }, [isAuth]);

//   // Используем корзину из API или из IndexedDB
//   const currentBaskets = isAuth ? baskets : { data: localBaskets, meta: { count: localBaskets.length } };

//   // Инициализируем все товары как выбранные при загрузке
//   React.useEffect(() => {
//     if (currentBaskets?.data && currentBaskets.data.length > 0) {
//       const allUuids = new Set<string>();
//       currentBaskets.data.forEach((basket: BasketDataItem) => {
//         if (basket.uuid) {
//           allUuids.add(basket.uuid);
//         }
//       });
//       setSelectedItems(allUuids);
//     }
//   }, [currentBaskets?.data]);

//   const { data: deliveryAdress } = useQuery({
//     queryKey: ['getDeliveryAddressIsDefault'],
//     queryFn: () => getDeliveryAddressApi(
//       qs.stringify({ isDefault: true, attributeMeta: { exclude: ['lng', 'lat', 'userUuid', 'updatedAt', 'deletedAt'] } }),
//       cookies.token
//     ),
//     enabled: !!isAuth && !!cookies.token,
//     retry: false,
//   });

//   // Вычисляем общую сумму только для выбранных товаров
//   const totalSum = React.useMemo(() => {
//     if (!currentBaskets?.data) return 0;
//     return currentBaskets.data
//       .filter((basket: BasketDataItem) => basket.uuid && selectedItems.has(basket.uuid))
//       .reduce((sum: number, basket: BasketDataItem) => {
//         const price = Number(basket?.catalog?.price) || 0;
//         const quantity = basket.quantity || 1;
//         return sum + (price * quantity);
//       }, 0);
//   }, [currentBaskets?.data, selectedItems]);

//   const totalItems = React.useMemo(() => {
//     if (!currentBaskets?.data) return 0;
//     return currentBaskets.data
//       .filter((basket: BasketDataItem) => basket.uuid && selectedItems.has(basket.uuid))
//       .reduce((sum: number, basket: BasketDataItem) => {
//         return sum + (basket.quantity || 1);
//       }, 0);
//   }, [currentBaskets?.data, selectedItems]);

//   // Получаем UUID выбранных товаров
//   const selectedBasketUuids = React.useMemo(() => {
//     return Array.from(selectedItems);
//   }, [selectedItems]);

//   const formatPrice = (price: number): string => {
//     return new Intl.NumberFormat('ru-RU', {
//       style: 'currency',
//       currency: 'RUB',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//       // }).format(price).replace('₽', '₽');
//     }).format(price);
//   };

//   const handleAccordionChange = (event: React.SyntheticEvent, isExpanded: boolean) => {
//     setExpanded(isExpanded);
//   };

//   const [showPaymentModal, setShowPaymentModal] = React.useState(false);
//   const { showToast } = useToast();

//   // Обработчик успешного платежа
//   const handlePaymentSuccess = async (result: any) => {
//     // Заказ будет создан автоматически через webhook от Stripe
//     showToast('Платеж успешно обработан! Заказ создается...', 'success');
//     setShowPaymentModal(false);

//     // Обновляем данные
//     await queryClient.invalidateQueries({ queryKey: ['getAllBaskets'] });

//     // Ждем немного, чтобы заказ успел создаться через webhook, затем обновляем и перенаправляем
//     setTimeout(async () => {
//       await queryClient.invalidateQueries({ queryKey: ['getAllOrders'] });
//       // Передаем paymentIntentId в URL для отображения информации о платеже
//       const paymentIntentId = result?.paymentIntentId || '';
//       router.push(`/myorders/delivery?paymentSuccess=true&paymentIntentId=${paymentIntentId}`);
//     }, 2000);
//   };

//   const handlePaymentError = (error: string) => {
//     showToast(error || 'Ошибка при обработке платежа', 'error');
//   };

//   // Обработчик нажатия кнопки "Заказать"
//   const handleOrderClick = () => {
//     if (!isAuth) {
//       router.push('/security/login');
//       return;
//     }

//     if (!currentBaskets?.data || currentBaskets.data.length === 0) {
//       showToast('Корзина пуста', 'warning');
//       return;
//     }

//     if (selectedItems.size === 0) {
//       showToast('Выберите хотя бы один товар для заказа', 'warning');
//       return;
//     }

//     // Открываем модальное окно оплаты
//     setShowPaymentModal(true);
//   };

//   return (
//     <Box className={styles.body}>
//       <Box className={styles.leftBox}>
//         <Grid className={styles.container} container spacing={5}>
//           <Grid item xs={12}>
//             <Card className={styles.cardBlock}>
//               <Badge badgeContent={currentBaskets?.meta?.count || 0}>
//                 <Typography variant='h5' fontWeight={'bold'} component="div" suppressHydrationWarning>
//                   {t('basket.title')}
//                 </Typography>
//               </Badge>
//               <Accordion
//                 expanded={expanded}
//                 onChange={handleAccordionChange}
//                 sx={{
//                   boxShadow: 'none',
//                   '&:before': {
//                     display: 'none',
//                   },
//                   '&.Mui-expanded': {
//                     margin: 0,
//                   }
//                 }}
//               >
//                 <AccordionSummary
//                   expandIcon={<ExpandMoreIcon sx={{ color: '#667eea' }} />}
//                   aria-controls='panel1a-content'
//                   id='panel1a-header'
//                   sx={{
//                     minHeight: 56,
//                     '&.Mui-expanded': {
//                       minHeight: 56,
//                     },
//                     padding: 0,
//                     '& .MuiAccordionSummary-content': {
//                       margin: '12px 0',
//                       '&.Mui-expanded': {
//                         margin: '12px 0',
//                       }
//                     }
//                   }}
//                 >
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
//                     <Checkbox
//                       checked={currentBaskets?.data && currentBaskets.data.length > 0 && selectedItems.size === currentBaskets.data.length}
//                       indeterminate={selectedItems.size > 0 && selectedItems.size < (currentBaskets?.data?.length || 0)}
//                       onChange={(e) => handleSelectAll(e.target.checked)}
//                       onClick={(e) => e.stopPropagation()}
//                       sx={{ padding: '4px' }}
//                     />
//                     <Typography component="div" sx={{ fontWeight: 600, fontSize: '16px' }}>
//                       {totalItems} {totalItems === 1 ? `${t('basket.product_one')}` : totalItems < 5 ? `${t('basket.product_few')}` : `${t('basket.product_many')}`}
//                     </Typography>
//                   </Box>
//                 </AccordionSummary>
//                 <AccordionDetails >
//                   {currentBaskets?.data && currentBaskets.data.length > 0 ? (
//                     currentBaskets.data.map(
//                       (basket: BasketDataItem, index: number) => (
//                         <BasketItem
//                           key={basket.uuid || index}
//                           basket={basket}
//                           isLocal={!isAuth}
//                           selected={basket.uuid ? selectedItems.has(basket.uuid) : false}
//                           onSelectChange={handleItemSelect}
//                           onRemove={async (uuid: string) => {
//                             if (!isAuth) {
//                               await removeFromBasket(uuid);
//                               const items = await getBasketItems();
//                               setLocalBaskets(items);
//                               // Удаляем из выбранных
//                               setSelectedItems((prev) => {
//                                 const newSet = new Set(prev);
//                                 newSet.delete(uuid);
//                                 return newSet;
//                               });
//                             }
//                           }}
//                           onUpdateQuantity={async (uuid: string, quantity: number) => {
//                             if (!isAuth) {
//                               await updateBasketItemQuantity(uuid, quantity);
//                               const items = await getBasketItems();
//                               setLocalBaskets(items);
//                             }
//                           }}
//                         />
//                       )
//                     )
//                   ) : (
//                     <Box sx={{ padding: '20px', textAlign: 'center' }}>
//                       <Typography component="div" color="text.secondary">
//                         {t('basket.empty')}
//                       </Typography>
//                       {!isAuth && (
//                         <Typography component="div" color="text.secondary" sx={{ mt: 2, fontSize: '14px' }}>
//                           {t('basket.emptyAuthHint')}
//                         </Typography>
//                       )}
//                     </Box>
//                   )}
//                 </AccordionDetails>
//               </Accordion>
//             </Card>
//           </Grid>
//         </Grid>
//         <Grid
//           className={styles.container}
//           ref={mainRef}
//           container
//           spacing={5}
//           mt={1}
//         >
//           <Grid item xs={12} className={styles.mobileHidden}>
//             <Card className={`${styles.cardBlock}`}>
//               <Typography component="div" suppressHydrationWarning>{t('basket.myData')}</Typography>
//             </Card>
//           </Grid>
//           <Grid item xs={12} container spacing={2}>
//             <Grid item lg={6} md={6} xs={12}>
//               <Card className={styles.cardBlock}>
//                 <Typography component="div" className={styles.cardTitle} suppressHydrationWarning>{t('basket.paymentMethod')}</Typography>
//                 <SelectPaymentMethod
//                   amount={totalSum * 100} // конвертируем в копейки
//                   onPaymentSuccess={handlePaymentSuccess}
//                   onPaymentError={handlePaymentError}
//                 />
//                 <Box className={styles.paymentIconsContainer}>
//                   <PaymentIcons size={48} />
//                 </Box>
//               </Card>
//             </Grid>
//             <Grid item lg={6} md={6} xs={12} className={styles.mobileHidden}>
//               <Card className={styles.cardBlock}>
//                 <Typography component="div" className={styles.cardTitle} suppressHydrationWarning>{t('basket.myData')}</Typography>
//                 <Box className={styles.userProfileInfo}>
//                   <ContactMailIcon className={styles.emailIcon} />
//                   <Typography component="div" className={styles.emailText}>{user?.email || 'Не указан'}</Typography>
//                 </Box>
//               </Card>
//             </Grid>
//             {/* </Box> */}
//           </Grid>
//         </Grid>
//       </Box>
//       <Box className={`${styles.rightBox} ${styles.mobileHidden}`} ref={orderRef}>
//         <Card className={styles.cardBlock}>
//           <OrderDeliveryAdress
//             deliveryAdress={deliveryAdress?.data?.[0] || {}}
//           />
//           <Typography component="div"
//             className={styles.paymentMethodScrollBtn}
//             onClick={() => handleScroll(mainRef.current)}
//           >
//             {t('basket.selectPayment')}
//           </Typography>
//           <Box className={`${styles.priceBlock} ${styles.mobileHidden}`} >
//             <Typography component="div" className={styles.totalLabel} suppressHydrationWarning>{t('basket.total')}</Typography>
//             <Typography component="div" className={styles.totalPrice}>
//               {/* {formatPrice(totalSum)} ₽ */}
//               {formatPrice(totalSum)}
//             </Typography>
//           </Box>
//           <Box className={`${styles.btnGroup} ${styles.mobileHidden}`}>
//             <Button
//               variant='contained'
//               fullWidth
//               className={styles.btnGroupContained}
//               disabled={totalItems === 0}
//               onClick={handleOrderClick}
//             >
//               {t('basket.order')}
//             </Button>
//           </Box>
//         </Card>
//       </Box>
//       <Box className={styles.orderBoxMobile}>
//         <Box>
//           <Typography component="div">{totalItems} {totalItems === 1 ? `${t('basket.product_one')}` : totalItems < 5 ? `${t('basket.product_few')}` : `${t('basket.product_many')}`}</Typography>
//           {/* <Typography className={styles.orderPrice}>{formatPrice(totalSum)} ₽</Typography> */}
//           <Typography component="div" className={styles.orderPrice}>{formatPrice(totalSum)} </Typography>
//         </Box>
//         <Box className={styles.btnGroup}>
//           <Button
//             variant='contained'
//             className={styles.btnGroupContained}
//             onClick={() => handleScroll(orderRef.current)}
//           >
//             {t('basket.orderMobile')}
//           </Button>
//         </Box>
//       </Box>

//       {/* Модальное окно оплаты */}
//       <SelectPaymentMethod
//         amount={totalSum * 100} // конвертируем в копейки
//         open={showPaymentModal}
//         onClose={() => setShowPaymentModal(false)}
//         onPaymentSuccess={handlePaymentSuccess}
//         onPaymentError={handlePaymentError}
//         basketUuids={selectedBasketUuids}
//       />
//     </Box>
//   );
// }

