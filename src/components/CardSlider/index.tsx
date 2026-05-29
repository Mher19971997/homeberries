'use client';
import React from 'react';
import Slider from 'react-slick';
import { Box } from '@mui/material';
import { v4 } from 'uuid';
import styles from '@homeberris/components/CardSlider/index.module.css';
import EmtpImg from '@homeberris/assets/cardEmpty.png';

interface CardSliderProps {
  images: CardSliderImage[];
  dots?: boolean;
  slidesToShow?: number;
}

interface CardSliderImage {
  imgPath: string;
}

const CardSlider: React.FC<CardSliderProps> = ({
  images,
  dots = false,
  slidesToShow = 1
}) => {
  const settings = {
    className: 'center',
    centerMode: true,
    infinite: true,
    centerPadding: '0px',
    slidesToShow: slidesToShow,
    speed: 500,
    dots: dots
  };

  return (
    <Box className={styles.container}>
      <Slider {...settings}>
        {images.map((item: CardSliderImage) => (
          <Box key={v4()} className={styles.imageItem}>
            <img
              src={item.imgPath}
              alt=''
              onError={(e) => {
                (e.target as HTMLImageElement).src = EmtpImg.src;
              }}
              style={{
                width: '100%',
                height: '100%',
                minHeight: '280px',
                objectFit: 'contain',
                objectPosition: 'center',
                backgroundColor: '#fff',
                display: 'block'
              }}
            />
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default CardSlider;
