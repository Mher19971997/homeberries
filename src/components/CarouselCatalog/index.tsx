import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './index.module.css';

const CarouselCatalog: React.FC = () => {
  const router = useRouter();

  return (
    <div className={styles.banner}>
      <div className={styles.bannerContainer}>
        {/* Текст */}
        <div className={styles.textBlock}>
          <span className={styles.proText}>Pro.Beyond.</span>

          <div className={styles.titleRow}>
            <span className={styles.titleLight}>IPhone 14</span>
            <span className={styles.titleBold}>Pro</span>
          </div>

          <p className={styles.description}>
            Created to change everything for the better. For everyone
          </p>

          <button className={styles.shopBtn} onClick={() => router.push('/catalog')}>
            Shop Now
          </button>
        </div>

        {/* Картинка */}
        <img
          className={styles.bannerImg}
          src="/images/IphoneImage.png"
          alt="IPhone 14 Pro"
        />
      </div>
    </div>
  );
};

export default CarouselCatalog;
