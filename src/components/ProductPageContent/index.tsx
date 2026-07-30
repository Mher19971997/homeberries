import React from "react";
import Link from "next/link";
import { ChevronSepIcon } from "@homeberris/assets/icons/catalog";
import Breadcrumb from "@homeberris/components/Breadcrumb";
import {
  ScreenSizeIcon,
  CpuIcon,
  CoresIcon,
  CameraIcon,
  FrontCameraIcon,
  BatteryIcon,
  DeliveryIcon,
  InStockIcon,
  GuaranteedIcon,
} from "@homeberris/assets/icons/detailis";
import CommentCard from "@homeberris/components/CommentCard";
import SimilarProducts from "@homeberris/components/SimilarProducts";
import CustomModal from "@homeberris/components/CustomModal";
import ProductCharacteristicsSidebar from "@homeberris/components/ProductCharacteristicsSidebar";
import { QRCodeSVG } from "qrcode.react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { UUID } from "crypto";
import {
  CommentItem,
  OptionsItem,
  groupOptionItem,
  CatalogItem,
  ProductSpecItem,
} from "@homeberris/types/catalog";
import styles from "./index.module.css";
import { getStockBadge } from "@homeberris/utils/stockStatus";
import { useProductPurchase } from "@homeberris/features/catalog/hooks/useProductPurchase";
import ProductSpecsGrid from "@homeberris/components/ProductSpecsGrid";
import ProductDetailsSection from "@homeberris/components/ProductDetailsSection";
import ProductReviewsSection from "@homeberris/components/ProductReviewsSection";
import ProductColorSelector from "../ProductColorSelector";
import AuthModal from "@homeberris/components/AuthModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkToken } from "@homeberris/utils/auth";
import { useFavorites } from "@homeberris/context/favoritesContext";
import { useCompare } from "@homeberris/context/compareContext";
import { ScaleIcon } from "@homeberris/assets/icons/compare";
import { useCookies } from "react-cookie";
import { insertBasket } from "@homeberris/http/basketApi";
import { useTranslation } from "react-i18next";
import { addRecentlyViewed } from "@homeberris/utils/recentlyViewed";
import { useTrackRecentlyViewed } from "@homeberris/hooks/useTrackRecentlyViewed";
import { Copy, Check } from "lucide-react";
import { useToast } from "@homeberris/hooks/useToast";

const getLoc = (val: any, locale: string): string => {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[locale] || val.ru || "";
};

interface ProductPageContentProps {
  catalog: CatalogItem | undefined;
  categoryName?: string;
  subCategoryName?: string;
}

interface CatalogCardProps {
  catalog: CatalogItem;
  sortPanelOne?: boolean;
  onNavigate?: () => void;
}

export default function ProductPageContent({
  catalog,
  categoryName,
  subCategoryName,
}: ProductPageContentProps) {
  const route = useRouter();
  const routeParams = useParams();
  const routePathname = usePathname();
  const [showFullDesc, setShowFullDesc] = React.useState(false);
  const [selectedStorage, setSelectedStorage] = React.useState<string | null>(
    null,
  );
  const [selectedColor, setSelectedColor] = React.useState<string | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [animState, setAnimState] = React.useState<
    "exitLeft" | "exitRight" | "enterRight" | "enterLeft" | null
  >(null);
  const dragStartX = React.useRef<number | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const { t } = useTranslation("common");
  const { showToast } = useToast();
  const [articuleCopied, setArticuleCopied] = React.useState(false);
  // Выбранные значения вариантов (память/мощность/...) для пересчёта цены.
  const [selectedVariantValues, setSelectedVariantValues] = React.useState<
    Record<string, string>
  >({});

  const articule = (catalog as any)?.articule || "";
  const handleCopyArticule = async () => {
    if (!articule) return;
    try {
      await navigator.clipboard.writeText(articule);
      setArticuleCopied(true);
      showToast(t("productPageContent.articuleCopied"), "success");
      setTimeout(() => setArticuleCopied(false), 1500);
    } catch {}
  };

  const trackRecentlyViewed = useTrackRecentlyViewed();

  // React.useEffect(() => {
  //   if (catalog?.uuid) addRecentlyViewed(catalog.uuid);
  // }, [catalog?.uuid]);

  React.useEffect(() => {
    if (catalog?.uuid) trackRecentlyViewed(catalog.uuid);
  }, [catalog?.uuid, trackRecentlyViewed]);

  const changeImage = (nextIndex: number, dir: "left" | "right") => {
    if (nextIndex === activeIndex) return;
    setAnimState(dir === "left" ? "exitLeft" : "exitRight");
    setTimeout(() => {
      setActiveIndex(nextIndex);
      setAnimState(dir === "left" ? "enterRight" : "enterLeft");
      setTimeout(() => setAnimState(null), 350);
    }, 250);
  };

  const queryClient = useQueryClient();
  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [cookies] = useCookies(["token"]);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInCompare, toggleCompare } = useCompare();

  const isAuth = checkToken();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const { mutate } = useMutation({
    mutationFn: (payload: {
      catalogUuid: string;
      selectedVariant?: any;
      colorUuid?: string;
    }) =>
      insertBasket(
        {
          catalogUuid: payload.catalogUuid,
          quantity: 1,
          selectedVariant: payload.selectedVariant,
          colorUuid: payload.colorUuid,
        },
        cookies.token,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["basketCount"] });
      queryClient.invalidateQueries({ queryKey: ["getAllBaskets"] });
      setOpenSuccess(true);
    },
    onError: (error) => console.error(error),
  });

  // Считает выбранный вариант (значения + цена) для отправки в корзину.
  const computeSelectedVariant = (): any => {
    const vd: any = (catalog as any)?.variants;
    if (
      !vd ||
      Array.isArray(vd) ||
      !Array.isArray(vd.params) ||
      !vd.params.length
    )
      return undefined;
    const eff: Record<string, string> = {};
    vd.params.forEach((p: any) => {
      const key = typeof p.name === "string" ? p.name : p.name?.ru || "";
      eff[key] = selectedVariantValues[key] || p.options?.[0] || "";
    });
    const combos = Array.isArray(vd.combinations) ? vd.combinations : [];
    const m = combos.find((c: any) => {
      const keys = Object.keys(c.values || {});
      return keys.length > 0 && keys.every((k) => eff[k] === c.values[k]);
    });
    return { values: eff, price: m ? m.price : (catalog as any).price };
  };

  // --- Универсальные варианты с ценой: { params:[{name,options}], combinations:[{values,price,stockQuantity}] } ---
  const variantsData: any = (catalog as any).variants;
  const vParams: Array<{ name: any; options: string[] }> =
    variantsData &&
    !Array.isArray(variantsData) &&
    Array.isArray(variantsData.params)
      ? variantsData.params
      : [];
  const vCombos: Array<{
    values: Record<string, string>;
    price: number;
    stockQuantity?: number;
  }> =
    variantsData &&
    !Array.isArray(variantsData) &&
    Array.isArray(variantsData.combinations)
      ? variantsData.combinations
      : [];

  const variantLocName = (n: any): string =>
    typeof n === "string" ? n : n?.[locale] || n?.ru || n?.en || n?.hy || "";
  // Стабильный ключ параметра — по ru (комбинации хранятся по нему).
  const variantKeyName = (n: any): string =>
    typeof n === "string" ? n : n?.ru || n?.en || n?.hy || "";
  // Эффективный выбор: что выбрал пользователь, иначе первое значение параметра.
  const effectiveVariantValues: Record<string, string> = {};
  vParams.forEach((p) => {
    const key = variantKeyName(p.name);
    effectiveVariantValues[key] =
      selectedVariantValues[key] || (p.options?.[0] ?? "");
  });
  const findCombo = (values: Record<string, string>) =>
    vCombos.find((c) => {
      const keys = Object.keys(c.values || {});
      return keys.length > 0 && keys.every((k) => values[k] === c.values[k]);
    });
  const matchedCombo = findCombo(effectiveVariantValues);
  const displayPrice = matchedCombo ? matchedCombo.price : catalog?.price;

  // Остаток выбранной комбинации, если она есть — иначе общий остаток товара.
  // stockQuantity не задан у комбинации (старые товары) -> считаем "неограничено".
  // Ручной stockStatus на самом товаре (outOfStock/underOrder) всегда в приоритете,
  // независимо от вариантов — так же, как было для товара без вариантов.
  const stockBadge = getStockBadge(
    vCombos.length > 0 && matchedCombo
      ? matchedCombo.stockQuantity
      : (catalog as any)?.stockQuantity,
    (catalog as any)?.stockStatus,
  );

  const handleAddToBasket = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (stockBadge.isBlocked) return;
    if (!isAuth || !cookies.token) {
      setShowAuthModal(true);
      return;
    }
    const selectedColorUuid = dbColors.find(
      (c) => c.color === selectedColor,
    )?.uuid;
    mutate({
      catalogUuid: catalog!.uuid,
      selectedVariant: {...computeSelectedVariant(), colorUuid: selectedColorUuid},
    });
  };

  const handleWishlistClick = () => {
    if (!isAuth) {
      setShowAuthModal(true);
      return;
    }
    catalog && toggleFavorite(catalog);
  };

  const handleCompareClick = () => {
    catalog && toggleCompare(catalog);
  };

  const handleDragStart = (x: number) => {
    dragStartX.current = x;
    setIsDragging(true);
  };

  const handleDragEnd = (x: number, total: number) => {
    if (dragStartX.current === null) return;
    const diff = dragStartX.current - x;
    if (diff > 50) changeImage(Math.min(activeIndex + 1, total - 1), "left");
    else if (diff < -50) changeImage(Math.max(activeIndex - 1, 0), "right");
    dragStartX.current = null;
    setIsDragging(false);
  };

  const {
    setIsFavorite,
    isInCart,
    handleAddToCart,
    handleBuyNow,
    formatPrice: formatPriceHook,
  } = useProductPurchase({
    catalog: catalog!,
    onAddToBasket: () => {},
    onBuyNow: () => {},
  });

  const [openModal, setOpenModal] = React.useState(false);
  const [openSidebar, setOpenSidebar] = React.useState(false);
  const commentsContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const checkScrollButtons = React.useCallback(() => {
    if (commentsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        commentsContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  const scrollLeft = () => {
    if (commentsContainerRef.current) {
      const isMobile = window.innerWidth <= 600;
      const cardWidth = (isMobile ? 280 : 350) + (isMobile ? 12 : 16);
      commentsContainerRef.current.scrollBy({
        left: -cardWidth,
        behavior: "smooth",
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  const scrollRight = () => {
    if (commentsContainerRef.current) {
      const isMobile = window.innerWidth <= 600;
      const cardWidth = (isMobile ? 280 : 350) + (isMobile ? 12 : 16);
      commentsContainerRef.current.scrollBy({
        left: cardWidth,
        behavior: "smooth",
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  React.useEffect(() => {
    checkScrollButtons();
    const container = commentsContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);
      return () => {
        container.removeEventListener("scroll", checkScrollButtons);
        window.removeEventListener("resize", checkScrollButtons);
      };
    }
  }, [checkScrollButtons]);

  if (!catalog) {
    return null;
  }

  const locale = (routeParams?.locale as string) || "ru";
  const staticColors = ["#000000", "#781DBC", "#E10000", "#E1B000", "#E8E8E8"];
  const staticStorage = ["128GB", "256GB", "512GB", "1TB"];
  const staticSpecs = [
    {
      name: t("productDetails.specs.labels.screenSize"),
      value: '6.7"',
      icon: <ScreenSizeIcon />,
    },
    { name: "CPU", value: "Apple A16 Bionic", icon: <CpuIcon /> },
    {
      name: t("productDetails.specs.labels.cores"),
      value: "6",
      icon: <CoresIcon />,
    },
    {
      name: t("productDetails.specs.labels.mainCamera"),
      value: "48-12 -12 MP",
      icon: <CameraIcon />,
    },
    {
      name: t("productDetails.specs.labels.frontCamera"),
      value: "12 MP",
      icon: <FrontCameraIcon />,
    },
    {
      name: t("productDetails.specs.labels.batteryCapacity"),
      value: "4323 mAh",
      icon: <BatteryIcon />,
    },
  ];
  const staticDescription =
    "Enhanced capabilities thanks to an enlarged display of 6.7 inches and work without recharging throughout the day. Incredible photos in weak, yes and in bright light using the new system with two cameras.";

  const finalCategoryName =
    getLoc(catalog?.category?.name, locale) || categoryName || "";
  const finalSubCategoryName =
    getLoc(catalog?.subCategorie?.name, locale) || subCategoryName || "";

  const decodedCategory =
    typeof routeParams?.category === "string"
      ? decodeURIComponent(routeParams.category)
      : finalCategoryName;
  const decodedSlug =
    typeof routeParams?.slug === "string"
      ? decodeURIComponent(routeParams.slug)
      : finalSubCategoryName;

  const categoryPath = decodedCategory
    ? `/catalog/${encodeURIComponent(decodedCategory)}`
    : "/catalog";

  const subCategoryPath =
    decodedCategory && decodedSlug
      ? `/catalog/${encodeURIComponent(decodedCategory)}/${encodeURIComponent(decodedSlug)}`
      : categoryPath;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  const allImages: any[] = catalog?.images || [];
  const dbColors: { uuid: string; color: string; inStock: boolean }[] =
    (catalog as any)?.colors || [];

  // Фото для текущего выбранного цвета, или общие фото (без colorUuid)
  const filteredImages = React.useMemo(() => {
    if (selectedColor && dbColors.length > 0) {
      const colorObj = dbColors.find((c) => c.color === selectedColor);
      if (colorObj) {
        const colorImages = allImages.filter(
          (img: any) => img.colorUuid === colorObj.uuid,
        );
        if (colorImages.length > 0) return colorImages;
      }
    }
    // Показываем общие фото (без colorUuid) или все если нет общих
    const general = allImages.filter((img: any) => !img.colorUuid);
    return general.length > 0 ? general : allImages;
  }, [allImages, selectedColor, dbColors]);

  const images =
    filteredImages.length > 0
      ? filteredImages
          .filter(({ image }: any) => !!image)
          .map(({ image }: any) => {
            const imagePath = image.startsWith("/") ? image : "/" + image;
            return baseUrl + imagePath;
          })
      : [];

  const handleCheckout = () => {
    // if (!isAuth) { router.push('/security/login'); return; }
    // if (!currentBaskets?.data?.length) { showToast('Basket is empty', 'warning'); return; }
    // setShowPaymentModal(true);
    console.log("checkout clicked");
    route.push(`/order`);
  };

  return (
    <div className={styles.body}>
      <div className={styles.contantHeader}>
        <Breadcrumb
          items={[
            { label: t("productPageContent.breadcrumb.home"), href: "/" },
            {
              label: t("productPageContent.breadcrumb.catalog"),
              href: "/catalog",
            },
            { label: finalCategoryName, href: categoryPath },
            ...(finalSubCategoryName
              ? [{ label: finalSubCategoryName, href: subCategoryPath }]
              : []),
            { label: getLoc(catalog?.name, locale) },
          ]}
        />
      </div>

      {/* Основной контент товара */}
      <div className={styles.gridContainer}>
        {/* Левая часть - галерея */}
        <div className={styles.gridItemImage}>
          {images.length > 0 ? (
            <div className={styles.gallery}>
              {/* Thumbnails */}
              <div className={styles.thumbnails}>
                {images.map((src: string, i: number) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${activeIndex === i ? styles.thumbActive : ""}`}
                    onClick={() => {
                      setAnimState(null);
                      setActiveIndex(i);
                    }}
                  >
                    <img src={src} alt={`thumb-${i}`} />
                  </button>
                ))}
              </div>
              {/* Main image */}
              <div
                className={styles.mainImage}
                onMouseDown={(e) => handleDragStart(e.clientX)}
                onMouseUp={(e) => handleDragEnd(e.clientX, images.length)}
                onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                onTouchEnd={(e) =>
                  handleDragEnd(e.changedTouches[0].clientX, images.length)
                }
                style={{
                  cursor: isDragging ? "grabbing" : "grab",
                  userSelect: "none",
                }}
              >
                <img
                  src={images[activeIndex]}
                  alt={getLoc(catalog.name, locale)}
                  draggable={false}
                  className={
                    animState === "exitLeft"
                      ? styles.slideOutLeft
                      : animState === "exitRight"
                        ? styles.slideOutRight
                        : animState === "enterRight"
                          ? styles.slideInFromRight
                          : animState === "enterLeft"
                            ? styles.slideInFromLeft
                            : ""
                  }
                />
              </div>
            </div>
          ) : (
            <div className={styles.imagePlaceholder}>
              <p>{t("productPageContent.gallery.noImages")}</p>
            </div>
          )}
        </div>

        {/* Правая часть - вся информация */}
        <div className={styles.gridItemInfo}>
          {/* Блок 1: Название + Цена */}
          <div className={styles.infoBlock1}>
            <h1 className={styles.productTitle}>
              {getLoc(catalog.name, locale)}
            </h1>
            <div className={styles.priceRow}>
              {(catalog as any).isDiscount &&
              (catalog as any).discountPercent > 0 ? (
                <>
                  <span className={styles.currentPrice}>
                    {formatPriceHook(
                      Math.round(
                        Number(displayPrice) *
                          (1 - (catalog as any).discountPercent / 100),
                      ),
                    )}
                  </span>
                  <span className={styles.oldPrice}>
                    {formatPriceHook(displayPrice)}
                  </span>
                </>
              ) : (
                <span className={styles.currentPrice}>
                  {formatPriceHook(displayPrice)}
                </span>
              )}
            </div>
            {articule && (
              <div className={styles.articuleRow}>
                <span className={styles.articuleText}>#{articule}</span>
                <button
                  type="button"
                  className={styles.articuleCopyBtn}
                  onClick={handleCopyArticule}
                  aria-label="Copy articule"
                >
                  {articuleCopied ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>
            )}
          </div>

          {/* Блок 2: Color + Storage + Specs + Описание */}
          <div className={styles.infoBlock2}>
            {/* Выбор цвета */}
            {(() => {
              if (dbColors.length === 0) return null;
              return (
                <div className={styles.colorSelector}>
                  <span className={styles.colorSelectorLabel}>
                    {t("productPageContent.color")} :
                  </span>
                  {dbColors.map((c) => (
                    <button
                      key={c.uuid}
                      className={`${styles.colorDot} ${selectedColor === c.color ? styles.colorDotActive : ""}`}
                      style={{
                        backgroundColor: c.color,
                        opacity: c.inStock ? 1 : 0.35,
                      }}
                      onClick={() => {
                        setSelectedColor((prev) =>
                          prev === c.color ? null : c.color,
                        );
                        setActiveIndex(0);
                      }}
                      title={c.color}
                    />
                  ))}

                  {/* {colors.map((color: string, i: number) => (
                    <button
                      key={i}
                      className={`${styles.colorDot} ${selectedColor === color ? styles.colorDotActive : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => { setSelectedColor(color); setActiveIndex(0); }}
                      title={color}
                    />
                  ))} */}
                </div>
              );
            })()}

            {/* Универсальные варианты с ценой (память/мощность/обороты…) */}
            {vParams.length > 0 && (
              <div className={styles.variantParams}>
                {vParams.map((p, pi) => {
                  const keyName = variantKeyName(p.name);
                  const label = variantLocName(p.name);
                  return (
                    <div key={pi} className={styles.variantParamRow}>
                      <span className={styles.variantParamLabel}>{label}:</span>
                      <div
                        className={styles.variantOptions}
                        style={{
                          justifyContent:
                            (p.options || []).length >= 4
                              ? "space-between"
                              : "flex-start",
                        }}
                      >
                        {(p.options || []).map((opt, oi) => {
                          const active =
                            effectiveVariantValues[keyName] === opt;
                          // Есть ли остаток у комбинации, которая получится,
                          // если выбрать этот вариант (при текущих остальных
                          // выборах)? stockQuantity не задан -> неограничено.
                          const hypCombo = findCombo({
                            ...effectiveVariantValues,
                            [keyName]: opt,
                          });
                          const isOutOfStock = hypCombo?.stockQuantity === 0;
                          return (
                            <button
                              key={oi}
                              type="button"
                              disabled={isOutOfStock}
                              className={`${styles.storageBtn} ${active ? styles.storageBtnActive : ""}`}
                              style={
                                isOutOfStock
                                  ? { opacity: 0.35, cursor: "not-allowed" }
                                  : undefined
                              }
                              onClick={() => {
                                if (isOutOfStock) return;
                                setSelectedVariantValues((prev) => ({
                                  ...prev,
                                  [keyName]: opt,
                                }));
                              }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Выбор памяти/хранилища */}
            {(() => {
              const storageGroup = catalog.groupOption?.find(
                (g: groupOptionItem) => getLoc(g.name, "ru") === "Память",
              );
              const parseStorage = (s: string) => {
                const n = parseFloat(s);
                if (/tb/i.test(s)) return n * 1024;
                if (/gb/i.test(s)) return n;
                if (/mb/i.test(s)) return n / 1024;
                return n;
              };
              const storageItems =
                storageGroup?.options && storageGroup.options.length > 0
                  ? storageGroup.options
                      .map((o: OptionsItem) => getLoc(o.value, locale))
                      .sort(
                        (a: string, b: string) =>
                          parseStorage(a) - parseStorage(b),
                      )
                  : [];
              if (storageItems.length === 0) return null;
              return (
                <div
                  className={styles.storageSelector}
                  style={{
                    justifyContent:
                      storageItems.length >= 4 ? "space-between" : "flex-start",
                  }}
                >
                  {storageItems.map((val: string, i: number) => (
                    <button
                      key={i}
                      className={`${styles.storageBtn} ${selectedStorage === val ? styles.storageBtnActive : ""}`}
                      onClick={() => setSelectedStorage(val)}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              );
            })()}

            {/* Характеристики */}
            {(() => {
              const dynSpecs = (catalog.productSpecs || []).map(
                (s: ProductSpecItem) => {
                  const DynIcon = s.icon
                    ? (require("lucide-react") as Record<string, any>)[s.icon]
                    : null;
                  return {
                    name: getLoc(s.name, locale),
                    value: getLoc(s.value, locale),
                    icon: DynIcon
                      ? React.createElement(DynIcon, { size: 18 })
                      : null,
                  };
                },
              );
              if (dynSpecs.length === 0) return null;
              return <ProductSpecsGrid specs={dynSpecs} />;
            })()}

            {/* Описание */}
            {(() => {
              const desc =
                getLoc(catalog.description, locale) || staticDescription;
              const isLong = desc.length > 50;
              const displayedDesc =
                isLong && !showFullDesc ? desc.slice(0, 50) + "..." : desc;
              return (
                <div className={styles.descriptionSection}>
                  <p
                    className={`${styles.descriptionText} ${styles.descriptionTextFull}`}
                  >
                    {displayedDesc}
                  </p>
                  {isLong && (
                    <button
                      className={styles.moreBtn}
                      onClick={() => setShowFullDesc((p) => !p)}
                    >
                      {showFullDesc
                        ? t("productPageContent.description.less")
                        : t("productPageContent.description.more")}
                    </button>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Блок 3: Кнопки + Доставка */}
          <div className={styles.infoBlock3}>
            {/* Кнопки действий */}
            <div className={styles.actionButtons}>
              <button
                className={styles.btnWishlist}
                onClick={handleWishlistClick}
              >
                {t("productPageContent.actions.addToWishlist")}
              </button>
              <button
                className={styles.btnCart}
                onClick={handleAddToBasket}
                disabled={stockBadge.isBlocked}
                style={
                  stockBadge.isBlocked
                    ? { opacity: 0.5, cursor: "not-allowed" }
                    : undefined
                }
              >
                {stockBadge.isBlocked
                  ? t("productPageContent.delivery.stock.outOfStock")
                  : isInCart
                    ? `${t("productPageContent.actions.inCart")}`
                    : `${t("productPageContent.actions.addToCart")}`}
              </button>
              {/* <button
                className={styles.btnWishlist}
                onClick={handleCompareClick}
                style={isInCompare(catalog.uuid) ? { color: '#1e88e5', borderColor: '#1e88e5' } : undefined}
              >
                <ScaleIcon size={18} />
              </button> */}
            </div>

            {/* Доставка */}
            {(() => {
              const cat = catalog as any;
              const hasFreeDelivery = cat?.hasFreeDelivery !== false;
              const deliveryDays = cat?.deliveryDays ?? 2;
              const warrantyMonths = Number(cat?.warrantyMonths ?? 12);

              // тот же stockBadge, что и у кнопки "В корзину" — раньше тут был
              // отдельный расчёт только по stockStatus, без учёта stockQuantity,
              // из-за чего плашка могла говорить "в наличии" при остатке 0.
              const stockLabel =
                stockBadge.status === "inStock"
                  ? t("productPageContent.delivery.stock.subtitle")
                  : t(stockBadge.labelKey);

              const warrantyLabel =
                warrantyMonths === 0
                  ? t("productPageContent.delivery.guarantee.noWarranty")
                  : warrantyMonths >= 12
                    ? `${Math.floor(warrantyMonths / 12)} ${t("productPageContent.delivery.guarantee.year")}`
                    : `${warrantyMonths} ${t("productPageContent.delivery.guarantee.month")}`;

              return (
                <div className={styles.deliveryStrip}>
                  <div className={styles.deliveryItem}>
                    <div className={styles.boxDeliveryIcon}>
                      <div className={styles.deliveryIcon}>
                        <DeliveryIcon />
                      </div>
                    </div>
                    <div className={styles.deliveryText}>
                      <span className={styles.deliveryTitle}>
                        {hasFreeDelivery
                          ? t("productPageContent.delivery.free.title")
                          : t("productPageContent.delivery.paid.title")}
                      </span>
                      <span className={styles.deliverySubtitle}>
                        {deliveryDays}-{deliveryDays + 1}{" "}
                        {t("productPageContent.delivery.free.days")}
                      </span>
                    </div>
                  </div>
                  <div className={styles.deliveryItem}>
                    <div className={styles.boxDeliveryIcon}>
                      <div className={styles.deliveryIcon}>
                        <InStockIcon />
                      </div>
                    </div>
                    <div className={styles.deliveryText}>
                      <span className={styles.deliveryTitle}>
                        {t("productPageContent.delivery.stock.title")}
                      </span>
                      <span className={styles.deliverySubtitle}>
                        {stockLabel}
                      </span>
                    </div>
                  </div>
                  <div className={styles.deliveryItem}>
                    <div className={styles.boxDeliveryIcon}>
                      <div className={styles.deliveryIcon}>
                        <GuaranteedIcon />
                      </div>
                    </div>
                    <div className={styles.deliveryText}>
                      <span className={styles.deliveryTitle}>
                        {t("productPageContent.delivery.guarantee.title")}
                      </span>
                      <span className={styles.deliverySubtitle}>
                        {warrantyLabel}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Details section */}
      <ProductDetailsSection catalog={catalog} />

      {/* Reviews section */}
      <ProductReviewsSection catalog={catalog} />

      {/* Похожие товары */}
      <SimilarProducts
        currentCatalogUuid={catalog.uuid as UUID}
        categoryUuid={catalog.categoryUuid as UUID}
      />

      <ProductCharacteristicsSidebar
        open={openSidebar}
        onClose={() => setOpenSidebar(false)}
        catalog={catalog}
      />

      <CustomModal
        open={openModal}
        handleClose={() => setOpenModal(false)}
        title="QR код товара"
        width={400}
      >
        <div
          style={{
            padding: "32px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <QRCodeSVG
            value={
              (process.env.NEXT_PUBLIC_BASE_URL_MAIN ?? "") +
              (routePathname ?? "")
            }
            size={260}
            level="H"
            includeMargin={true}
            marginSize={2}
          />
        </div>
      </CustomModal>

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
