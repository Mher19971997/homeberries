import { BasketDataItem } from "@homeberris/types/basket";

export const getBasketItemImage = (basket: BasketDataItem): string => {
  const allImages: any[] = basket?.catalog?.images || [];
  const colorUuid = (basket)?.selectedVariant?.colorUuid;

  if (colorUuid) {
    const colorImage = allImages.find(
      img => img.colorUuid === colorUuid,
    );

    if (colorImage?.image) {
      return `${process.env.NEXT_PUBLIC_BASE_URL}${colorImage.image}`;
    }
  }

  const generalImage = allImages.find(img => !img.colorUuid);

  if (generalImage?.image) {
    return `${process.env.NEXT_PUBLIC_BASE_URL}${generalImage.image}`;
  }

  const firstImage = allImages[0];

  if (firstImage?.image) {
    return `${process.env.NEXT_PUBLIC_BASE_URL}${firstImage.image}`;
  }

  return "/images/cardEmpty.png";
};
