import React from "react";
import styles from "./index.module.css";
import { BasketDataItem } from "@homeberris/types/basket";
import { useParams } from "next/navigation";
import { useFormatPrice } from "@homeberris/utils/formatPrice";
import { Copy, Check } from "lucide-react";
import { useToast } from "@homeberris/hooks/useToast";
import { getBasketItemImage } from "@homeberris/utils/getBasketItemImage";

const getLoc = (val: any, locale: string): string => {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[locale] || val.ru || "";
};

interface Props {
  basket: BasketDataItem;
  isLocal?: boolean;
  onRemove?: (uuid: string) => void;
  onUpdateQuantity?: (uuid: string, quantity: number) => void;
  selected?: boolean;
  onSelectChange?: (uuid: string, selected: boolean) => void;
}

export default function BasketItem({
  basket,
  onRemove,
  onUpdateQuantity,
}: Props) {
  const routeParams = useParams();
  const locale = (routeParams?.locale as string) || "ru";
  // Если выбран вариант (память/мощность…), берём его цену вместо базовой.
  const selectedVariant = (basket as any)?.selectedVariant;
  const originalPrice =
    selectedVariant && typeof selectedVariant.price === "number"
      ? selectedVariant.price
      : Number(basket?.catalog?.price) || 0;
  const discount = (basket?.catalog as any)?.discountPercent || 0;
  const isDiscount = (basket?.catalog as any)?.isDiscount && discount > 0;
  const price = isDiscount
    ? Math.round(originalPrice * (1 - discount / 100))
    : originalPrice;
  const quantity = basket.quantity || 1;

  const { formatPrice } = useFormatPrice();
  const { showToast } = useToast();
  const articule = (basket?.catalog as any)?.articule || "";
  const [copied, setCopied] = React.useState(false);

  const handleCopyArticule = async () => {
    if (!articule) return;
    try {
      await navigator.clipboard.writeText(articule);
      setCopied(true);
      showToast("Артикул скопирован", "success");
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const [inputValue, setInputValue] = React.useState(String(quantity));

  React.useEffect(() => {
    setInputValue(String(quantity));
  }, [quantity]);

  const handleDecrease = () => {
    if (quantity > 1) onUpdateQuantity?.(basket.uuid!, quantity - 1);
  };

  const handleIncrease = () => {
    onUpdateQuantity?.(basket.uuid!, quantity + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputCommit = () => {
    const num = parseInt(inputValue);
    if (!isNaN(num) && num > 0) {
      onUpdateQuantity?.(basket.uuid!, num);
    } else {
      setInputValue(String(quantity));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleInputCommit();
  };

  const imgSrc = getBasketItemImage(basket);

  return (
    <div className={styles.item}>
      <img
        className={styles.image}
        src={imgSrc}
        alt={getLoc(basket?.catalog?.name, locale) || "Product"}
      />
      <div className={styles.info}>
        <p className={styles.name}>
          {getLoc(basket?.catalog?.name, locale) || "—"}
        </p>
        {selectedVariant?.values &&
          Object.keys(selectedVariant.values).length > 0 && (
            <p
              style={{
                fontSize: 13,
                color: "#868695",
                margin: "2px 0 0",
                fontWeight: 500,
              }}
            >
              {Object.entries(selectedVariant.values)
                .map(([k, v]) => `${k}: ${v}`)
                .join(" · ")}
            </p>
          )}
        {articule && (
          <p className={styles.sku}>
            #{articule}
            <button
              type="button"
              className={styles.copyBtn}
              onClick={handleCopyArticule}
              aria-label="Copy articule"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
          </p>
        )}
      </div>
      <div className={styles.controlsRight}>
        <div className={styles.qty}>
          <button className={styles.qtyBtn} onClick={handleDecrease}>
            −
          </button>
          <input
            className={styles.qtyValue}
            type="number"
            min={1}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputCommit}
            onKeyDown={handleKeyDown}
          />
          <button className={styles.qtyBtn} onClick={handleIncrease}>
            +
          </button>
        </div>
        <div>
          {isDiscount && (
            <p className={styles.priceOld}>{formatPrice(originalPrice)}</p>
          )}
          <p className={styles.price}>{formatPrice(price)}</p>
        </div>
        <button
          className={styles.removeBtn}
          onClick={() => basket.uuid && onRemove?.(basket.uuid)}
          aria-label="Remove item"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
