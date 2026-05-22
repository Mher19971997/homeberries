import React, { useState } from 'react';
import { Box, Button, List, ListItem, ListItemButton, ListItemText, Divider, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import BasicPopover from '../BasicPopover';
import styles from './index.module.css';

interface SortOption {
  value: string;
  label: string;
}

interface SortFilterProps {
  value?: string;
  onChange?: (value: string) => void;
}

const sortOptions: SortOption[] = [
  { value: 'popularity', label: 'По популярности' },
  { value: 'price_asc', label: 'Сначала дешевые' },
  { value: 'price_desc', label: 'Сначала дорогие' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'newest', label: 'Сначала новые' },
  { value: 'discount', label: 'По размеру скидки' },
];

const SortFilter: React.FC<SortFilterProps> = ({ value = 'popularity', onChange }) => {
  const [selectedValue, setSelectedValue] = useState<string>(value);
  const selectedLabel = sortOptions.find(opt => opt.value === selectedValue)?.label || 'По популярности';

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    onChange?.(optionValue);
  };

  return (
    <BasicPopover title={selectedLabel} active={selectedValue !== 'popularity'}>
      <Box className={styles.popoverContent}>
        <Typography className={styles.popoverTitle}>Сортировка</Typography>
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
