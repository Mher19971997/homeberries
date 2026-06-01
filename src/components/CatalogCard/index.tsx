import React from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
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
import styles from '@homeberris/components/CatalogCard/index.module.css';

interface CatalogCardProps {
  catalog: CatalogItem;
  sortPanelOne?: boolean;
  onNavigate?: () => void;
}

const CatalogCard: React.FC<CatalogCardProps> = ({
  catalog,
  sortPanelOne,
  onNavigate
}) => {
  const queryClient = useQueryClient();
  const [openSuccess, setOpenSuccess] = React.useState<boolean>(false);
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
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice || 900);
  };

  return (
    <Box
      className={[styles.cardBody, sortPanelOne && styles.sortPanelOne].join(' ')}
      onClick={onNavigate}
    >
      <PositionedSnackbar
        open={openSuccess}
        handleClose={() => setOpenSuccess(false)}
        message="Added to basket"
      />

      {/* Избранное */}
      <IconButton
        className={styles.favoriteButton}
        onClick={handleFavoriteClick}
        size="small"
      >
        {isFavorite(catalog.uuid) ? (
          <FavoriteIcon sx={{ color: '#ff0000', fontSize: 24 }} />
        ) : (
          <FavoriteBorderIcon sx={{ color: '#b5b5b5', fontSize: 24 }} />
        )}
      </IconButton>

      {/* Изображение контейнер */}
      <Box className={styles.imageContainer}>
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

      {/* Текстовый блок */}
      <Box className={styles.contentBlock}>
        <Typography className={styles.catalogName}>
          {catalog?.name || 'Apple iPhone 14 Pro Max 128GB Deep Purple'}
        </Typography>

        <Typography className={styles.price}>
          {formatPrice(catalog?.price)}
        </Typography>
      </Box>

      {/* Кнопка в самом низу */}
      <Button
        variant="contained"
        fullWidth
        className={styles.basketButton}
        onClick={handleAddToBasket}
      >
        Buy Now
      </Button>
    </Box>
  );
};

export default CatalogCard;

