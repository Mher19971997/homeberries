'use client'
import React, { useState, useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';
import styles from './index.module.css';
import { useRouter } from 'next/navigation';

interface GridBannerItem {
  id: number;
  title: string;
  description: string;
  image: string;
  className: string;
}

const GRID_BANNERS_DATA: GridBannerItem[] = [
  {
    id: 1,
    title: 'Popular Products',
    description: 'iPad combines a magnificent 10.2-inch Retina display, incredible performance, multitasking and ease of use.',
    image: '/images/PopularProducts.png',
    className: styles.popularGridCard,
  },
  {
    id: 2,
    title: 'Ipad Pro',
    description: 'iPad combines a magnificent 10.2-inch Retina display, incredible performance, multitasking and ease of use.',
    image: '/images/IpadPro.png',
    className: styles.ipadGridCard,
  },
  {
    id: 3,
    title: 'Samsung Galaxy',
    description: 'iPad combines a magnificent 10.2-inch Retina display, incredible performance, multitasking and ease of use.',
    image: '/images/SamsungGalaxy.png',
    className: styles.samsungGridCard,
  },
  {
    id: 4,
    title: 'Macbook Pro',
    description: 'iPad combines a magnificent 10.2-inch Retina display, incredible performance, multitasking and ease of use.',
    image: '/images/MacbookPro.png',
    className: styles.macbookGridCard,
  },
];

const BG_COLORS = ['#ffffff', '#f9f9f9', '#eaeaea', '#2c2c2c'];
export default function ProductGridBanners() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < GRID_BANNERS_DATA.length) {
      setActiveIndex(newIndex);
    }
  };

  const handleDotClick = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    container.scrollTo({
      left: width * index,
      behavior: 'smooth',
    });
    setActiveIndex(index);
  };

  const isDarkBg = BG_COLORS[activeIndex] === '#2c2c2c';
  const router = useRouter()

  return (
    <Box
      className={[styles.wrapper, isDarkBg ? styles.darkTheme : ''].join(' ')}
      style={{ '--dynamic-bg': BG_COLORS[activeIndex] } as React.CSSProperties}
    >
      <Box
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={styles.gridContainer}
      >
        {GRID_BANNERS_DATA.map((banner) => (
          <Box key={banner.id} className={[styles.gridCard, banner.className].join(' ')}>
            <Box className={styles.imageBox}>
              <img src={banner.image} alt={banner.title} className={styles.productImg} />
            </Box>

            <Box className={styles.infoBox}>
              <Typography className={styles.bannerTitle}>
                {banner.title}
              </Typography>
              <Typography className={styles.bannerDescription}>
                {banner.description}
              </Typography>
              <Button variant="outlined" className={styles.actionButton} onClick={() => router.push('/catalog')}>
                Shop Now
              </Button>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Точки пагинации */}
      <Box className={styles.paginationDots}>
        {GRID_BANNERS_DATA.map((_, index) => (
          <Box
            key={index}
            className={[
              styles.dot,
              activeIndex === index ? styles.activeDot : '',
            ].join(' ')}
            onClick={() => handleDotClick(index)}
          />
        ))}
      </Box>
    </Box>
  );
}