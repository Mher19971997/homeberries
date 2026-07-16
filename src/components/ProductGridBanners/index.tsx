'use client'
import { useState } from 'react';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getAllCatalogs } from '@homeberris/http/catalogApi';
import qs from 'qs';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y } from 'swiper/modules';
// CSS Swiper подключается глобально в app/[locale]/layout.tsx
import styles from './index.module.css';
import { useTranslation } from 'react-i18next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const getLoc = (val: any, locale: string): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[locale] || val.ru || '';
};

const BG_COLORS = ['#ffffff', '#f9f9f9', '#eaeaea', '#2c2c2c'];

const CARD_CLASSES = [
  styles.popularGridCard,
  styles.ipadGridCard,
  styles.samsungGridCard,
  styles.macbookGridCard,
];

export default function ProductGridBanners() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'ru';
  const { t } = useTranslation('common');
  const [activeIndex, setActiveIndex] = useState(0);

  const query = qs.stringify({
    filterMeta: { isPopular: true, isActive: true },
    queryMeta: { paginate: true, limit: 20, page: 1 },
  });

  const { data } = useQuery({
    queryKey: ['popularCatalogs'],
    queryFn: () => getAllCatalogs(query),
  });

  const banners = data?.data ?? [];

  if (!banners.length) return null;

  return (
    <div className={styles.wrapper}>
      <Swiper
        modules={[A11y]}
        slidesPerView={4}
        slidesPerGroup={1}
        spaceBetween={0}
        grabCursor
        loop={true}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        breakpoints={{
          0: { slidesPerView: 1 },
          600: { slidesPerView: 2 },
          900: { slidesPerView: 3 },
          1200: { slidesPerView: 4 },
        }}
        className={styles.swiper}
      >
        {banners.map((catalog, index) => {
          const imageUrl = catalog.images?.[0]?.image
            ? `${BASE_URL}/${catalog.images[0].image}`
            : null;
          const isDark = BG_COLORS[index % BG_COLORS.length] === '#2c2c2c';

          return (
            <SwiperSlide key={catalog.uuid}>
              <div className={[styles.gridCard, CARD_CLASSES[index % CARD_CLASSES.length]].join(' ')}>
                <div className={styles.imageBox}>
                  {imageUrl && (
                    <img src={imageUrl} alt={getLoc(catalog.name, locale)} className={styles.productImg} draggable={false} />
                  )}
                </div>
                <div className={styles.infoBox}>
                  <p className={[styles.bannerTitle, isDark ? styles.lightText : ''].join(' ')}>
                    {getLoc(catalog.name, locale)}
                  </p>
                  <p className={styles.bannerDescription}>{getLoc(catalog.description, locale)}</p>
                  <button
                    className={[styles.actionButton, isDark ? styles.actionButtonDark : ''].join(' ')}
                    onClick={() => {
                      const cat = getLoc(catalog.category?.name, 'en');
                      const sub = getLoc(catalog.subCategorie?.name, 'en');
                      const uuid = catalog.uuid;
                      if (cat && sub && uuid) {
                        router.push(`/catalog/${encodeURIComponent(cat)}/${encodeURIComponent(sub)}/${uuid}`);
                      } else if (cat && uuid) {
                        router.push(`/catalog/${encodeURIComponent(cat)}/${uuid}`);
                      } else {
                        router.push('/catalog');
                      }
                    }}
                  >
                    {t('home.shopNow')}
                  </button>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Custom dots — только на 320-375px */}
      <div className={styles.dots}>
        {banners.map((_, i) => (
          <span key={i} className={[styles.dot, activeIndex === i ? styles.dotActive : ''].join(' ')} />
        ))}
      </div>
    </div>
  );
}
