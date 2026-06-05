import React from 'react';
import styles from './index.module.css';
import { BasketDataItem } from '@homeberris/types/basket';

interface Props {
  basket: BasketDataItem;
  isLocal?: boolean;
  onRemove?: (uuid: string) => void;
  onUpdateQuantity?: (uuid: string, quantity: number) => void;
  selected?: boolean;
  onSelectChange?: (uuid: string, selected: boolean) => void;
}

export default function BasketItem({ basket, onRemove, onUpdateQuantity }: Props) {
  const originalPrice = Number(basket?.catalog?.price) || 0;
  const discount = (basket?.catalog as any)?.discountPercent || 0;
  const isDiscount = (basket?.catalog as any)?.isDiscount && discount > 0;
  const price = isDiscount ? Math.round(originalPrice * (1 - discount / 100)) : originalPrice;
  const quantity = basket.quantity || 1;

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(p);

  const handleDecrease = () => {
    if (quantity > 1) onUpdateQuantity?.(basket.uuid!, quantity - 1);
  };

  const handleIncrease = () => {
    onUpdateQuantity?.(basket.uuid!, quantity + 1);
  };

  const images =
    basket?.catalog?.images?.length > 0
      ? basket.catalog.images.map(({ image }: any) => ({
        imgPath: process.env.NEXT_PUBLIC_BASE_URL + image,
      }))
      : [{ imgPath: '/images/cardEmpty.png' }];

  const imgSrc = images?.[0]?.imgPath || '/images/cardEmpty.png';

  return (
    <div className={styles.item}>
      <img
        className={styles.image}
        src={imgSrc}
        alt={basket?.catalog?.name || 'Product'}
      />
      <div className={styles.info}>
        <p className={styles.name}>{basket?.catalog?.name || '—'}</p>
        <p className={styles.sku}>#121286541212</p>
      </div>
      <div className={styles.controlsRight}>
        <div className={styles.qty}>
          <button className={styles.qtyBtn} onClick={handleDecrease}>
            −
          </button>
          <span className={styles.qtyValue}>{quantity}</span>
          <button className={styles.qtyBtn} onClick={handleIncrease}>
            +
          </button>
        </div>
        <div>
          {isDiscount && (
            <p className={styles.priceOld}>{formatPrice(originalPrice)}</p>
          )}
          <p className={styles.price}>{formatPrice(price)}</p>
        </div>
        <button
          className={styles.removeBtn}
          onClick={() => basket.uuid && onRemove?.(basket.uuid)}
          aria-label="Remove item"
        >
          ✕
        </button>
      </div>
    </div>
  );
}














// 'use client';

// import React from 'react';
// import { BasketDataItem } from '@homeberris/types/basket';
// import { Box, Checkbox, IconButton, Typography } from '@mui/material';
// import styles from '@homeberris/components/BasketItem/index.module.css';
// import Image from 'next/image';
// import AnimatedNumber from 'react-animated-number';
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import {
//   decrementBasketCatalog,
//   incrementBasketCatalog,
//   removeBasketCatalog
// } from '@homeberris/http/basketApi';
// import { useCookies } from 'react-cookie';
// import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
// import { useToast } from '@homeberris/hooks/useToast';
// import Toast from '@homeberris/components/Toast';
// import { useIsMobile } from '@homeberris/hooks/useIsMobile';

// const BasketItem: React.FC<any> = ({
//   basket,
//   isLocal = false,
//   onRemove,
//   onUpdateQuantity,
//   selected = false,
//   onSelectChange
// }) => {
//   const queryClient = useQueryClient();
//   const [cookies] = useCookies(['token', 'accessToken', 'jwt']);
//   const { toast, showSuccess, showError, hideToast } = useToast();
//   const isMobile = useIsMobile();

//   const token = React.useMemo(() => {
//     const raw = (
//       cookies.token ||
//       cookies.accessToken ||
//       cookies.jwt ||
//       (typeof window !== 'undefined' ? localStorage.getItem('token') : '') ||
//       ''
//     ).trim();
//     return raw.split('.').length === 3 ? raw : '';
//   }, [cookies]);

//   const increment = useMutation({
//     mutationFn: (uuid: string) => incrementBasketCatalog(uuid, token),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['getAllBaskets'] });
//       showSuccess('Количество увеличено');
//     },
//     onError: (err: any) => showError(err?.response?.data?.message || 'Ошибка'),
//   });

//   const decrement = useMutation({
//     mutationFn: (uuid: string) => decrementBasketCatalog(uuid, token),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['getAllBaskets'] });
//       showSuccess('Количество уменьшено');
//     },
//     onError: (err: any) => showError(err?.response?.data?.message || 'Ошибка'),
//   });

//   const remove = useMutation({
//     mutationFn: (uuid: string) => removeBasketCatalog(uuid, token),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['getAllBaskets'] });
//       showSuccess('Товар удалён');
//     },
//     onError: (err: any) => showError(err?.response?.data?.message || 'Ошибка'),
//   });

//   const handleIncrement = () => {
//     if (isLocal && onUpdateQuantity) {
//       onUpdateQuantity(basket.uuid!, (basket.quantity || 1) + 1);
//     } else {
//       increment.mutate(basket.catalogUuid || basket.uuid);
//     }
//   };

//   const handleDecrement = () => {
//     if (isLocal && onUpdateQuantity) {
//       const newQ = Math.max(1, (basket.quantity || 1) - 1);
//       onUpdateQuantity(basket.uuid!, newQ);
//     } else {
//       decrement.mutate(basket.catalogUuid || basket.uuid);
//     }
//   };

//   const handleRemove = () => {
//     if (isLocal && onRemove) {
//       onRemove(basket.uuid!);
//     } else {
//       remove.mutate(basket.uuid);
//     }
//   };

//   const imgSrc = basket?.catalog?.images?.[0]?.imgPath || '/images/cardEmpty.png';

//   return (
//     <Box className={styles.basketItem}>
//       <Toast {...toast} onClose={hideToast} />

//       {onSelectChange && basket.uuid && (
//         <Checkbox checked={selected} onChange={(e) => onSelectChange(basket.uuid!, e.target.checked)} />
//       )}

//       <Box className={styles.imageBox}>
//         <Image src={imgSrc} alt={basket?.catalog?.name || ''} width={100} height={100} style={{ objectFit: 'contain' }} />
//       </Box>

//       <Box className={styles.infoBox}>
//         <Typography className={styles.name}>{basket?.catalog?.name}</Typography>
//         <Typography className={styles.price}>
//           {Number(basket?.catalog?.price || 0).toLocaleString('ru-RU')} ₽
//         </Typography>

//         <Box className={styles.quantityBox}>
//           <IconButton onClick={handleDecrement}>−</IconButton>
//           <AnimatedNumber value={basket?.quantity || 1} duration={200} formatValue={(n: number) => n.toString()} />
//           <IconButton onClick={handleIncrement}>+</IconButton>
//         </Box>
//       </Box>

//       <IconButton onClick={handleRemove}>
//         <DeleteOutlinedIcon />
//       </IconButton>
//     </Box>
//   );
// };

// export default BasketItem;
