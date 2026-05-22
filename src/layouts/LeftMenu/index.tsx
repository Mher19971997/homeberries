import React, { useState } from 'react';
import styles from '@homeberris/layouts/LeftMenu/index.module.css';
import CategoryMultiDropdown from '@homeberris/components/CategoryMultiDropdown';
import CarMenuDropdown from '@homeberris/components/CarMenuDropdown';
import { Box, IconButton, Tabs, Tab } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  isOpen: boolean;
  closeMenu: () => void;
  openLeftMenu: () => void;
}

const LeftMenu: React.FC<Props> = ({ isOpen, closeMenu, openLeftMenu }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <div className={(isOpen && styles.mainMenu) || ''}>
      <div
        className={`${styles.leftMenu} ${isOpen ? styles.open : ''}`}
        onMouseEnter={openLeftMenu}
        onMouseLeave={closeMenu}
      >
        <Box className={styles.menuContent}>
          <Box className={styles.menuHeader}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                minHeight: '40px',
                '& .MuiTab-root': {
                  minHeight: '40px',
                  fontSize: '14px',
                  fontWeight: 500,
                },
              }}
            >
              <Tab label="Товары" />
              <Tab label="Автомобили" />
            </Tabs>
            <IconButton
              className={styles.closeBtn}
              onClick={closeMenu}
              size="small"
              aria-label="Закрыть меню"
            >
              <CloseIcon />
            </IconButton>
          </Box>
          {activeTab === 0 ? (
            <CategoryMultiDropdown onCloseMenu={closeMenu} />
          ) : (
            <CarMenuDropdown onCloseMenu={closeMenu} />
          )}
        </Box>
      </div>
    </div>
  );
};

export default LeftMenu;
