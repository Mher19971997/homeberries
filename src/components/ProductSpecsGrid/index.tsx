import React from 'react';
import styles from './index.module.css';

interface SpecItem {
  name: string;
  value: string;
  icon?: React.ReactNode;
}

interface ProductSpecsGridProps {
  specs: SpecItem[];
}

export default function ProductSpecsGrid({ specs }: ProductSpecsGridProps) {
  return (
    <div className={styles.specsGrid}>
      {specs.map((spec, i) => (
        <div key={i} className={styles.specCard}>
          {spec.icon && <div className={styles.specIcon}>{spec.icon}</div>}
          <div className={styles.specText}>
            <span className={styles.specLabel}>{spec.name}</span>
            <span className={styles.specValue}>{spec.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
