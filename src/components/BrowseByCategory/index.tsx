import React, { useRef } from 'react';
import { Inter } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import styles from './index.module.css';
import { CamerasIcon, ComputersIcon, GamesIcon, HeadPhonesIcon, PhonesIcon, SmartWatchesIcon } from '@homeberris/assets/icons/category';
import { useTranslation } from 'react-i18next';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500'] });

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: React.ReactNode;
}

const BrowseByCategory: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const swiperRef = useRef<SwiperType | null>(null);

  const categories: Category[] = [
    { id: 1, name: t('categories.phones'),      slug: 'Phones',        icon: <PhonesIcon/>       },
    { id: 2, name: t('categories.smartWatches'), slug: 'Smart Watches', icon: <SmartWatchesIcon/> },
    { id: 3, name: t('categories.cameras'),      slug: 'Cameras',       icon: <CamerasIcon/>      },
    { id: 4, name: t('categories.headphones'),   slug: 'Headphones',    icon: <HeadPhonesIcon/>   },
    { id: 5, name: t('categories.computers'),    slug: 'Computers',     icon: <ComputersIcon/>    },
    { id: 6, name: t('categories.gaming'),       slug: 'Gaming',        icon: <GamesIcon/>        },
  ];

  const handleCategoryClick = (slug: string) => {
    router.push(`/catalog/${encodeURIComponent(slug)}`);
  };

  return (
    <section className={`${styles.section} ${inter.className}`}>
      <div className={styles.container}>

        <div className={styles.header}>
          <h2 className={styles.title}>{t('categories.title')}</h2>
          <div className={styles.arrows}>
            <button className={styles.arrowBtn} aria-label="Previous" onClick={() => swiperRef.current?.slidePrev()}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button className={styles.arrowBtn} aria-label="Next" onClick={() => swiperRef.current?.slideNext()}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <Swiper
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          loop={true}
          slidesPerView={6}
          spaceBetween={29}
          breakpoints={{
            0:    { slidesPerView: 2, spaceBetween: 12 },
            480:  { slidesPerView: 3, spaceBetween: 16 },
            768:  { slidesPerView: 4, spaceBetween: 20 },
            1024: { slidesPerView: 5, spaceBetween: 24 },
            1200: { slidesPerView: 6, spaceBetween: 29 },
          }}
        >
          {categories.map((category) => (
            <SwiperSlide key={category.id}>
              <div
                className={styles.card}
                onClick={() => handleCategoryClick(category.slug)}
              >
                <div className={styles.iconWrapper}>{category.icon}</div>
                <span className={styles.cardName}>{category.name}</span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </section>
  );
};

export default BrowseByCategory;
