import { useEffect, useRef } from 'react';
import styles from "@homeberris/features/myorders/delivery/styles/index.module.css";
import { useTranslation } from 'react-i18next';

interface Props {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onDetails: () => void;
}

export const OrderMenu = ({ anchorEl, onClose, onDetails }: Props) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation('common');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && e.target !== anchorEl) {
        onClose();
      }
    };
    const handleScroll = () => onClose();
    if (anchorEl) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [anchorEl, onClose]);

  if (!anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();

  return (
    <div
      ref={menuRef}
      className={styles.dropdownMenu}
      style={{ top: rect.bottom + 4, left: rect.left }}
    >
      <button className={styles.dropdownItem} onClick={() => { onDetails(); onClose(); }}>{t('delivery.menu.details')}</button>
      {/* <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={onClose}>{t('delivery.menu.cancel')}</button> */}
    </div>
  );
};
