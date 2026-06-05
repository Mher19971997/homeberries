'use client';

import React from 'react';
import EmtpImg from '@homeberris/assets/cardEmpty.png';

import PositionedSnackbar from '@homeberris/components/PositionedSnackbar';
import { CatalogItem } from '@homeberris/types/catalog';
import { insertBasket } from '@homeberris/http/basketApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCookies } from 'react-cookie';
import { checkToken } from '@homeberris/utils/auth';
import { addToBasket } from '@homeberris/utils/indexedDB';
import { useFavorites } from '@homeberris/context/favoritesContext';
import styles from './index.module.css';
import { HeartFilledIcon, HeartIcon } from '@homeberris/assets/icons/catalog';

interface CatalogCardProps {
  catalog: CatalogItem;
  sortPanelOne?: boolean;
  onNavigate?: () => void;
}

const CatalogCard: React.FC<CatalogCardProps> = ({ catalog, onNavigate }) => {
  const queryClient = useQueryClient();
  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [cookies] = useCookies(['token']);
  const { isFavorite, toggleFavorite } = useFavorites();
  const isAuth = checkToken();

  const { mutate } = useMutation({
    mutationFn: (catalogUuid: string) => insertBasket({ catalogUuid }, cookies.token),
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

  const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const imgSrc =
    catalog?.images?.length > 0
      ? process.env.NEXT_PUBLIC_BASE_URL! + catalog.images[0].image
      : EmtpImg.src;

  return (
    <div className={styles.card} onClick={onNavigate}>
      <PositionedSnackbar
        open={openSuccess}
        handleClose={() => setOpenSuccess(false)}
        message="Added to basket"
        productName={catalog?.name}
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
            alt={catalog?.name}
            onError={(e) => { (e.target as HTMLImageElement).src = EmtpImg.src; }}
          />
        </div>

        <div className={styles.body}>
          <p className={styles.name}>{catalog?.name}</p>
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
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatalogCard;
