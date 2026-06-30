'use client'
import React, { useState, useRef } from 'react';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import styles from './index.module.css';
import { getActiveBanners, BannerItem, LocalizedString } from '@homeberris/http/bannerApi';

const BASE_URL = 'http://localhost:6001';

const getLoc = (val: LocalizedString | string | undefined, locale: string): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[locale as keyof LocalizedString] || val.ru || '';
};

const CarouselCatalog: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'ru';
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);
  const programmaticScrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: banners = [] } = useQuery<BannerItem[]>({
    queryKey: ['activeBanners'],
    queryFn: getActiveBanners,
  });

  const handleScroll = () => {
    if (isProgrammaticScroll.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== activeIndex && idx >= 0 && idx < banners.length) setActiveIndex(idx);
  };

  const scrollTo = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    if (programmaticScrollTimeout.current) clearTimeout(programmaticScrollTimeout.current);
    isProgrammaticScroll.current = true;
    setActiveIndex(index);
    el.scrollTo({ left: el.clientWidth * index, behavior: 'smooth' });
    programmaticScrollTimeout.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 600);
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
                <img className={styles.bannerImg} src={imgSrc} alt={getLoc(banner.title, locale)} />
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
