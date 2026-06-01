import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import styles from './index.module.css';

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

export default function ProductGridBanners() {
  return (
    <Box className={styles.gridContainer}>
      {GRID_BANNERS_DATA.map((banner) => (
        <Box key={banner.id} className={[styles.gridCard, banner.className].join(' ')}>
          {/* Контейнер для изображения */}
          <Box className={styles.imageBox}>
            <img src={banner.image} alt={banner.title} className={styles.productImg} />
          </Box>

          {/* Контентный блок */}
          <Box className={styles.infoBox}>
            <Typography className={styles.bannerTitle}>
              {banner.title}
            </Typography>
            <Typography className={styles.bannerDescription}>
              {banner.description}
            </Typography>
            <Button variant="outlined" className={styles.actionButton}>
              Shop Now
            </Button>
          </Box>
        </Box>
      ))}
    </Box>
  );
}