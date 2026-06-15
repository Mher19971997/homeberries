import React, { useState } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemText, Divider, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import BasicPopover from '../BasicPopover';
import styles from './index.module.css';
import { BrandItem } from '@homeberris/types/brand';
import { useTranslation } from 'next-i18next';

interface BrandFilterProps {
  brands: BrandItem[];
  selectedBrands: string[];
  onChange?: (brands: string[]) => void;
}

const BrandFilter: React.FC<BrandFilterProps> = ({ brands, selectedBrands, onChange }) => {
  const { t } = useTranslation('common');
  const hasFilter = selectedBrands.length > 0;
  const title = hasFilter
    ? selectedBrands.length === 1
      ? brands.find((b: BrandItem) => b.uuid === selectedBrands[0])?.name || t('sidebarFilters.brand')
      : `${t('sidebarFilters.brand')} (${selectedBrands.length})`
    : t('sidebarFilters.brand');

  const handleToggle = (brandUuid: string) => {
    const newSelected = selectedBrands.includes(brandUuid)
      ? selectedBrands.filter(uuid => uuid !== brandUuid)
      : [...selectedBrands, brandUuid];
    onChange?.(newSelected);
  };

  if (brands.length === 0) {
    return null;
  }

  return (
    <BasicPopover 
      title={title} 
      active={hasFilter}
    >
      <Box className={styles.popoverContent}>
        <Typography className={styles.popoverTitle}>{t('sidebarFilters.brand')}</Typography>
        <Divider sx={{ my: 1 }} />
        <List className={styles.optionsList}>
          {brands.map((brand: BrandItem) => {
            const isSelected = selectedBrands.includes(brand.uuid);
            return (
              <ListItem key={brand.uuid} disablePadding>
                <ListItemButton
                  className={`${styles.optionItem} ${isSelected ? styles.selected : ''}`}
                  onClick={() => handleToggle(brand.uuid)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    {brand.logo && (
                      <Box
                        component="img"
                        src={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/${brand.logo}`}
                        alt={brand.name}
                        sx={{
                          width: 24,
                          height: 24,
                          objectFit: 'contain'
                        }}
                      />
                    )}
                    <ListItemText 
                      primary={brand.name}
                      className={styles.optionText}
                    />
                  </Box>
                  {isSelected && (
                    <CheckIcon className={styles.checkIcon} />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </BasicPopover>
  );
};

export default BrandFilter;
