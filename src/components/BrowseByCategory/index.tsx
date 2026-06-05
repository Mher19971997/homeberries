import React from 'react';
import { Inter } from 'next/font/google';
import { useRouter } from 'next/navigation';
import styles from './index.module.css';
import { CamerasIcon, ComputersIcon, GamesIcon, HeadPhonesIcon, PhonesIcon, SmartWatchesIcon } from '@homeberris/assets/icons/category';
import { useTranslation } from 'react-i18next';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500'] });

interface Category {
  id: number;
  name: string;
  icon: React.ReactNode;
}



const BrowseByCategory: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
 const categories: Category[] = [
  {
    id: 1,
    name: t('categories.phones'),
    icon: <PhonesIcon/>
  },
  {
    id: 2,
    name: t('categories.smartWatches'),
    icon: <SmartWatchesIcon/>
  },
  {
    id: 3,
    name: t('categories.cameras'),
    icon: <CamerasIcon/>
  },
  {
    id: 4,
    name: t('categories.headphones'),
    icon: <HeadPhonesIcon/>
  },
  {
    id: 5,
    name: t('categories.computers'),
    icon: <ComputersIcon/>
  },
  {
    id: 6,
    name: t('categories.gaming'),
    icon: <GamesIcon/>
  },
]; 

  const handleCategoryClick = (name: string) => {
    router.push(`/catalog/${encodeURIComponent(name)}`);
  };

  return (
    <section className={`${styles.section} ${inter.className}`}>
      <div className={styles.container}>
        
        {/* Шапка секции с заголовком и стрелками */}
        <div className={styles.header}>
          <h2 className={styles.title}>{t('categories.title')}</h2>
          <div className={styles.arrows}>
            <button className={styles.arrowBtn} aria-label="Previous">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button className={styles.arrowBtn} aria-label="Next">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        {/* Сетка с карточками */}
        <div className={styles.grid}>
          {categories.map((category) => (
            <div
              key={category.id}
              className={styles.card}
              onClick={() => handleCategoryClick(category.name)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.iconWrapper}>{category.icon}</div>
              <span className={styles.cardName}>{category.name}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default BrowseByCategory;