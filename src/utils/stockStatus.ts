export type StockStatus = 'inStock' | 'limited' | 'underOrder' | 'outOfStock';

export interface StockBadgeInfo {
  status: StockStatus;
  labelKey: `stock.${StockStatus}`;
  color: string;
  // блокировать ли покупку/добавление в корзину
  isBlocked: boolean;
}

const LIMITED_THRESHOLD = 5;

const COLORS: Record<StockStatus, string> = {
  inStock: '#2e7d32',
  limited: '#e65100',
  underOrder: '#1565c0',
  outOfStock: '#c62828',
};

const build = (status: StockStatus): StockBadgeInfo => ({
  status,
  labelKey: `stock.${status}`,
  color: COLORS[status],
  isBlocked: status === 'outOfStock',
});

// stockStatus — ручной оверрайд из CRM ('inStock' | 'underOrder' | 'outOfStock').
// stockQuantity — реальный остаток на складе (Catalog.stockQuantity на бэкенде).
//
// Приоритет: если админ явно выставил outOfStock/underOrder — это побеждает
// независимо от количества (например, товар сняли с продажи, а остаток в базе
// ещё не обнулили). Если stockStatus не задан или 'inStock' (дефолт) — статус
// считается по количеству: 0 -> outOfStock, 1..LIMITED_THRESHOLD -> limited,
// дальше -> inStock.
export const getStockBadge = (
  stockQuantity: number | undefined,
  stockStatus?: string,
): StockBadgeInfo => {
  if (stockStatus === 'outOfStock') return build('outOfStock');
  if (stockStatus === 'underOrder') return build('underOrder');

  const qty = stockQuantity ?? Infinity;
  if (qty <= 0) return build('outOfStock');
  if (qty <= LIMITED_THRESHOLD) return build('limited');
  return build('inStock');
};
