import * as React from "react";
import { createPortal } from "react-dom";
import styles from "./index.module.css";

interface CompareLimitSnackbarProps {
  open: boolean;
  message: string;
  handleClose: () => void;
}

const CompareLimitSnackbar: React.FC<CompareLimitSnackbarProps> = ({
  open,
  message,
  handleClose,
}) => {
  React.useEffect(() => {
    if (!open) return;
    const timer = setTimeout(handleClose, 3000);
    return () => clearTimeout(timer);
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className={styles.toast} onClick={(e) => e.stopPropagation()}>
      <div className={styles.iconWrap}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="10" fill="#e5a000" />
          <path
            d="M10 5.5V11"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="10" cy="14" r="1" fill="#fff" />
        </svg>
      </div>

      <div className={styles.body}>
        <p className={styles.title}>{message}</p>
      </div>

      <button className={styles.close} onClick={handleClose} aria-label="close">
        ✕
      </button>

      <div className={styles.progress} />
    </div>,
    document.body,
  );
};

export default CompareLimitSnackbar;
