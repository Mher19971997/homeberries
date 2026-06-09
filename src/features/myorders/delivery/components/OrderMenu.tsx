import { useEffect, useRef } from 'react';
import styles from "@homeberris/features/myorders/delivery/styles/index.module.css";
import { useTranslation } from 'react-i18next';

interface Props {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export const OrderMenu = ({ anchorEl, onClose }: Props) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation('common');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && e.target !== anchorEl) {
        onClose();
      }
    };
    if (anchorEl) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [anchorEl, onClose]);

  if (!anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();

  return (
    <div
      ref={menuRef}
      className={styles.dropdownMenu}
      style={{ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX }}
    >
      <button className={styles.dropdownItem} onClick={onClose}>{t('delivery.menu.details')}</button>
      <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={onClose}>{t('delivery.menu.cancel')}</button>
    </div>
  );
};
