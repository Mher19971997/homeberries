import React from 'react';
import Slider from 'react-slick';
import { Box } from '@mui/material';
import { v4 } from 'uuid';
import styles from '@homeberris/components/CardSliderColors/index.module.css';
import Image from 'next/image';

interface CardSliderColorsProps {
  images: CardSliderColorsImage[];
  dots?: boolean;
  slidesToShow?: number;
}

interface CardSliderColorsImage {
  imgPath: string;
}

const CardSliderColors: React.FC<CardSliderColorsProps> = ({ images }) => {
  const settings = {
    className: 'center',
    centerMode: true,
    focusOnSelect: true,
    infinite: false,
    centerPadding: '110px',
    slidesToShow: 2,
    speed: 500
  };

  return (
    <Box className={styles.container}>
      <Slider {...settings}>
        {images?.map((item: CardSliderColorsImage) => (
          <Box key={v4()}>
            <Image
              src={item.imgPath}
              width={90}
              height={110}
              style={{ borderRadius: 10, overflow: 'hidden' }}
              alt=''
            />
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default CardSliderColors;
