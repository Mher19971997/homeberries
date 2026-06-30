'use client';

import React, { useRef, useState } from 'react';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import styles from './index.module.css';
import { useTranslation } from 'react-i18next';
import { getActiveSeasonalBanners } from '@homeberris/http/seasonalBannerApi';

const getLoc = (val: any, locale: string): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val[locale] || val.ru || '';
};

export default function BigSummerSale() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'ru';
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);
  const programmaticScrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: banners = [] } = useQuery({
    queryKey: ['activeSeasonalBanners'],
    queryFn: getActiveSeasonalBanners,
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
          const fullTitle = getLoc(banner.title, locale);
          const titleWords = fullTitle.split(' ');
          const titleThin = titleWords.slice(0, -1).join(' ');
          const titleBold = titleWords.slice(-1)[0];
          const description = getLoc(banner.subtitle, locale);
          const buttonText = getLoc(banner.buttonText, locale) || t('home.shopNow');
          const buttonLink = banner.buttonLink || '/catalog';

          return (
            <div key={banner.uuid} className={styles.saleBanner}>
              <div className={styles.overlayContent}>
                <h2 className={styles.mainTitle}>
                  {titleThin && <span className={styles.thinText}>{titleThin}&nbsp;</span>}
                  <span className={styles.boldText}>{titleBold}</span>
                </h2>

                {description && (
                  <p className={styles.subtitle}>
                    {description}
                  </p>
                )}

                <button className={styles.shopButton} onClick={() => router.push(buttonLink)}>
                  {buttonText}
                </button>
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
}


// 'use client';

// import { Box, Typography, Button } from '@mui/material';
// import styles from './index.module.css';

// export default function BigSummerSale() {
//   return (
//     <Box className={styles.saleBanner}>
//       <Box className={styles.overlayContent}>
//         <Typography component="h2" className={styles.mainTitle}>
//           <span className={styles.thinText}>Big Summer</span>
//           {' '}
//           <span className={styles.boldText}>Sale</span>
//         </Typography>

//         <Typography className={styles.subtitle}>
//           Commodo fames vitae vitae leo mauris in. Eu consequat.
//         </Typography>

//         <Button variant="outlined" className={styles.shopButton}>
//           Shop Now
//         </Button>
//       </Box>
//     </Box>
//   );
// }