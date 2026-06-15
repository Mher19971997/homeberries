import React, { useState } from 'react';
import { Box, Button, List, ListItem, ListItemButton, ListItemText, Divider, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import BasicPopover from '../BasicPopover';
import styles from './index.module.css';
import { useTranslation } from 'next-i18next';

interface SortOption {
  value: string;
  labelKey: string;
}

interface SortFilterProps {
  value?: string;
  onChange?: (value: string) => void;
}

const sortOptionDefs: SortOption[] = [
  { value: 'popularity', labelKey: 'sortFilter.popularity' },
  { value: 'price_asc', labelKey: 'sortFilter.priceAsc' },
  { value: 'price_desc', labelKey: 'sortFilter.priceDesc' },
  { value: 'rating', labelKey: 'sortFilter.rating' },
  { value: 'newest', labelKey: 'sortFilter.newest' },
  { value: 'discount', labelKey: 'sortFilter.discount' },
];

const SortFilter: React.FC<SortFilterProps> = ({ value = 'popularity', onChange }) => {
  const { t } = useTranslation('common');
  const [selectedValue, setSelectedValue] = useState<string>(value);
  const sortOptions = sortOptionDefs.map(opt => ({ value: opt.value, label: t(opt.labelKey) }));
  const selectedLabel = sortOptions.find(opt => opt.value === selectedValue)?.label || t('sortFilter.popularity');

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    onChange?.(optionValue);
  };

  return (
    <BasicPopover title={selectedLabel} active={selectedValue !== 'popularity'}>
      <Box className={styles.popoverContent}>
        <Typography className={styles.popoverTitle}>{t('sortFilter.title')}</Typography>
        <Divider sx={{ my: 1 }} />
        <List className={styles.optionsList}>
          {sortOptions.map((option) => (
            <ListItem key={option.value} disablePadding>
              <ListItemButton
                className={`${styles.optionItem} ${selectedValue === option.value ? styles.selected : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                <ListItemText 
                  primary={option.label}
                  className={styles.optionText}
                />
                {selectedValue === option.value && (
                  <CheckIcon className={styles.checkIcon} />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </BasicPopover>
  );
};

export default SortFilter;
