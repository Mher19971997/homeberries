import React from "react";
import ImageGallery, { ReactImageGalleryProps } from "react-image-gallery";
import ReactImageGallery from "react-image-gallery";
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
import ProductColorSelector from "@homeberris/components/ProductColorSelector";
import SimilarProducts from "@homeberris/components/SimilarProducts";
import ShareButton from "@homeberris/components/ShareButton";
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
import { useIsMobile } from "@homeberris/hooks/useIsMobile";
import { useProductPurchase } from "@homeberris/features/catalog/hooks/useProductPurchase";
import ProductSpecsGrid from "@homeberris/components/ProductSpecsGrid";
import { formatPrice } from "@homeberris/features/myorders/delivery";

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
  const playRef = React.useRef<
    ReactImageGallery & Readonly<ReactImageGalleryProps>
  >(null);
  const route = useRouter();
  const routeParams = useParams();
  const routePathname = usePathname();
  const isMobile = useIsMobile();
  const [showFullDesc, setShowFullDesc] = React.useState(false);
  const [selectedStorage, setSelectedStorage] = React.useState<string | null>(
    null,
  );
  const [selectedColor, setSelectedColor] = React.useState<string | null>(null);

  const {
    isFavorite,
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

  // Функция для проверки возможности прокрутки
  const checkScrollButtons = React.useCallback(() => {
    if (commentsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        commentsContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  // Прокрутка влево на один элемент
  const scrollLeft = () => {
    if (commentsContainerRef.current) {
      // Определяем ширину карточки в зависимости от размера экрана
      const isMobile = window.innerWidth <= 600;
      const cardWidth = (isMobile ? 280 : 350) + (isMobile ? 12 : 16); // ширина карточки + gap
      commentsContainerRef.current.scrollBy({
        left: -cardWidth,
        behavior: "smooth",
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  // Прокрутка вправо на один элемент
  const scrollRight = () => {
    if (commentsContainerRef.current) {
      // Определяем ширину карточки в зависимости от размера экрана
      const isMobile = window.innerWidth <= 600;
      const cardWidth = (isMobile ? 280 : 350) + (isMobile ? 12 : 16); // ширина карточки + gap
      commentsContainerRef.current.scrollBy({
        left: cardWidth,
        behavior: "smooth",
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  // Проверяем кнопки при загрузке и изменении размера
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

  const staticColors = [
    "#000000",
    "#781DBC",
    "#E10000",
    "#E1B000",
    "background: #E8E8E8;",
  ];
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

  // Используем данные из catalog если categoryName/subCategoryName не переданы
  const finalCategoryName = categoryName || catalog?.category?.name || "";
  const finalSubCategoryName =
    subCategoryName || catalog?.subCategorie?.name || "";

  // Получаем параметры из роутера для формирования правильных путей
  const decodedCategory =
    typeof routeParams?.category === "string"
      ? decodeURIComponent(routeParams.category)
      : finalCategoryName;
  const decodedSlug =
    typeof routeParams?.slug === "string"
      ? decodeURIComponent(routeParams.slug)
      : finalSubCategoryName;

  // Формируем путь для категории
  const categoryPath = decodedCategory
    ? `/catalog/${encodeURIComponent(decodedCategory)}`
    : "/catalog";

  // Формируем путь для подкатегории
  const subCategoryPath =
    decodedCategory && decodedSlug
      ? `/catalog/${encodeURIComponent(decodedCategory)}/${encodeURIComponent(decodedSlug)}`
      : categoryPath;
  console.log(catalog, 546544, finalCategoryName);

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
        {/* <div className={styles.shareBox}>
          <button
            onClick={() => setOpenModal(true)}
            className={styles.qrcodeBtn}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zm2 2h2v2h-2zm2-2h2v2h-2zm-4 4h2v2h-2zm2 2h2v2h-2zm2-4h2v2h-2zm0 4h2v2h-2z"/>
            </svg>
          </button>
          <ShareButton
            shareUrl={(process.env.NEXT_PUBLIC_BASE_URL_MAIN ?? '') + (routePathname ?? '')}
          />
        </div> */}
      </div>
      {/* Основной контент товара */}
      <div className={styles.gridContainer}>
        {/* Левая часть - галерея */}
        <div className={styles.gridItemImage}>
          <div className={styles.imageSection}>
            {catalog?.images && catalog.images.length > 0 ? (
              <ImageGallery
                thumbnailPosition={"left"}
                items={catalog.images.map(({ image }: any) => {
                  const imagePath = image.startsWith("/") ? image : "/" + image;
                  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
                  return {
                    original: baseUrl + imagePath,
                    thumbnail: baseUrl + imagePath,
                  };
                })}
                ref={playRef}
                showPlayButton={false}
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                <p>Изображения не найдены</p>
              </div>
            )}
          </div>
        </div>

        {/* Правая часть - вся информация */}
        <div className={styles.gridItemInfo}>
          {/* Название */}
          <h1 className={styles.productTitle}>{catalog.name}</h1>

          {/* Цена */}
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

          {/* Выбор цвета */}
          {(() => {
            const colorGroup = catalog.groupOption?.find((g: groupOptionItem) =>
              g.options?.some((o: OptionsItem) =>
                o.name?.toLowerCase().includes("цвет"),
              ),
            );
            const colorOptions = colorGroup?.options?.filter((o: OptionsItem) =>
              o.name?.toLowerCase().includes("цвет"),
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

          {/* Характеристики — сетка карточек */}
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

      {/* Sidebar с характеристиками и комментариями */}
      <ProductCharacteristicsSidebar
        open={openSidebar}
        onClose={() => setOpenSidebar(false)}
        catalog={catalog}
      />

      {/* QR Code Modal */}
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
            width: "100%",
            maxWidth: "100%",
            overflowX: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              position: "relative",
              display: "inline-block",
              padding: "24px",
              backgroundColor: "#fff",
              borderRadius: "20px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
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
            {/* Логотип в центре */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "60px",
                height: "60px",
                backgroundColor: "#fff",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                border: "3px solid #fff",
                zIndex: 1,
              }}
            >
              <p
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontWeight: 900,
                  fontSize: "28px",
                  letterSpacing: "2px",
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                SB
              </p>
            </div>
          </div>
          <p
            style={{
              fontSize: "14px",
              maxWidth: "300px",
              lineHeight: "1.6",
              color: "text.secondary",
              margin: 0,
            }}
          >
            Отсканируйте QR код для быстрого доступа к товару
          </p>
        </div>
      </CustomModal>
    </div>
  );
}
