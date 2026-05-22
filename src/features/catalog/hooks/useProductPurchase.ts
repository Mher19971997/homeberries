import { CatalogItem } from '@homeberris/types/catalog';
import { useState } from 'react';

interface UseProductPurchaseProps {
  catalog: CatalogItem;
  onAddToBasket?: (quantity: number) => void;
  onBuyNow?: (quantity: number) => void;
}

export const useProductPurchase = ({
  catalog,
  onAddToBasket,
  onBuyNow
}: UseProductPurchaseProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  const formatPrice = (price: string | number | undefined) => {
    if (!price) return '0 ₽';

    const numPrice =
      typeof price === 'string' ? parseFloat(price) : price;

    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(numPrice);
  };

  const currentPrice =
    typeof catalog.price === 'string'
      ? parseFloat(catalog.price)
      : catalog.price || 0;

  const installmentAmount =
    currentPrice > 0 ? Math.round(currentPrice / 12) : 0;

  const handleAddToCart = () => {
    setIsInCart(true);
    onAddToBasket?.(quantity);
  };

  const handleBuyNow = () => {
    onBuyNow?.(quantity);
  };

  const handleIncrement = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    onAddToBasket?.(newQty);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      const newQty = quantity - 1;
      setQuantity(newQty);
      onAddToBasket?.(newQty);
    } else {
      setIsInCart(false);
      setQuantity(1);
    }
  };

  return {
    quantity,
    setQuantity,
    isFavorite,
    setIsFavorite,
    isInCart,
    setIsInCart,
    formatPrice,
    currentPrice,
    installmentAmount,
    handleAddToCart,
    handleBuyNow,
    handleIncrement,
    handleDecrement,
  };
};
