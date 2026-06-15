import React from 'react';
import styles from '@homeberris/layouts/FilterMenu/index.module.css';
import { Box, Button, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CategorySelector from '@homeberris/components/CategorySelector';
import { useTranslation } from 'next-i18next';

interface FilterMenuProps {
  isOpen: boolean;
  closeMenu: () => void;
  openRightMenu: () => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({
  isOpen,
  closeMenu,
  openRightMenu
}) => {
  const { t } = useTranslation('common');
  return (
    <Box className={(isOpen && styles.mainMenu) || ''}>
      <Box
        className={[styles.leftMenu, isOpen ? styles.open : ''].join(' ')}
        onMouseEnter={openRightMenu}
      >
        <Box className={styles.menuContent}>
          <Box className={styles.contentHeader}>
            <Typography className={styles.title} variant="h6">
              {t('sidebarFilters.title')}
            </Typography>
            <IconButton
              className={isOpen ? styles.closeBtn : styles.closeBtnClose}
              onClick={closeMenu}
              size="small"
              aria-label={t('filterMenu.closeFilters')}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Box className={styles.filterContent}>
            <CategorySelector />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default FilterMenu;
