'use client';

import React from 'react';
import { BasketDataItem } from '@homeberris/types/basket';
import { Box, Checkbox, IconButton, Typography } from '@mui/material';
import styles from '@homeberris/components/BasketItem/index.module.css';
import Image from 'next/image';
import AnimatedNumber from 'react-animated-number';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  decrementBasketCatalog,
  incrementBasketCatalog,
  removeBasketCatalog
} from '@homeberris/http/basketApi';
import { useCookies } from 'react-cookie';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useToast } from '@homeberris/hooks/useToast';
import Toast from '@homeberris/components/Toast';
import { useIsMobile } from '@homeberris/hooks/useIsMobile';

interface BasketItemProps {
  basket: BasketDataItem;
  isLocal?: boolean;
  onRemove?: (uuid: string) => Promise<void>;
  onUpdateQuantity?: (uuid: string, quantity: number) => Promise<void>;
  selected?: boolean;
  onSelectChange?: (uuid: string, selected: boolean) => void;
}

const BasketItem: React.FC<BasketItemProps> = ({
  basket,
  isLocal = false,
  onRemove,
  onUpdateQuantity,
  selected = false,
  onSelectChange
}) => {
  const queryClient = useQueryClient();
  const [cookies] = useCookies(['token']);
  const { toast, showSuccess, showError, hideToast } = useToast();
  const isMobile = useIsMobile();

  const increment = useMutation({
    mutationFn: (uuid: any) => incrementBasketCatalog(uuid, cookies.token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getAllBaskets'] });
      showSuccess('Количество товара увеличено');
    },
    onError: (error: any) => {
      showError(error?.response?.data?.message || 'Ошибка при изменении количества');
    },
  });

  const decrement = useMutation({
    mutationFn: (uuid: any) => decrementBasketCatalog(uuid, cookies.token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getAllBaskets'] });
      showSuccess('Количество товара уменьшено');
    },
    onError: (error: any) => {
      showError(error?.response?.data?.message || 'Ошибка при изменении количества');
    },
  });

  const remove = useMutation({
    mutationFn: (uuid: any) => removeBasketCatalog(uuid, cookies.token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getAllBaskets'] });
      showSuccess('Товар удален из корзины');
    },
    onError: (error: any) => {
      showError(error?.response?.data?.message || 'Ошибка при удалении товара');
    },
  });

  const handleIncrement = async () => {
    if (isLocal && onUpdateQuantity && basket.uuid) {
      try {
        await onUpdateQuantity(basket.uuid, (basket.quantity || 1) + 1);
        showSuccess('Количество товара увеличено');
      } catch {
        showError('Ошибка при изменении количества');
      }
    } else if (!isLocal) {
      increment.mutate(basket?.catalogUuid);
    }
  };

  const handleDecrement = async () => {
    if (isLocal && onUpdateQuantity && basket.uuid) {
      const newQuantity = Math.max(1, (basket.quantity || 1) - 1);
      try {
        await onUpdateQuantity(basket.uuid, newQuantity);
        showSuccess('Количество товара уменьшено');
      } catch {
        showError('Ошибка при изменении количества');
      }
    } else if (!isLocal) {
      decrement.mutate(basket?.catalogUuid);
    }
  };

  const handleRemove = async () => {
    if (isLocal && onRemove && basket.uuid) {
      try {
        await onRemove(basket.uuid);
        showSuccess('Товар удален из корзины');
      } catch {
        showError('Ошибка при удалении товара');
      }
    } else if (!isLocal) {
      remove.mutate(basket?.uuid);
    }
  };

  const imgSrc = basket?.catalog?.images?.[0]?.imgPath || '/images/cardEmpty.png';

  return (
    <Box className={styles.basketItem}>
      <Toast {...toast} onClose={hideToast} />
      {onSelectChange && basket.uuid && (
        <Checkbox
          checked={selected}
          onChange={(e) => onSelectChange(basket.uuid!, e.target.checked)}
          sx={{ alignSelf: 'flex-start', mt: 1 }}
        />
      )}
      <Box className={styles.imageBox}>
        <Image
          src={imgSrc.startsWith('http') ? imgSrc : '/images/cardEmpty.png'}
          alt={basket?.catalog?.name || ''}
          width={isMobile ? 80 : 100}
          height={isMobile ? 80 : 100}
          style={{ objectFit: 'contain' }}
        />
      </Box>
      <Box className={styles.infoBox}>
        <Typography className={styles.name}>{basket?.catalog?.name}</Typography>
        <Typography className={styles.price}>
          {Number(basket?.catalog?.price || 0).toLocaleString('ru-RU')} ₽
        </Typography>
        <Box className={styles.quantityBox}>
          <IconButton size="small" onClick={handleDecrement}>−</IconButton>
          <AnimatedNumber
            value={basket?.quantity || 1}
            style={{ fontSize: 16, fontWeight: 600, minWidth: 24, textAlign: 'center' }}
            duration={200}
            formatValue={(n: number) => Math.round(n).toString()}
          />
          <IconButton size="small" onClick={handleIncrement}>+</IconButton>
        </Box>
      </Box>
      <IconButton className={styles.removeBtn} onClick={handleRemove}>
        <DeleteOutlinedIcon />
      </IconButton>
    </Box>
  );
};

export default BasketItem;
