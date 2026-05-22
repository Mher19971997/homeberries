import { Box, Paper, Typography } from '@mui/material';
import ImageGallery from 'react-image-gallery';
import styles from '@homeberris/features/cars/styles/carDetail.module.css';

export const CarGallery = ({ car }: any) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  const images: any[] = [];

  if (car.main_image) {
    const path = car.main_image.startsWith('/')
      ? car.main_image
      : '/' + car.main_image;

    images.push({
      original: baseUrl + path,
      thumbnail: baseUrl + path,
    });
  }

  if (car.gallery_images) {
    const gallery =
      typeof car.gallery_images === 'string'
        ? JSON.parse(car.gallery_images)
        : car.gallery_images;

    gallery?.forEach((img: string) => {
      const path = img.startsWith('/') ? img : '/' + img;

      images.push({
        original: baseUrl + path,
        thumbnail: baseUrl + path,
      });
    });
  }

  if (!images.length) {
    return (
      <Paper className={styles.imageContainer}>
        <Typography>Изображения отсутствуют</Typography>
      </Paper>
    );
  }

  return (
    <Box className={styles.imageSection}>
      <ImageGallery
        items={images}
        showPlayButton={false}
        showFullscreenButton
        thumbnailPosition="left"
      />
    </Box>
  );
};
