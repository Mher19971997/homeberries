'use client';

import React from 'react';
import EmtpImg from '@homeberris/assets/cardEmpty.png';

import PositionedSnackbar from '@homeberris/components/PositionedSnackbar';
import { CatalogItem } from '@homeberris/types/catalog';
import { insertBasket } from '@homeberris/http/basketApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCookies } from 'react-cookie';
import { checkToken, getToken } from '@homeberris/utils/auth';
import { addToBasket } from '@homeberris/utils/indexedDB';
import { useFavorites } from '@homeberris/context/favoritesContext';
import styles from './index.module.css';
import { HeartFilledIcon, HeartIcon } from '@homeberris/assets/icons/catalog';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';
import { useFormatPrice } from '@homeberris/utils/formatPrice';

interface CatalogCardProps {
  catalog: CatalogItem;
  sortPanelOne?: boolean;
  onNavigate?: () => void;
}

const getLoc = (val: any, locale: string): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[locale] || val.ru || '';
};

const CatalogCard: React.FC<CatalogCardProps> = ({ catalog, onNavigate }) => {
  const { t } = useTranslation('common');
  const params = useParams();
  const locale = (params?.locale as string) ?? 'ru';
  const queryClient = useQueryClient();
  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [cookies] = useCookies(['token']);
  const { isFavorite, toggleFavorite } = useFavorites();
  const isAuth = checkToken();

  const { mutate } = useMutation({
    mutationFn: (catalogUuid: string) => insertBasket({ catalogUuid, quantity: 1 }, getToken() || cookies.token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['basketCount'] });
      queryClient.invalidateQueries({ queryKey: ['getAllBaskets'] });
      setOpenSuccess(true);
    },
    onError: (error) => console.error(error),
  });

  const handleAddToBasket = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isAuth && cookies.token) {
      mutate(catalog.uuid);
    } else {
      addToBasket(catalog, 1)
        .then(() => setOpenSuccess(true))
        .catch((err) => console.error(err));
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(catalog);
  };

  const { formatPrice } = useFormatPrice();

  const imgSrc =
    catalog?.images?.length > 0
      ? process.env.NEXT_PUBLIC_BASE_URL! + catalog.images[0].image
      : EmtpImg.src;

  return (
    <div className={styles.card} onClick={onNavigate}>
      <PositionedSnackbar
        open={openSuccess}
        handleClose={() => setOpenSuccess(false)}
        message={t('basket.addedToBasket')}
        productName={getLoc(catalog?.name, locale)}
      />

      <div className={styles.inner}>
        <div className={styles.favoriteRow}>
          <button className={styles.favoriteButton} onClick={handleFavoriteClick} aria-label="Favourite">
            {isFavorite(catalog.uuid)
              ? <HeartFilledIcon/>
              : <HeartIcon />
            }
          </button>
        </div>

        <div className={styles.imageWrap}>
          <img
            src={imgSrc}
            alt={getLoc(catalog?.name, locale)}
            onError={(e) => { (e.target as HTMLImageElement).src = EmtpImg.src; }}
          />
        </div>

        <div className={styles.body}>
          <p className={styles.name}>{getLoc(catalog?.name, locale)}</p>
          {catalog?.isDiscount && catalog?.discountPercent > 0 ? (
            <div className={styles.priceBlock}>
              <p className={styles.priceOld}>{formatPrice(catalog?.price)}</p>
              <p className={styles.price}>
                {formatPrice(Math.round(Number(catalog.price) * (1 - catalog.discountPercent / 100)))}
              </p>
              <span className={styles.discountBadge}>-{catalog.discountPercent}%</span>
            </div>
          ) : (
            <p className={styles.price}>{formatPrice(catalog?.price)}</p>
          )}
          <button className={styles.buyBtn} onClick={handleAddToBasket}>
            {t('home.buyNow')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatalogCard;
