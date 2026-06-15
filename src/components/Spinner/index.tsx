'use client';

import React from 'react';
import styles from './index.module.css';

interface SpinnerProps {
  size?: number;
  overlay?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 32, overlay = false }) => (
  <div className={overlay ? styles.overlay : styles.wrap}>
    <svg
      className={styles.spin}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#000"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.15" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  </div>
);

export default Spinner;
