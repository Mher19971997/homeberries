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
  imgHeight?: number | string;
}

interface CardSliderImage {
  imgPath: string;
}

const CardSlider: React.FC<CardSliderProps> = ({
  images,
  dots = false,
  slidesToShow = 1,
  imgHeight = 160,
}) => {
  const h = typeof imgHeight === 'number' ? `${imgHeight}px` : imgHeight;

  const isCustomSize = imgHeight !== 160;

  const settings = {
    className: isCustomSize ? '' : 'center',
    centerMode: !isCustomSize,
    infinite: true,
    centerPadding: '0px',
    slidesToShow: slidesToShow,
    speed: 500,
    dots: dots,
    arrows: false,
  };

  return (
    <Box
      className={styles.container}
      style={{ minHeight: h, height: h }}
      sx={{
        '& .slick-list': { height: `${h} !important`, minHeight: `${h} !important` },
        '& .slick-track': { height: `${h} !important`, minHeight: `${h} !important` },
        '& .slick-slide > div': { height: h },
      }}
    >
      <Slider {...settings}>
        {images.map((item: CardSliderImage) => (
          <Box
            key={v4()}
            className={styles.imageItem}
            style={{ height: h, minHeight: h, maxHeight: h }}
          >
            <img
              src={item.imgPath}
              alt=""
              onError={(e) => {
                (e.target as HTMLImageElement).src = EmtpImg.src;
              }}
              style={{
                width: '100%',
                height: h,
                minHeight: 'unset',
                objectFit: 'contain',
                objectPosition: 'center',
                backgroundColor: 'transparent',
                display: 'block',
              }}
            />
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default CardSlider;
