'use client';

import React, { useRef, useEffect } from 'react';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface CustomSwiperProps {
  children: React.ReactNode;
}

const CustomSwiper: React.FC<CustomSwiperProps> = ({ children }) => {
  const swiperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (swiperRef.current) {
      new Swiper(swiperRef.current, {
        modules: [Navigation],
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
