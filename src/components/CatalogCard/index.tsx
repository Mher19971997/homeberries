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
import { useCompare } from '@homeberris/context/compareContext';
import styles from './index.module.css';
import { HeartFilledIcon, HeartIcon } from '@homeberris/assets/icons/catalog';
import { ScaleIcon } from '@homeberris/assets/icons/compare';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';
import { useFormatPrice } from '@homeberris/utils/formatPrice';
import AuthModal from '@homeberris/components/AuthModal';
import { getStockBadge } from '@homeberris/utils/stockStatus';

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
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [cookies] = useCookies(['token']);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInCompare, toggleCompare } = useCompare();
  const isAuth = checkToken();

  const { mutate } = useMutation({
    mutationFn: (catalogUuid: string) => {
      const firstVariant = getFirstVariant();
      return insertBasket(
        { catalogUuid, quantity: 1, ...(firstVariant ? { selectedVariant: firstVariant } : {}) } as any,
        getToken() || cookies.token
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['basketCount'] });
      queryClient.invalidateQueries({ queryKey: ['getAllBaskets'] });
      setOpenSuccess(true);
    },
    onError: (error) => console.error(error),
  });

  // первая комбинация вариантов (для корзины)
  const getFirstVariant = () => {
    const v = (catalog as any).variants;
    if (v && !Array.isArray(v) && Array.isArray(v.combinations) && v.combinations.length > 0) {
      return v.combinations[0];
    }
    return null;
  };

  const handleAddToBasket = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if ((catalog?.stockQuantity ?? 1) <= 0) return;
    if (isAuth && cookies.token) {
      mutate(catalog.uuid);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuth) {
      setShowAuthModal(true);
      return;
    }
    toggleFavorite(catalog);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCompare(catalog);
  };

  const { formatPrice } = useFormatPrice();

  // Если есть варианты — показываем цену первой комбинации, иначе базовую
  const getDisplayPrice = (): number => {
    const v = (catalog as any).variants;
    if (v && !Array.isArray(v) && Array.isArray(v.combinations) && v.combinations.length > 0) {
      return v.combinations[0].price ?? catalog.price;
    }
    return catalog.price;
  };
  const displayPrice = getDisplayPrice();

  const imgSrc =
    catalog?.images?.length > 0
      ? process.env.NEXT_PUBLIC_BASE_URL! + catalog.images[0].image
      : EmtpImg.src;

  const stockBadge = getStockBadge(catalog?.stockQuantity);
  const isOutOfStock = (catalog?.stockQuantity ?? 1) <= 0;

  return (
    <>
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    <div className={styles.card} onClick={onNavigate}>
      <PositionedSnackbar
        open={openSuccess}
        handleClose={() => setOpenSuccess(false)}
        message={t('basket.addedToBasket')}
        productName={getLoc(catalog?.name, locale)}
      />

      <div className={styles.inner}>
        <div className={styles.favoriteRow}>
          <span className={styles.stockBadge} style={{ backgroundColor: stockBadge.color }}>
            {t(stockBadge.labelKey)}
          </span>
          <div className={styles.favoriteIcons}>
            <button
              className={styles.favoriteButton}
              onClick={handleCompareClick}
              aria-label="Compare"
              style={isInCompare(catalog.uuid) ? { color: '#1e88e5' } : undefined}
            >
              <ScaleIcon size={20} />
            </button>
            <button className={styles.favoriteButton} onClick={handleFavoriteClick} aria-label="Favourite">
              {isFavorite(catalog.uuid)
                ? <HeartFilledIcon/>
                : <HeartIcon />
              }
            </button>
          </div>
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
              <p className={styles.priceOld}>{formatPrice(displayPrice)}</p>
              <p className={styles.price}>
                {formatPrice(Math.round(Number(displayPrice) * (1 - catalog.discountPercent / 100)))}
              </p>
              <span className={styles.discountBadge}>-{catalog.discountPercent}%</span>
            </div>
          ) : (
            <p className={styles.price}>{formatPrice(displayPrice)}</p>
          )}
          <button
            className={styles.buyBtn}
            onClick={handleAddToBasket}
            disabled={isOutOfStock}
            style={isOutOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
          >
            {isOutOfStock ? t(stockBadge.labelKey) : t('home.buyNow')}
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default CatalogCard;
