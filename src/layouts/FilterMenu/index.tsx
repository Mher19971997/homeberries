import React from 'react';
import styles from '@homeberris/layouts/FilterMenu/index.module.css';
import { Box, Button, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CategorySelector from '@homeberris/components/CategorySelector';

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
  return (
    <Box className={(isOpen && styles.mainMenu) || ''}>
      <Box
        className={[styles.leftMenu, isOpen ? styles.open : ''].join(' ')}
        onMouseEnter={openRightMenu}
      >
        <Box className={styles.menuContent}>
          <Box className={styles.contentHeader}>
            <Typography className={styles.title} variant="h6">
              Фильтры
            </Typography>
            <IconButton
              className={isOpen ? styles.closeBtn : styles.closeBtnClose}
              onClick={closeMenu}
              size="small"
              aria-label="Закрыть фильтры"
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
