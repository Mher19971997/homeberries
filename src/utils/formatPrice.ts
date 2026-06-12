import { useTranslation } from 'react-i18next';

export const useFormatPrice = () => {
  const { t } = useTranslation('common');
  const currency = t('currency');

  const formatPrice = (price: string | number | undefined | null): string => {
    if (price === undefined || price === null) return `0 ${currency}`;
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return `0 ${currency}`;
    const formatted = new Intl.NumberFormat('hy-AM', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
    return `${formatted} ${currency}`;
  };

  return { formatPrice, currency };
};
