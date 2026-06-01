'use client';

import React from 'react';
import EmtpImg from '@homeberris/assets/cardEmpty.png';
import CardSlider from '@homeberris/components/CardSlider';
import PositionedSnackbar from '@homeberris/components/PositionedSnackbar';
import { CatalogItem } from '@homeberris/types/catalog';
import { insertBasket } from '@homeberris/http/basketApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
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

  const images =
    catalog?.images?.length > 0
      ? catalog.images.map(({ image }: any) => ({
          imgPath: process.env.NEXT_PUBLIC_BASE_URL + image,
        }))
      : [{ imgPath: EmtpImg.src }];

  return (
    <div className={styles.card} onClick={onNavigate}>
      <PositionedSnackbar
        open={openSuccess}
        handleClose={() => setOpenSuccess(false)}
        message="Added to basket"
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
          <CardSlider images={images} imgHeight={160} />
        </div>

        <div className={styles.body}>
          <p className={styles.name}>{catalog?.name}</p>
          <p className={styles.price}>{formatPrice(catalog?.price)}</p>
          <button className={styles.buyBtn} onClick={handleAddToBasket}>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatalogCard;
