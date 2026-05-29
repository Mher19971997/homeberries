import React from 'react';
import ImageGallery, { ReactImageGalleryProps } from 'react-image-gallery';
import ReactImageGallery from 'react-image-gallery';
import { Box, Breadcrumbs, Button, Grid, Typography, IconButton, Link as MuiLink } from '@mui/material';
import Link from 'next/link';
import CommentCard from '@homeberris/components/CommentCard';
import ProductColorSelector from '@homeberris/components/ProductColorSelector';
import SimilarProducts from '@homeberris/components/SimilarProducts';
import ShareButton from '@homeberris/components/ShareButton';
import CustomModal from '@homeberris/components/CustomModal';
import ProductCharacteristicsSidebar from '@homeberris/components/ProductCharacteristicsSidebar';
import { QRCodeSVG } from 'qrcode.react';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { UUID } from 'crypto';
import {
  CommentItem,
  OptionsItem,
  groupOptionItem,
  CatalogItem
} from '@homeberris/types/catalog';
import styles from '@homeberris/pages/catalog/[category]/[slug]/index.module.css';
import { useIsMobile } from '@homeberris/hooks/useIsMobile';
import ProductPurchaseCard from '@homeberris/features/catalog/components/ProductPurchaseCard';
import { formatPrice } from '@homeberris/features/myorders/delivery';

interface ProductPageContentProps {
  catalog: CatalogItem | undefined;
  categoryName?: string;
  subCategoryName?: string;
}

export default function ProductPageContent({
  catalog,
  categoryName,
  subCategoryName
}: ProductPageContentProps) {
  const playRef = React.useRef<
    ReactImageGallery & Readonly<ReactImageGalleryProps>
  >(null);
  const route = useRouter();
  const routeParams = useParams();
  const routePathname = usePathname();
  const isMobile = useIsMobile()
  const [openModal, setOpenModal] = React.useState(false);
  const [openSidebar, setOpenSidebar] = React.useState(false);
  const commentsContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  // Функция для проверки возможности прокрутки
  const checkScrollButtons = React.useCallback(() => {
    if (commentsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = commentsContainerRef.current;
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
        behavior: 'smooth'
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
        behavior: 'smooth'
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  // Проверяем кнопки при загрузке и изменении размера
  React.useEffect(() => {
    checkScrollButtons();
    const container = commentsContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, [checkScrollButtons]);

  if (!catalog) {
    return null;
  }

  // Используем данные из catalog если categoryName/subCategoryName не переданы
  const finalCategoryName = categoryName || catalog?.category?.name || '';
  const finalSubCategoryName = subCategoryName || catalog?.subCategorie?.name || '';

  // Получаем параметры из роутера для формирования правильных путей
  const decodedCategory = typeof routeParams?.category === 'string' ? decodeURIComponent(routeParams.category) : finalCategoryName;
  const decodedSlug = typeof routeParams?.slug === 'string' ? decodeURIComponent(routeParams.slug) : finalSubCategoryName;

  // Формируем путь для категории
  const categoryPath = decodedCategory ? `/catalog/${encodeURIComponent(decodedCategory)}` : '/catalog';

  // Формируем путь для подкатегории
  const subCategoryPath = decodedCategory && decodedSlug
    ? `/catalog/${encodeURIComponent(decodedCategory)}/${encodeURIComponent(decodedSlug)}`
    : categoryPath;
  console.log(catalog, 546544, finalCategoryName);

  return (
    <Box className={styles.body}>
      <Box className={styles.contantHeader}>
        <Breadcrumbs aria-label='breadcrumb' className={styles.breadcrumb}>
          <MuiLink component={Link} color='inherit' href='/'>
            Главная
          </MuiLink>
          <MuiLink component={Link} color='inherit' href={categoryPath}>
            {finalCategoryName}
          </MuiLink>
          {finalSubCategoryName && (
            <MuiLink
              component={Link}
              color='inherit'
              href={subCategoryPath}
            >
              {finalSubCategoryName}
            </MuiLink>
          )}
          {catalog?.brand?.name ? (
            <Typography color='text.primary'>
              {catalog.brand.name}
            </Typography>
          ) : (
            <Typography color='text.primary'>
              {catalog?.name}
            </Typography>
          )}
        </Breadcrumbs>
        <Box className={styles.shareBox}>
          <Button
            onClick={() => setOpenModal(true)}
            className={styles.qrcodeBtn}
          >
            <QrCode2Icon />
          </Button>
          <ShareButton
            shareUrl={(process.env.NEXT_PUBLIC_BASE_URL_MAIN ?? '') + (routePathname ?? '')}
          />
        </Box>
      </Box>
      {/* Основной контент товара */}
      <Grid container spacing={3}>
        {/* Левая часть - Большое изображение */}
        <Grid item lg={4} md={5} xs={12}>
          <Box className={styles.imageSection}>
            {catalog?.images && catalog.images.length > 0 ? (
              <ImageGallery
                thumbnailPosition={'left'}
                items={catalog.images.map(({ image }: any) => {
                  const imagePath = image.startsWith('/') ? image : '/' + image;
                  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
                  return {
                    original: baseUrl + imagePath,
                    thumbnail: baseUrl + imagePath
                  };
                })}
                ref={playRef}
                showPlayButton={false}
              />
            ) : (
              <Box className={styles.imagePlaceholder}>
                <Typography color="text.secondary">Изображения не найдены</Typography>
              </Box>
            )}
          </Box>
        </Grid>
        {/* Центральная часть - Информация о товаре */}
        <Grid item lg={4} md={4} xs={12}>
        <Typography className={styles.currentPrice}>
          {formatPrice(+catalog.price)}
        </Typography>
          <Box className={styles.productInfoSection}>
            {/* Бренд/Продавец */}
            {catalog?.category?.name && (
              <Typography className={styles.brandName}>{catalog.category.name}</Typography>
            )}

            {/* Название товара */}
            <Typography variant="h4" className={styles.productTitle}>
              {catalog?.name}
            </Typography>

            {/* Выбор цвета - показываем только если есть цвета в опциях */}
            {catalog?.groupOption && catalog.groupOption.some((group: groupOptionItem) =>
              group.options?.some((opt: OptionsItem) => opt.name?.toLowerCase().includes('цвет'))
            ) && (
                <ProductColorSelector />
              )}

            {/* Кнопка для открытия дропдауна с характеристиками и комментариями */}


            {/* Детальные характеристики */}
            {catalog?.groupOption && catalog.groupOption.length > 0 && !isMobile && (
              <Box className={styles.specificationsSection}>
                {catalog.groupOption.map((group: groupOptionItem, groupIndex: number) => (
                  group.options && group.options.length > 0 && (
                    <Box key={groupIndex} className={styles.specGroup}>
                      <Typography className={styles.specGroupTitle}>
                        {group.name || "Характеристики"}
                      </Typography>
                      <Box className={styles.specTable}>
                        {group.options.map((option: OptionsItem, optionIndex: number) => (
                          <Box key={optionIndex} className={styles.specRow}>
                            <Typography className={styles.specLabel}>{option.name}</Typography>
                            <Typography className={styles.specValue}>{option.value}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )
                ))}
              </Box>
            )}
            <Button
              variant="outlined"
              className={styles.characteristicsButton}
              onClick={() => setOpenSidebar(true)}
            >
              Характеристики и отзывы
            </Button>
          </Box>
        </Grid>

        {/* Правая часть - Карточка покупки */}
        <Grid item lg={4} md={3} xs={12}>
          <ProductPurchaseCard
            catalog={catalog}
            onAddToBasket={() => { }}
            onBuyNow={() => { }}
          />
        </Grid>

      </Grid>

      {/* Комментарии */}
      {catalog?.comments && catalog.comments.length > 0 && (
        <Box className={styles.commentsSection}>
          <Typography variant="h5" className={styles.sectionTitle}>
            Отзывы
          </Typography>
          <Box className={styles.commentsWrapper}>
            {canScrollLeft && (
              <IconButton
                className={styles.scrollButton}
                onClick={scrollLeft}
                aria-label="Прокрутить влево"
              >
                <ArrowBackIosIcon />
              </IconButton>
            )}
            <Box
              ref={commentsContainerRef}
              className={styles.commentsContainer}
              onScroll={checkScrollButtons}
            >
              {catalog.comments.map((comment: CommentItem) => (
                <CommentCard key={comment.uuid} comment={comment} />
              ))}
            </Box>
            {canScrollRight && (
              <IconButton
                className={styles.scrollButton}
                onClick={scrollRight}
                aria-label="Прокрутить вправо"
              >
                <ArrowForwardIosIcon />
              </IconButton>
            )}
          </Box>
        </Box>
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
        <Box sx={{
          p: 4,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }}>
          <Box
            sx={{
              position: 'relative',
              display: 'inline-block',
              padding: '24px',
              backgroundColor: '#fff',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
            }}
          >
            <QRCodeSVG
              value={(process.env.NEXT_PUBLIC_BASE_URL_MAIN ?? '') + (routePathname ?? '')}
              size={260}
              level="H"
              includeMargin={true}
              marginSize={2}
            />
            {/* Логотип в центре */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60px',
                height: '60px',
                backgroundColor: '#fff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                border: '3px solid #fff',
                zIndex: 1
              }}
            >
              <Typography
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 900,
                  fontSize: '28px',
                  letterSpacing: '2px',
                  lineHeight: 1
                }}
              >
                SB
              </Typography>
            </Box>
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: '14px',
              maxWidth: '300px',
              lineHeight: '1.6'
            }}
          >
            Отсканируйте QR код для быстрого доступа к товару
          </Typography>
        </Box>
      </CustomModal>
    </Box>
  );
}
