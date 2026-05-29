import React from 'react';
import { useRouter } from 'next/navigation';
import { Inter } from 'next/font/google';
import styles from './index.module.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700'],
  display: 'swap',
});

const SmallerBanners: React.FC = () => {
  const router = useRouter();

  return (
    <div 
      className={`${styles.wrapper} ${inter.className}`}
      style={{ '--font-inter': inter.style.fontFamily } as React.CSSProperties}
    >
      <div className={styles.grid}>
        
        <div className={styles.leftCol}>
          
          <div className={`${styles.card} ${styles.cardPS5}`}>
            <img
              className={styles.imgPS5}
              src="/images/PlayStation.png" 
              alt="Playstation 5"
            />
            <div className={styles.cardTextPS5}>
              <h3 className={styles.titleLg}>Playstation 5</h3>
              <p className={styles.desc}>
                Incredibly powerful CPUs, GPUs, and an SSD with integrated I/O will redefine your PlayStation experience.
              </p>
            </div>
          </div>

          <div className={styles.bottomRow}>
            
            <div className={`${styles.card} ${styles.cardAirpods}`}>
              <img 
                className={styles.imgAirpods} 
                src="/images/AppleAirPodsMax.png" 
                alt="AirPods Max" 
              />
              <div>
                <h3 className={styles.titleSm}>
                  Apple <br />
                  AirPods <br />
                  <strong>Max</strong>
                </h3>
                <p className={styles.desc}>Computational audio. Listen, it's powerful</p>
              </div>
            </div>

            <div className={`${styles.card} ${styles.cardVision}`}>
              <img 
                className={styles.imgVision} 
                src="/images/AppleVisionPro.png" 
                alt="Vision Pro" 
              />
              <div>
                <h3 className={styles.titleSmLight}>
                  Apple <br />
                  Vision <strong>Pro</strong>
                </h3>
                <p className={styles.desc}>An immersive way to experience entertainment</p>
              </div>
            </div>

          </div>
        </div>

        <div className={`${styles.card} ${styles.cardMac}`}>
          
          <div className={styles.macText}>
            <h2 className={styles.titleMac}>
              Macbook <br />
              <strong>Air</strong>
            </h2>
            <p className={styles.desc}>
              The new 15-inch MacBook Air makes room for more of what you love with a spacious Liquid Retina display.
            </p>
            <button 
              className={styles.shopBtn}
              onClick={() => router.push('/catalog')}
            >
              Shop Now
            </button>
          </div>

          <div className={styles.imgMacContainer}>
            <img
              className={styles.imgMac}
              src="/images/MacBookPro14.png"
              alt="Macbook Air"
            />
          </div>

        </div>

      </div>
    </div>
  );
};

export default SmallerBanners;