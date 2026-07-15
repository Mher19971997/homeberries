export type StockStatus = 'inStock' | 'limited' | 'outOfStock';

export interface StockBadgeInfo {
  status: StockStatus;
  labelKey: `stock.${StockStatus}`;
  color: string;
}

const LIMITED_THRESHOLD = 5;

const COLORS: Record<StockStatus, string> = {
  inStock: '#2e7d32',
  limited: '#e65100',
  outOfStock: '#c62828',
};

// stockQuantity — реальный остаток на складе (см. Catalog.stockQuantity на бэкенде).
// 0 -> outOfStock, 1..LIMITED_THRESHOLD -> limited, дальше -> inStock.
export const getStockBadge = (stockQuantity: number | undefined): StockBadgeInfo => {
  const qty = stockQuantity ?? Infinity;
  const status: StockStatus = qty <= 0 ? 'outOfStock' : qty <= LIMITED_THRESHOLD ? 'limited' : 'inStock';

  return {
    status,
    labelKey: `stock.${status}`,
    color: COLORS[status],
  };
};
