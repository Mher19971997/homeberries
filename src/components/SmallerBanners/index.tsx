import React from 'react';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { Inter } from 'next/font/google';
import styles from './index.module.css';
import { useTranslation } from 'react-i18next';

const inter = Inter({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700'],
  display: 'swap',
});

const SmallerBanners: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();

  return (
    <div 
      className={`${styles.wrapper} ${inter.className}`}
      style={{ '--font-inter': inter.style.fontFamily } as React.CSSProperties}
    >
      <div className={styles.grid}>
        
        <div className={styles.leftCol}>
          
          {/* PlayStation 5 */}
          <div className={`${styles.card} ${styles.cardPS5}`}>
            <picture className={styles.imgPS5Container}>
              <source media="(max-width: 600px)" srcSet="/images/PlayStationMobile.png" />
              <img
                className={styles.imgPS5}
                src="/images/PlayStation.png" 
                alt="Playstation 5"
              />
            </picture>
            <div className={styles.cardTextPS5}>
              <h3 className={styles.titleLg}>Playstation 5</h3>
              <p className={styles.desc}>{t('smallerBanners.ps5.desc')}</p>
            </div>
          </div>

          <div className={styles.bottomRow}>
            
            {/* AirPods Max */}
            <div className={`${styles.card} ${styles.cardAirpods}`}>
              <picture className={styles.imgAirpodsContainer}>
                <source media="(max-width: 600px)" srcSet="/images/AppleAirPodsMaxMobile.png" />
                <img 
                  className={styles.imgAirpods} 
                  src="/images/AppleAirPodsMax.png" 
                  alt="AirPods Max" 
                />
              </picture>
              <div className={styles.cardTextCenter}>
                <h3 className={styles.titleSm}>
                  Apple <br className={styles.brDesktop} /> AirPods <strong>Max</strong>
                </h3>
                <p className={styles.desc}>{t('smallerBanners.airpods.desc')}</p>
              </div>
            </div>

            {/* Vision Pro */}
            <div className={`${styles.card} ${styles.cardVision}`}>
              <picture className={styles.imgVisionContainer}>
                <source media="(max-width: 600px)" srcSet="/images/AppleVisionProMobile.png" />
                <img 
                  className={styles.imgVision} 
                  src="/images/AppleVisionPro.png" 
                  alt="Vision Pro" 
                />
              </picture>
              <div className={styles.cardTextCenter}>
                <h3 className={styles.titleSmLight}>
                  Apple <br className={styles.brDesktop} /> Vision <strong>Pro</strong>
                </h3>
                <p className={styles.desc}>{t('smallerBanners.visionPro.desc')}</p>
              </div>
            </div>

          </div>
        </div>

        {/* MacBook Air */}
        <div className={`${styles.card} ${styles.cardMac}`}>
          <div className={styles.macText}>
            <h2 className={styles.titleMac}>
              Macbook <br />
              <strong>Air</strong>
            </h2>
            <p className={styles.desc}>{t('smallerBanners.macbook.desc')}</p>
            <button 
              className={styles.shopBtn}
              onClick={() => router.push('/catalog/Computers')}
            >
              {t('home.shopNow')}
            </button>
          </div>

          <div className={styles.imgMacContainer}>
            <picture>
              <source media="(max-width: 900px)" srcSet="/images/MacBookPro.png" />
              <img
                className={styles.imgMac}
                src="/images/MacBookPro14.png"
                alt="Macbook Air"
              />
            </picture>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SmallerBanners;