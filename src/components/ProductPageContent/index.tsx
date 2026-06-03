import React from "react";
import Link from "next/link";
import { ChevronSepIcon } from "@homeberris/assets/icons/catalog";
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
} from "@homeberris/types/catalog";
import styles from "./index.module.css";
import { useProductPurchase } from "@homeberris/features/catalog/hooks/useProductPurchase";
import ProductSpecsGrid from "@homeberris/components/ProductSpecsGrid";
import ProductDetailsSection from "@homeberris/components/ProductDetailsSection";

interface ProductPageContentProps {
  catalog: CatalogItem | undefined;
  categoryName?: string;
  subCategoryName?: string;
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

  const changeImage = (nextIndex: number, dir: "left" | "right") => {
    if (nextIndex === activeIndex) return;
    setAnimState(dir === "left" ? "exitLeft" : "exitRight");
    setTimeout(() => {
      setActiveIndex(nextIndex);
      setAnimState(dir === "left" ? "enterRight" : "enterLeft");
      setTimeout(() => setAnimState(null), 350);
    }, 250);
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
    isFavorite,
    setIsFavorite,
    isInCart,
    handleAddToCart,
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

  const staticColors = ["#000000", "#781DBC", "#E10000", "#E1B000", "#E8E8E8"];
  const staticStorage = ["128GB", "256GB", "512GB", "1TB"];
  const staticSpecs = [
    { name: "Screen size", value: '6.7"', icon: <ScreenSizeIcon /> },
    { name: "CPU", value: "Apple A16 Bionic", icon: <CpuIcon /> },
    { name: "Number of Cores", value: "6", icon: <CoresIcon /> },
    { name: "Main camera", value: "48-12 -12 MP", icon: <CameraIcon /> },
    { name: "Front-camera", value: "12 MP", icon: <FrontCameraIcon /> },
    { name: "Battery capacity", value: "4323 mAh", icon: <BatteryIcon /> },
  ];
  const staticDescription =
    "Enhanced capabilities thanks to an enlarged display of 6.7 inches and work without recharging throughout the day. Incredible photos in weak, yes and in bright light using the new system with two cameras.";

  const finalCategoryName = categoryName || catalog?.category?.name || "";
  const finalSubCategoryName =
    subCategoryName || catalog?.subCategorie?.name || "";

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
  const images =
    catalog?.images && catalog.images.length > 0
      ? catalog.images.map(({ image }: any) => {
          const imagePath = image.startsWith("/") ? image : "/" + image;
          return baseUrl + imagePath;
        })
      : [];

  return (
    <div className={styles.body}>
      <div className={styles.contantHeader}>
        <nav aria-label="breadcrumb" className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>
            Главная
          </Link>
          <ChevronSepIcon className={styles.breadcrumbSep} />
          <Link href={categoryPath} className={styles.breadcrumbLink}>
            {finalCategoryName}
          </Link>
          {finalSubCategoryName && (
            <>
              <ChevronSepIcon className={styles.breadcrumbSep} />
              <Link href={subCategoryPath} className={styles.breadcrumbLink}>
                {finalSubCategoryName}
              </Link>
            </>
          )}
          <ChevronSepIcon className={styles.breadcrumbSep} />
          <span
            className={`${styles.breadcrumbLink} ${styles.breadcrumbLinkActive}`}
          >
            {catalog?.brand?.name || catalog?.name}
          </span>
        </nav>
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
                  alt={catalog.name}
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
              <p>Изображения не найдены</p>
            </div>
          )}
        </div>

        {/* Правая часть - вся информация */}
        <div className={styles.gridItemInfo}>
          {/* Блок 1: Название + Цена */}
          <div className={styles.infoBlock1}>
            <h1 className={styles.productTitle}>{catalog.name}</h1>
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
              const colorGroup = catalog.groupOption?.find(
                (g: groupOptionItem) =>
                  g.options?.some((o: OptionsItem) =>
                    o.name?.toLowerCase().includes("цвет"),
                  ),
              );
              const colorOptions = colorGroup?.options?.filter(
                (o: OptionsItem) => o.name?.toLowerCase().includes("цвет"),
              );
              const colors =
                colorOptions && colorOptions.length > 0
                  ? colorOptions.map((o: OptionsItem) => o.value)
                  : staticColors;
              return (
                <div className={styles.colorSelector}>
                  <span className={styles.colorSelectorLabel}>
                    Select color :
                  </span>
                  {colors.map((color: string, i: number) => (
                    <button
                      key={i}
                      className={`${styles.colorDot} ${selectedColor === color ? styles.colorDotActive : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                    />
                  ))}
                </div>
              );
            })()}

            {/* Выбор памяти/хранилища */}
            {(() => {
              const storageGroup = catalog.groupOption?.find(
                (g: groupOptionItem) =>
                  g.name?.toLowerCase().includes("памят") ||
                  g.name?.toLowerCase().includes("хранил") ||
                  g.name?.toLowerCase().includes("storage") ||
                  g.options?.some((o: OptionsItem) => /gb|tb/i.test(o.value)),
              );
              const storageItems =
                storageGroup?.options && storageGroup.options.length > 0
                  ? storageGroup.options.map((o: OptionsItem) => o.value)
                  : staticStorage;
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
              const allOptions: { name: string; value: string }[] = [];
              catalog.groupOption?.forEach((g: groupOptionItem) => {
                g.options?.forEach((o: OptionsItem) => {
                  if (
                    !o.name?.toLowerCase().includes("цвет") &&
                    !/gb|tb/i.test(o.value)
                  ) {
                    allOptions.push({ name: o.name, value: o.value });
                  }
                });
              });
              const specs =
                allOptions.length >= 6 ? allOptions.slice(0, 6) : staticSpecs;
              return <ProductSpecsGrid specs={specs} />;
            })()}

            {/* Описание */}
            <div className={styles.descriptionSection}>
              <p
                className={`${styles.descriptionText} ${showFullDesc ? styles.descriptionTextFull : ""}`}
              >
                {catalog.description || staticDescription}
              </p>
              <button
                className={styles.moreBtn}
                onClick={() => setShowFullDesc((p) => !p)}
              >
                {showFullDesc ? "less..." : "more..."}
              </button>
            </div>
          </div>

          {/* Блок 3: Кнопки + Доставка */}
          <div className={styles.infoBlock3}>
            {/* Кнопки действий */}
            <div className={styles.actionButtons}>
              <button
                className={styles.btnWishlist}
                onClick={() => setIsFavorite((p: boolean) => !p)}
              >
                Add to Wishlist
              </button>
              <button className={styles.btnCart} onClick={handleAddToCart}>
                {isInCart ? "In Cart ✓" : "Add to Card"}
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
                  <span className={styles.deliveryTitle}>Free Delivery</span>
                  <span className={styles.deliverySubtitle}>1-2 day</span>
                </div>
              </div>
              <div className={styles.deliveryItem}>
                <div className={styles.boxDeliveryIcon}>
                  <div className={styles.deliveryIcon}>
                    <InStockIcon />
                  </div>
                </div>
                <div className={styles.deliveryText}>
                  <span className={styles.deliveryTitle}>In Stock</span>
                  <span className={styles.deliverySubtitle}>Today</span>
                </div>
              </div>
              <div className={styles.deliveryItem}>
                <div className={styles.boxDeliveryIcon}>
                  <div className={styles.deliveryIcon}>
                    <GuaranteedIcon />
                  </div>
                </div>
                <div className={styles.deliveryText}>
                  <span className={styles.deliveryTitle}>Guaranteed</span>
                  <span className={styles.deliverySubtitle}>1 year</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details section */}
      <ProductDetailsSection />

      {/* Комментарии */}
      {catalog?.comments && catalog.comments.length > 0 && (
        <div className={styles.commentsSection}>
          <h5 className={styles.sectionTitle}>Отзывы</h5>
          <div className={styles.commentsWrapper}>
            {canScrollLeft && (
              <button
                className={styles.scrollButton}
                onClick={scrollLeft}
                aria-label="Прокрутить влево"
              >
                ‹
              </button>
            )}
            <div
              ref={commentsContainerRef}
              className={styles.commentsContainer}
              onScroll={checkScrollButtons}
            >
              {catalog.comments.map((comment: CommentItem) => (
                <CommentCard key={comment.uuid} comment={comment} />
              ))}
            </div>
            {canScrollRight && (
              <button
                className={styles.scrollButton}
                onClick={scrollRight}
                aria-label="Прокрутить вправо"
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}

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
    </div>
  );
}
