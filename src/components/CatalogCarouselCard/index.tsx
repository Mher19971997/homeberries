import React from 'react';
import styles from './index.module.css';
import Link from 'next/link';
import Image from 'next/image';

interface CatalogCarouselCardProps {
  photo: {
    id: any;
    title: any;
    thumbnailUrl: any;
  };
}

const CatalogCarouselCard: React.FC<any> = ({ photo }) => {
  // =============== Hooks =========================

  // =============== Function ======================

  // =============== Render ========================
  return (
    <div className={styles.cardWrap}>
      <a className={styles.a}>
        <div className={styles.imageWrap}>
          <Image
            src={photo.thumbnailUrl}
            className={styles.image}
            alt={photo.title}
          />
        </div>
        <div className={styles.cardBody}>
          <p className={styles.title}>{photo.title}</p>
        </div>
      </a>
    </div>
  );
};

export default CatalogCarouselCard;
