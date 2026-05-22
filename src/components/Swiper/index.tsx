import React, { useRef, useEffect } from 'react';
import Swiper, { Navigation } from 'swiper';
import 'swiper/swiper-bundle.min.css';

interface CustomSwiperProps {
  children: React.ReactNode;
}
Swiper.use([Navigation]);

const CustomSwiper: React.FC<CustomSwiperProps> = ({ children }) => {
  const swiperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (swiperRef.current) {
      new Swiper(swiperRef.current, {
        // Swiper configuration options
        slidesPerView: 3,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        }
      });
    }
  }, []);

  return (
    <div className='swiper-container' ref={swiperRef}>
      <div className='swiper-wrapper'>{children}</div>
      <div className='swiper-button-next'></div>
      <div className='swiper-button-prev'></div>
    </div>
  );
};

export default CustomSwiper;
