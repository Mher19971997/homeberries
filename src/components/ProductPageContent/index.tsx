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
import { useProductPurchase } from "@homeberris/features/catalog/hooks/useProductPurchase";
import ProductSpecsGrid from "@homeberris/components/ProductSpecsGrid";
import ProductDetailsSection from "@homeberris/components/ProductDetailsSection";
import ProductReviewsSection from "@homeberris/components/ProductReviewsSection";
import ProductColorSelector from "../ProductColorSelector";
import AuthModal from "@homeberris/components/AuthModal";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkToken } from "@homeberris/utils/auth";
import { useFavorites } from "@homeberris/context/favoritesContext";
import { useCompare } from "@homeberris/context/compareContext";
import { ScaleIcon } from "@homeberris/assets/icons/compare";
import { useCookies } from "react-cookie";
import { insertBasket } from "@homeberris/http/basketApi";
import { useTranslation } from "react-i18next";
import { addRecentlyViewed } from "@homeberris/utils/recentlyViewed";
import { useTrackRecentlyViewed } from "@homeberris/hooks/useTrackRecentlyViewed";

const getLoc = (val: any, locale: string): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[locale] || val.ru || '';
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

  const { t } = useTranslation('common');

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
  const [cookies] = useCookies(['token']);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInCompare, toggleCompare } = useCompare();


  const isAuth = checkToken();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const { mutate } = useMutation({
    mutationFn: (catalogUuid: string) => insertBasket({ catalogUuid, quantity: 1 }, cookies.token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['basketCount'] });
      queryClient.invalidateQueries({ queryKey: ['getAllBaskets'] });
      setOpenSuccess(true);
    },
    onError: (error) => console.error(error),
  });

  const handleAddToBasket = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!isAuth || !cookies.token) {
      setShowAuthModal(true);
      return;
    }
    mutate(catalog!.uuid);
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
    onAddToBasket: () => { },
    onBuyNow: () => { },
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

  const locale = (routeParams?.locale as string) || 'ru';
  const staticColors = ["#000000", "#781DBC", "#E10000", "#E1B000", "#E8E8E8"];
  const staticStorage = ["128GB", "256GB", "512GB", "1TB"];
  const staticSpecs = [
    { name: t('productDetails.specs.labels.screenSize'), value: '6.7"', icon: <ScreenSizeIcon /> },
    { name: "CPU", value: "Apple A16 Bionic", icon: <CpuIcon /> },
    { name: t('productDetails.specs.labels.cores'), value: "6", icon: <CoresIcon /> },
    { name: t('productDetails.specs.labels.mainCamera'), value: "48-12 -12 MP", icon: <CameraIcon /> },
    { name: t('productDetails.specs.labels.frontCamera'), value: "12 MP", icon: <FrontCameraIcon /> },
    { name: t('productDetails.specs.labels.batteryCapacity'), value: "4323 mAh", icon: <BatteryIcon /> },
  ];
  const staticDescription =
    "Enhanced capabilities thanks to an enlarged display of 6.7 inches and work without recharging throughout the day. Incredible photos in weak, yes and in bright light using the new system with two cameras.";

  const finalCategoryName = getLoc(catalog?.category?.name, locale) || categoryName || "";
  const finalSubCategoryName = getLoc(catalog?.subCategorie?.name, locale) || subCategoryName || "";

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
  const dbColors: { uuid: string; color: string; inStock: boolean }[] = (catalog as any)?.colors || [];

  // Фото для текущего выбранного цвета, или общие фото (без colorUuid)
  const filteredImages = React.useMemo(() => {
    if (selectedColor && dbColors.length > 0) {
      const colorObj = dbColors.find(c => c.color === selectedColor);
      if (colorObj) {
        const colorImages = allImages.filter((img: any) => img.colorUuid === colorObj.uuid);
        if (colorImages.length > 0) return colorImages;
      }
    }
    // Показываем общие фото (без colorUuid) или все если нет общих
    const general = allImages.filter((img: any) => !img.colorUuid);
    return general.length > 0 ? general : allImages;
  }, [allImages, selectedColor, dbColors]);

  const images = filteredImages.length > 0
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
    console.log('checkout clicked');
    route.push(`/order`);
  };

  return (
    <div className={styles.body}>
      <div className={styles.contantHeader}>
        <Breadcrumb items={[
          { label: t('productPageContent.breadcrumb.home'), href: '/' },
          { label: t('productPageContent.breadcrumb.catalog'), href: '/catalog' },
          { label: finalCategoryName, href: categoryPath },
          ...(finalSubCategoryName ? [{ label: finalSubCategoryName, href: subCategoryPath }] : []),
          { label: getLoc(catalog?.name, locale) },
        ]} />
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
              <p>{t('productPageContent.gallery.noImages')}</p>
            </div>
          )}
        </div>

        {/* Правая часть - вся информация */}
        <div className={styles.gridItemInfo}>
          {/* Блок 1: Название + Цена */}
          <div className={styles.infoBlock1}>
            <h1 className={styles.productTitle}>{getLoc(catalog.name, locale)}</h1>
            <div className={styles.priceRow}>
              <span className={styles.currentPrice}>
                {formatPriceHook(catalog.price)}
              </span>
              {catalog.oldPrice && (
                <span className={styles.oldPrice}>
                  {formatPriceHook(catalog.oldPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Блок 2: Color + Storage + Specs + Описание */}
          <div className={styles.infoBlock2}>
            {/* Выбор цвета */}
            {(() => {
              if (dbColors.length === 0) return null;
              return (
                <div className={styles.colorSelector}>
                  <span className={styles.colorSelectorLabel}>
                    {t('productPageContent.color')} :
                  </span>
                  {dbColors.map((c) => (
                    <button
                      key={c.uuid}
                      className={`${styles.colorDot} ${selectedColor === c.color ? styles.colorDotActive : ''}`}
                      style={{ backgroundColor: c.color, opacity: c.inStock ? 1 : 0.35 }}
                      onClick={() => { setSelectedColor(prev => prev === c.color ? null : c.color); setActiveIndex(0); }}
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

            {/* Выбор памяти/хранилища */}
            {(() => {
              const storageGroup = catalog.groupOption?.find(
                (g: groupOptionItem) => getLoc(g.name, 'ru') === "Память",
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
                    .sort((a: string, b: string) => parseStorage(a) - parseStorage(b))
                  : [];
              if (storageItems.length === 0) return null;
              return (
                <div className={styles.storageSelector}>
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
              const dynSpecs = (catalog.productSpecs || []).map((s: ProductSpecItem) => {
                const DynIcon = s.icon ? (require('lucide-react') as Record<string, any>)[s.icon] : null;
                return {
                  name: getLoc(s.name, locale),
                  value: getLoc(s.value, locale),
                  icon: DynIcon ? React.createElement(DynIcon, { size: 18 }) : null,
                };
              });
              if (dynSpecs.length === 0) return null;
              return <ProductSpecsGrid specs={dynSpecs} />;
            })()}

            {/* Описание */}
            {(() => {
              const desc = getLoc(catalog.description, locale) || staticDescription;
              const isLong = desc.length > 50;
              const displayedDesc = isLong && !showFullDesc ? desc.slice(0, 50) + "..." : desc;
              return (
                <div className={styles.descriptionSection}>
                  <p className={`${styles.descriptionText} ${styles.descriptionTextFull}`}>
                    {displayedDesc}
                  </p>
                  {isLong && (
                    <button className={styles.moreBtn} onClick={() => setShowFullDesc((p) => !p)}>
                      {showFullDesc ? t('productPageContent.description.less') : t('productPageContent.description.more')}
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
                {t('productPageContent.actions.addToWishlist')}
              </button>
              <button className={styles.btnCart} onClick={handleAddToBasket}>
                {isInCart ? `${t('productPageContent.actions.inCart')}` : `${t('productPageContent.actions.addToCart')}`}
              </button>
              <button
                className={styles.btnWishlist}
                onClick={handleCompareClick}
                style={isInCompare(catalog.uuid) ? { color: '#1e88e5', borderColor: '#1e88e5' } : undefined}
              >
                <ScaleIcon size={18} />
              </button>
            </div>

            {/* Доставка */}
            <div className={styles.deliveryStrip}>
              <div className={styles.deliveryItem}>
                <div className={styles.boxDeliveryIcon}>
                  <div className={styles.deliveryIcon}>
                    <DeliveryIcon />
                  </div>
                </div>
                <div className={styles.deliveryText}>
                  <span className={styles.deliveryTitle}>{t('productPageContent.delivery.free.title')}</span>
                  <span className={styles.deliverySubtitle}>{t('productPageContent.delivery.free.subtitle')}</span>
                </div>
              </div>
              <div className={styles.deliveryItem}>
                <div className={styles.boxDeliveryIcon}>
                  <div className={styles.deliveryIcon}>
                    <InStockIcon />
                  </div>
                </div>
                <div className={styles.deliveryText}>
                  <span className={styles.deliveryTitle}>{t('productPageContent.delivery.stock.title')}</span>
                  <span className={styles.deliverySubtitle}>{t('productPageContent.delivery.stock.subtitle')}</span>
                </div>
              </div>
              <div className={styles.deliveryItem}>
                <div className={styles.boxDeliveryIcon}>
                  <div className={styles.deliveryIcon}>
                    <GuaranteedIcon />
                  </div>
                </div>
                <div className={styles.deliveryText}>
                  <span className={styles.deliveryTitle}>{t('productPageContent.delivery.guarantee.title')}</span>
                  <span className={styles.deliverySubtitle}>{t('productPageContent.delivery.guarantee.subtitle')}</span>
                </div>
              </div>
            </div>
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
