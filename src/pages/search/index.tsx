import { Box, Tab, Tabs } from '@mui/material';
import { useMobileSearch } from '@homeberris/features/search/hooks/useMobileSearch';
import styles from './index.module.css';
import MobileCatalogMenu from '@homeberris/features/search/components/MobileCatalogMenu';
import { useState } from 'react';
import MobileCarMenu from '@homeberris/features/search/components/MobileCarMenu';


export default function SearchMobile() {
  const { isMobile, categories, car_brands, isLoadingCarBrand } = useMobileSearch();
  const [activeTab, setActiveTab] = useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  if (!isMobile) return null;

  return (
    <Box className={styles.body}>
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
      {activeTab === 0 ? (
        <MobileCatalogMenu categories={categories} />
      ) : (
        <MobileCarMenu car_brands={car_brands} onCloseMenu={() => []} isLoading={isLoadingCarBrand} />
      )}
    </Box>
  );
}