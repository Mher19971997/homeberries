'use client';

import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import styles from './index.module.css';
import { useTranslation } from 'react-i18next';

export default function BigSummerSale() {
  const { t } = useTranslation('common');
  const router = useRouter();

  return (
    <div className={styles.saleBanner}>
      <div className={styles.overlayContent}>
        <h2 className={styles.mainTitle}>
          <span className={styles.thinText}>{t('home.bigSummerSale.titleThin')}</span>
          {' '}
          <span className={styles.boldText}>{t('home.bigSummerSale.titleBold')}</span>
        </h2>

        <p className={styles.subtitle}>
          {t('home.bigSummerSale.subtitle')}
        </p>

        <button className={styles.shopButton} onClick={() => router.push('/en/catalog')}>
          {t('home.shopNow')}
        </button>
      </div>
    </div>
  );
}


// 'use client';

// import { Box, Typography, Button } from '@mui/material';
// import styles from './index.module.css';

// export default function BigSummerSale() {
//   return (
//     <Box className={styles.saleBanner}>
//       <Box className={styles.overlayContent}>
//         <Typography component="h2" className={styles.mainTitle}>
//           <span className={styles.thinText}>Big Summer</span>
//           {' '}
//           <span className={styles.boldText}>Sale</span>
//         </Typography>

//         <Typography className={styles.subtitle}>
//           Commodo fames vitae vitae leo mauris in. Eu consequat.
//         </Typography>

//         <Button variant="outlined" className={styles.shopButton}>
//           Shop Now
//         </Button>
//       </Box>
//     </Box>
//   );
// }