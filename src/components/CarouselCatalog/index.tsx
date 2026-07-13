'use client'
import React from 'react';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import styles from './index.module.css';
import { getActiveBanners, BannerItem, LocalizedString } from '@homeberris/http/bannerApi';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const getLoc = (val: LocalizedString | string | undefined, locale: string): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[locale as keyof LocalizedString] || val.ru || '';
};

const CarouselCatalog: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'ru';

  const { data: banners = [] } = useQuery<BannerItem[]>({
    queryKey: ['activeBanners'],
    queryFn: getActiveBanners,
  });

  if (!banners.length) return null;

  return (
    <div className={styles.carouselWrapper}>
      <Swiper
        modules={[Pagination]}
        pagination={banners.length > 1 ? { clickable: true, bulletActiveClass: styles.activeDot, bulletClass: styles.dot } : false}
        grabCursor
        slidesPerView={1}
        className={styles.carouselTrack}
      >
        {banners.map((banner) => {
          const imgSrc = banner.image.startsWith('http')
            ? banner.image
            : `${BASE_URL}/${banner.image}`;

          return (
            <SwiperSlide key={banner.uuid} className={styles.banner}>
              <div className={styles.bannerContainer}>
                <div className={styles.textBlock}>
                  {getLoc(banner.subtitle, locale) && <span className={styles.proText}>{getLoc(banner.subtitle, locale)}</span>}
                  <div className={styles.titleRow}>
                    {getLoc(banner.title, locale).split(' ').slice(0, -1).join(' ') && (
                      <span className={styles.titleLight}>
                        {getLoc(banner.title, locale).split(' ').slice(0, -1).join(' ')}&nbsp;
                      </span>
                    )}
                    <span className={styles.titleBold}>
                      {getLoc(banner.title, locale).split(' ').slice(-1)[0]}
                    </span>
                  </div>
                  {getLoc(banner.description, locale) && (
                    <p className={styles.description}>{getLoc(banner.description, locale)}</p>
                  )}
                  {getLoc(banner.buttonText, locale) && (
                    <button
                      className={styles.shopBtn}
                      onClick={() => router.push(banner.buttonLink || '/catalog')}
                    >
                      {getLoc(banner.buttonText, locale)}
                    </button>
                  )}
                </div>
                <img className={styles.bannerImg} src={imgSrc} alt={getLoc(banner.title, locale)} draggable={false} />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default CarouselCatalog;
