import React from 'react';

import styles from '@homeberris/components/GoogleMapLocate/index.module.css';
import NearMeIcon from '@mui/icons-material/NearMe';

interface GoogleMapLocateProps {
  panTo: any;
}

const GoogleMapLocate: React.FC<GoogleMapLocateProps> = ({ panTo }) => {
  return (
    <button
      className={styles.nearMeBtn}
      onClick={() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            panTo({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          () => null
        );
      }}
    >
      <NearMeIcon />
    </button>
  );
};

export default GoogleMapLocate;
