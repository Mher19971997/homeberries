import * as React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import SelectLanguageItem from '../SelectLanguageItem';
import styles from '@homeberris/components/SelectLanguageInPopover/index.module.css';
import { Box, Divider } from '@mui/material';
import { useState, useEffect } from 'react';

interface SelectLanguageInPopoverProps {}

interface SelectlanguageItem {
  id: number;
  currency: string;
  flagIconName: string;
  description: string;
  language: string;
}

const SelectLanguageInPopover: React.FC<SelectLanguageInPopoverProps> = (
  props
) => {
  const {} = props as SelectLanguageInPopoverProps;
  const [selectedLanguage, setSelectedLanguage] = useState<string>('RUB');
  
  // Загружаем выбранный язык из localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedLanguage');
      if (saved) {
        setSelectedLanguage(saved);
      }
    }
  }, []);

  const languages = [
    {
      id: 1,
      currency: 'RUB',
      flagIconName: 'fi-ru',
      description: 'Российский рубль',
      language: 'Русский'
    },
    {
      id: 2,
      currency: 'USD',
      flagIconName: 'fi-us',
      description: 'Доллар США',
      language: 'English'
    },
    {
      id: 3,
      currency: 'AMD',
      flagIconName: 'fi-am',
      description: 'Армянский драм',
      language: 'Հայերեն'
    },
    {
      id: 4,
      currency: 'EUR',
      flagIconName: 'fi-eu',
      description: 'Евро',
      language: 'Deutsch'
    }
  ] as SelectlanguageItem[];

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelect = (currency: string) => {
    setSelectedLanguage(currency);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedLanguage', currency);
    }
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'language-popover' : undefined;
  const currentLanguage = languages.find(lang => lang.currency === selectedLanguage) || languages[0];

  return (
    <Box>
      <Box
        className={styles.trigger}
        onClick={handleClick}
        aria-describedby={id}
        component="button"
        sx={{ background: 'transparent', border: 'none', p: 0, m: 0, cursor: 'pointer' }}
      >
        <span className={`fi ${currentLanguage.flagIconName} ${styles.flagIcon}`}></span>
        <Typography className={styles.currencyText}>
          {currentLanguage.currency}
        </Typography>
      </Box>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        PaperProps={{
          className: styles.popoverPaper
        }}
      >
        <Box className={styles.popover}>
          <Typography className={styles.title}>Выберите валюту и язык</Typography>
          <Divider sx={{ my: 1.5 }} />
          <Box className={styles.languagesList}>
            {languages.map((language: SelectlanguageItem) => (
              <SelectLanguageItem
                {...language}
                key={language.id}
                isSelected={selectedLanguage === language.currency}
                onSelect={() => handleLanguageSelect(language.currency)}
              />
            ))}
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

export default SelectLanguageInPopover;
