'use client'
import React, { useState, useRef } from 'react';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { useQuery } from '@tanstack/react-query';
import styles from './index.module.css';
import { getActiveBanners, BannerItem } from '@homeberris/http/bannerApi';

const BASE_URL = 'http://localhost:6001';

const CarouselCatalog: React.FC = () => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: banners = [] } = useQuery<BannerItem[]>({
    queryKey: ['activeBanners'],
    queryFn: getActiveBanners,
  });

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== activeIndex && idx >= 0 && idx < banners.length) setActiveIndex(idx);
  };

  const scrollTo = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * index, behavior: 'smooth' });
    setActiveIndex(index);
  };

  if (!banners.length) return null;

  return (
    <div className={styles.carouselWrapper}>
      <div ref={scrollRef} onScroll={handleScroll} className={styles.carouselTrack}>
        {banners.map((banner) => {
          const imgSrc = banner.image.startsWith('http')
            ? banner.image
            : `${BASE_URL}/${banner.image}`;

          return (
            <div key={banner.uuid} className={styles.banner}>
              <div className={styles.bannerContainer}>
                <div className={styles.textBlock}>
                  {banner.subtitle && <span className={styles.proText}>{banner.subtitle}</span>}
                  <div className={styles.titleRow}>
                    {banner.title.split(' ').slice(0, -1).join(' ') && (
                      <span className={styles.titleLight}>
                        {banner.title.split(' ').slice(0, -1).join(' ')}&nbsp;
                      </span>
                    )}
                    <span className={styles.titleBold}>
                      {banner.title.split(' ').slice(-1)[0]}
                    </span>
                  </div>
                  {banner.description && (
                    <p className={styles.description}>{banner.description}</p>
                  )}
                  {banner.buttonText && (
                    <button
                      className={styles.shopBtn}
                      onClick={() => router.push(banner.buttonLink || '/catalog')}
                    >
                      {banner.buttonText}
                    </button>
                  )}
                </div>
                <img className={styles.bannerImg} src={imgSrc} alt={banner.title} />
              </div>
            </div>
          );
        })}
      </div>

      {banners.length > 1 && (
        <div className={styles.dots}>
          {banners.map((_, i) => (
            <div
              key={i}
              className={[styles.dot, activeIndex === i ? styles.activeDot : ''].join(' ')}
              onClick={() => scrollTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CarouselCatalog;
