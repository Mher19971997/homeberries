import React, { useMemo } from 'react';
import { useHover } from '@homeberris/hooks/useHover';
import { Box, Button, IconButton, Typography, Chip } from '@mui/material';
import EmtpImg from 'public/images/cardEmpty.png';
import CardSlider from '@homeberris/components/CardSlider';
import PositionedSnackbar from '@homeberris/components/PositionedSnackbar';
import { CatalogItem } from '@homeberris/types/catalog';
import { insertBasket } from '@homeberris/http/basketApi';
import { useMutation, useQueryClient } from 'react-query';
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import styles from '@homeberris/components/CatalogCard/index.module.css';
import { useCookies } from 'react-cookie';
import { checkToken } from '@homeberris/utils/auth';
import { addToBasket } from '@homeberris/utils/indexedDB';
import { useFavorites } from '@homeberris/context/favoritesContext';
import { useTranslation } from 'react-i18next';

interface CatalogCardProps {
  catalog: CatalogItem;
  catalogsPage: boolean;
  sortPanelOne: boolean;
  onNavigate?: () => void;
}

const CatalogCard: React.FC<CatalogCardProps> = ({
  catalog,
  catalogsPage = false,
  sortPanelOne,
  onNavigate
}) => {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const ref = React.useRef<HTMLDivElement | null>(null);
  const isHovering = useHover(ref);
  const [checkCreatedBasket, setCheckCreatedBasket] = React.useState<boolean>(false);
  const [openSuccess, setOpenSuccess] = React.useState<boolean>(false);
  const [cookies] = useCookies(['token']);
  const { isFavorite, toggleFavorite } = useFavorites();
  const isAuth = checkToken();

  // Добавление в корзину для авторизованных пользователей
  const { mutate, isError } = useMutation(
    (catalogUuid: string) => insertBasket({ catalogUuid }, cookies.token),
    {
      onSuccess: (response, formData) => {
        queryClient.invalidateQueries('basketCount');
        queryClient.invalidateQueries('getAllBaskets');
        setCheckCreatedBasket(true);
        setOpenSuccess(true);
      },
      onError: (error) => {
        setCheckCreatedBasket(false);
        console.log(error);
      }
    }
  );

  // Добавление в корзину для неавторизованных пользователей (IndexedDB)
  const addToLocalBasket = React.useCallback(async () => {
    try {
      await addToBasket(catalog, 1);
      setCheckCreatedBasket(true);
      setOpenSuccess(true);
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error);
    }
  }, [catalog]);

  // Форматирование цены
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice).replace('₽', '₽');
  };

  // Вычисление скидки, рейтинга и даты доставки (стабильные значения на основе UUID товара)
  const cardData = useMemo(() => {
    // Используем UUID товара как seed для генерации стабильных значений
    const uuidHash = catalog.uuid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seed = uuidHash % 1000;

    // Генерируем стабильные значения на основе seed
    const discount = 20 + (seed % 50); // 20-70%
    const oldPrice = catalog?.price ? Math.round(Number(catalog.price) / (1 - discount / 100)) : 0;
    const hasDiscount = discount > 0;

    // Рейтинг (4.5-5.0)
    const rating = (4.5 + (seed % 50) / 100).toFixed(1);
    const reviewsCount = 100 + (seed % 500);

    // Дата доставки (1-7 дней)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 1 + (seed % 7));
    const deliveryDateStr = deliveryDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

    return {
      discount,
      oldPrice,
      hasDiscount,
      rating,
      reviewsCount,
      deliveryDateStr
    };
  }, [catalog.uuid, catalog.price]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(catalog);
  };

  const handleAddToBasket = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (isAuth && cookies.token) {
      mutate(catalog.uuid);
    } else {
      addToLocalBasket();
    }
  };

  return (
    <Box
      component="div"
      className={[styles.cardBody, sortPanelOne && styles.sortPanelOne].join(' ')}
      ref={ref}
    >
      <PositionedSnackbar
        open={openSuccess}
        handleClose={() => setOpenSuccess(false)}
        message={t('card.basket.added')}
      />

      <Box onClick={onNavigate} className={styles.cardContent}>
        {/* Изображение с бейджами */}
        <Box className={styles.imageContainer}>
          {cardData.hasDiscount && (
            <Box className={styles.discountBadge}>
              -{cardData.discount}%
            </Box>
          )}
          <IconButton
            className={styles.favoriteButton}
            onClick={handleFavoriteClick}
            size="small"
          >
            {isFavorite(catalog.uuid) ? (
              <FavoriteIcon sx={{ color: '#ff6b9d', fontSize: 24 }} />
            ) : (
              <FavoriteBorderIcon sx={{ color: 'white', fontSize: 24 }} />
            )}
          </IconButton>
          <CardSlider
            images={
              catalog?.images?.length > 0
                ? catalog.images.map(({ image }: any) => ({
                  imgPath: process.env.NEXT_PUBLIC_BASE_URL + image
                }))
                : [{ imgPath: EmtpImg.src }]
            }
          />
        </Box>

        <Box className={styles.cardInfo}>
          {/* Цена */}
          <Box className={styles.priceContainer}>
            <Typography className={styles.price}>
              {formatPrice(catalog?.price || 0)}
            </Typography>
            {cardData.hasDiscount && (
              <Typography className={styles.oldPrice}>
                {formatPrice(cardData.oldPrice)}
              </Typography>
            )}
          </Box>

          {/* Информация о WB Кошельке */}
          <Typography className={styles.walletInfo}>
            {t('card.walletInfo')}
          </Typography>

          {/* Название товара */}
          <Typography className={styles.catalogName}>
            {catalog?.category?.name || ''} / {catalog?.name}
          </Typography>

          {/* Рейтинг */}
          <Box className={styles.ratingContainer}>
            <StarIcon className={styles.starIcon} />
            <Typography className={styles.rating}>{cardData.rating}</Typography>
            <Typography className={styles.reviewsCount}>
              {cardData.reviewsCount} {cardData.reviewsCount === 1 ? `${t('card.rating.reviews.1')}` : cardData.reviewsCount < 5 ? `${t('card.rating.reviews.few')}` : `${t('card.rating.reviews.many')}`}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Кнопка "В корзину" с датой */}
      <Box className={styles.basketButtonContainer}>
        <Button
          variant="contained"
          fullWidth
          className={styles.basketButton}
          // onClick={(e) => {
          //   e.stopPropagation();
          //   if (isAuth && cookies.token) {
          //     mutate(catalog.uuid);
          //   } else {
          //     addToLocalBasket();
          //   }
          // }}
          onClick={handleAddToBasket}
          startIcon={<ShoppingCartOutlinedIcon />}
        >
          {cardData.deliveryDateStr}
        </Button>
      </Box>
    </Box>
  );
};

export default CatalogCard;
