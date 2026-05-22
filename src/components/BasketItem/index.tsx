import React, { useEffect } from 'react';
import { BasketDataItem } from '@homeberris/types/basket';
import { Box, Checkbox, IconButton, Typography } from '@mui/material';
import styles from '@homeberris/components/BasketItem/index.module.css';
import Image from 'next/image';
import AnimatedNumber from 'react-animated-number';
import { useMutation, useQueryClient } from 'react-query';
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
  const isMobile = useIsMobile()

  const increment = useMutation(
    (uuid: any) => incrementBasketCatalog(uuid, cookies.token),
    {
      onSuccess: (response, formData) => {
        queryClient.invalidateQueries('getAllBaskets');
        showSuccess('Количество товара увеличено');
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || 'Ошибка при изменении количества';
        showError(errorMessage);
      }
    }
  );

  const decrement = useMutation(
    (uuid: any) => decrementBasketCatalog(uuid, cookies.token),
    {
      onSuccess: (response, formData) => {
        queryClient.invalidateQueries('getAllBaskets');
        showSuccess('Количество товара уменьшено');
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || 'Ошибка при изменении количества';
        showError(errorMessage);
      }
    }
  );

  const remove = useMutation(
    (uuid: any) => removeBasketCatalog(uuid, cookies.token),
    {
      onSuccess: (response, formData) => {
        queryClient.invalidateQueries('getAllBaskets');
        showSuccess('Товар удален из корзины');
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || 'Ошибка при удалении товара';
        showError(errorMessage);
      }
    }
  );

  // Обработчики для локальной корзины (IndexedDB)
  const handleIncrement = async () => {
    if (isLocal && onUpdateQuantity && basket.uuid) {
      try {
        await onUpdateQuantity(basket.uuid, (basket.quantity || 1) + 1);
        showSuccess('Количество товара увеличено');
      } catch (error) {
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
      } catch (error) {
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
      } catch (error) {
        showError('Ошибка при удалении товара');
      }
    } else if (!isLocal) {
      remove.mutate(basket.uuid);
    }
  };

  useEffect(() => { }, [basket]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectChange && basket.uuid) {
      onSelectChange(basket.uuid, event.target.checked);
    }
  };

  return (
    <Box className={styles.body}>
      <Checkbox
        className={styles.checkbox}
        checked={selected}
        onChange={handleCheckboxChange}
      />
      <Box className={styles.cardBlockLeft}>
        <Box>
          <Box className={styles.imageContainer}>
            <Image
              src={
                process.env.NEXT_PUBLIC_BASE_URL +
                basket?.catalog?.images?.[0]?.image
              }
              alt={basket?.catalog?.name || ''}
              width={120}
              height={160}
              className={styles.productImage}
            />
          </Box>
          <Box className={styles.quantityBoxMobile}>
            <Box className={styles.quantityMobile}>
              <button
                className={styles.quantityBtn}
                onClick={handleDecrement}
              >
                -
              </button>
              <Typography>{basket.quantity || 1}</Typography>
              <button
                className={styles.quantityBtn}
                onClick={handleIncrement}
              >
                +
              </button>
            </Box>

            {/* <DeleteOutlineOutlinedIcon/> */}
          </Box>
        </Box>
        <Box>
          <Typography className={styles.priceMobile}>
            {basket?.catalog?.price && (
              <AnimatedNumber
                value={(basket.quantity || 1) * Number(basket?.catalog?.price)}
                duration={400}
                formatValue={(n: any) => n.toFixed(0)}
                frameStyle={(percentage: number) =>
                  percentage > 20 && percentage < 80 ? { opacity: 0.5 } : {}
                }
              />
            )}{' '}
            драм
          </Typography>
          <Typography className={styles.basketItemName}>
            {basket?.catalog?.name}
          </Typography>
        </Box>
      </Box>
      <Box className={styles.quantityBox}>
        <button
          className={styles.quantityBtn}
          onClick={handleDecrement}
        >
          -
        </button>
        <Typography>{basket.quantity || 1}</Typography>
        <button
          className={styles.quantityBtn}
          onClick={handleIncrement}
        >
          +
        </button>
      </Box>
      <Box className={styles.deleteBtnMobile}>
        <IconButton onClick={handleRemove}>
          <DeleteOutlinedIcon />
        </IconButton>
      </Box>
      <Box className={styles.priceBlockLG}>
        <Typography className={styles.price}>
          {basket?.catalog?.price && (
            <AnimatedNumber
              value={(basket.quantity || 1) * Number(basket?.catalog?.price)}
              duration={400}
              formatValue={(n: any) => n.toFixed(0)}
              frameStyle={(percentage: number) =>
                percentage > 20 && percentage < 80 ? { opacity: 0.5 } : {}
              }
            />
          )}
          драм
        </Typography>
        <IconButton onClick={handleRemove}>
          <DeleteOutlinedIcon />
        </IconButton>
      </Box>

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </Box>
  );
};

export default BasketItem;
