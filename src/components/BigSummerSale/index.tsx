'use client';

import styles from './index.module.css';

export default function BigSummerSale() {
  return (
    <div className={styles.saleBanner}>
      <div className={styles.overlayContent}>
        <h2 className={styles.mainTitle}>
          <span className={styles.thinText}>Big Summer</span>
          {' '}
          <span className={styles.boldText}>Sale</span>
        </h2>

        <p className={styles.subtitle}>
          Commodo fames vitae vitae leo mauris in. Eu consequat.
        </p>

        <button className={styles.shopButton}>
          Shop Now
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