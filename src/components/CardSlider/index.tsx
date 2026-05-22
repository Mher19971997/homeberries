import React from 'react';
import Slider from 'react-slick';
import { Box } from '@mui/material';
import { v4 } from 'uuid';
import styles from '@homeberris/components/CardSlider/index.module.css';
import Image from 'next/image';

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
    // autoplay: true,
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
            <Image
              src={item.imgPath}
              width={280}
              height={280}
              style={{ 
                borderRadius: 0, 
                overflow: 'hidden',
                objectFit: 'contain',
                objectPosition: 'center',
                width: '100%',
                height: '100%',
                minHeight: '280px',
                backgroundColor: '#fff'
              }}
              alt=''
              quality={90}
              priority={false}
              unoptimized={false}
            />
            {/* <img src={item.imgPath} className={styles.imageItem} alt='' /> */}
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default CardSlider;
