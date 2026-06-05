import * as React from 'react';
import { createPortal } from 'react-dom';
import styles from './index.module.css';

interface PositionedSnackbarProps {
  open: boolean;
  message: string;
  handleClose: () => void;
  productName?: string;
}

const PositionedSnackbar: React.FC<PositionedSnackbarProps> = ({
  open,
  message,
  handleClose,
  productName,
}) => {
  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(handleClose, 3000);
    return () => clearTimeout(t);
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className={styles.toast} onClick={(e) => e.stopPropagation()}>
      <div className={styles.iconWrap}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="10" fill="#000" />
          <path d="M5.5 10.5L8.5 13.5L14.5 7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className={styles.body}>
        <p className={styles.title}>{message}</p>
        {productName && <p className={styles.sub}>{productName}</p>}
      </div>

      <a href="/basket" className={styles.link} onClick={handleClose}>
        View →
      </a>

      <button className={styles.close} onClick={handleClose} aria-label="close">
        ✕
      </button>

      <div className={styles.progress} />
    </div>,
    document.body
  );
};

export default PositionedSnackbar;
