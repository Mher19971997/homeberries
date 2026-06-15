import React from 'react';
import {
    Box,
    Button,
    Card,
    Typography,
    IconButton,
    Divider,
    Chip,
    useMediaQuery,
    useTheme
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import styles from '@homeberris/features/catalog/styles/purchase.module.css';
import { CatalogItem } from '@homeberris/types/catalog';
import { useProductPurchase } from '../hooks/useProductPurchase';
import { useTranslation } from 'next-i18next';

interface ProductPurchaseCardProps {
    catalog: CatalogItem;
    onAddToBasket?: (quantity: number) => void;
    onBuyNow?: (quantity: number) => void;
}

const ProductPurchaseCard: React.FC<ProductPurchaseCardProps> = ({
    catalog,
    onAddToBasket,
    onBuyNow
}) => {
    const { t } = useTranslation('common');
    const {
        quantity,
        installmentAmount,
        handleAddToCart,
        handleBuyNow,
        handleIncrement,
        handleDecrement,
        isFavorite,
        setIsFavorite,
        isInCart,
        formatPrice
    } = useProductPurchase({
        catalog,
        onAddToBasket,
        onBuyNow
    });

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const deliveryDate = new Date(
        Date.now() + 7 * 86400000
    ).toLocaleDateString('ru-RU');

    /* ================= DESKTOP CARD ================= */

    const DesktopCard = (
        <Card className={styles.card}>
            {/* PRICE */}
            <Box className={styles.priceSection}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography className={styles.currentPrice}>
                        {formatPrice(catalog.price)}
                    </Typography>

                    <IconButton
                        onClick={() => setIsFavorite(prev => !prev)}
                        sx={{
                            transition: '0.2s',
                            '&:hover': { transform: 'scale(1.1)' }
                        }}
                    >
                        {isFavorite ? (
                            <FavoriteIcon sx={{ color: '#ff4d6d' }} />
                        ) : (
                            <FavoriteBorderIcon />
                        )}
                    </IconButton>
                </Box>

                <Chip
                    icon={<ThumbUpIcon />}
                    label={t('productPurchaseCard.goodPrice')}
                    size="small"
                    sx={{ mt: 1 }}
                />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* DELIVERY */}
            <Box display="flex" alignItems="center" gap={1}>
                <LocalShippingIcon fontSize="small" />
                <Typography variant="body2">
                    {t('productPurchaseCard.delivery')} {deliveryDate}
                </Typography>
            </Box>

            {/* INSTALLMENT */}
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mt={2}
            >
                <Box display="flex" alignItems="center" gap={1}>
                    <AccountBalanceWalletIcon fontSize="small" />
                    <Typography variant="body2">
                        {formatPrice(installmentAmount)} × 12
                    </Typography>
                </Box>

                <ArrowForwardIosIcon fontSize="small" />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* ACTIONS */}
            <Box display="flex" gap={2}>
                <Button
                    variant="contained"
                    fullWidth
                    startIcon={<ShoppingCartIcon />}
                    onClick={handleAddToCart}
                    sx={{ height: 48 }}
                >
                    {t('productPurchaseCard.addToCart')}
                </Button>

                <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleBuyNow}
                    sx={{ height: 48 }}
                >
                    {t('productPurchaseCard.buyNow')}
                </Button>
            </Box>
        </Card>
    );

    /* ================= MOBILE BAR ================= */

    const MobileBar = (
        <Box className={styles.mobileFixedBar}>
            <Button
                variant="outlined"
                className={styles.mobileBuyNow}
                onClick={handleBuyNow}
            >
                Купить сейчас
            </Button>

            {!isInCart ? (
                <Button
                    variant="contained"
                    className={styles.mobileCartButton}
                    onClick={handleAddToCart}
                >
                    {t('productPurchaseCard.addToCart')}
                </Button>
            ) : (
                <Box className={styles.mobileCounter}>
                    <IconButton onClick={handleDecrement}>
                        <RemoveIcon />
                    </IconButton>

                    <Typography fontWeight={600}>{quantity}</Typography>

                    <IconButton onClick={handleIncrement}>
                        <AddIcon />
                    </IconButton>
                </Box>
            )}
        </Box>
    );

    return (
        <React.Fragment>
            {!isMobile && DesktopCard}
            {isMobile && MobileBar}
        </React.Fragment>
    );
};

export default React.memo(ProductPurchaseCard);
