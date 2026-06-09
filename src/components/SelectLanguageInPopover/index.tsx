'use client';

import * as React from 'react';
import Popover from '@mui/material/Popover';
import SelectLanguageItem from '../SelectLanguageItem';
import styles from '@homeberris/components/SelectLanguageInPopover/index.module.css';
import { Box } from '@mui/material';
import { useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface SelectLanguageInPopoverProps {
  children?: React.ReactNode;
}

interface SelectlanguageItem {
  id: number;
  flagIconName: string;
  language: string;
  locale: string;
}

const SelectLanguageInPopover: React.FC<SelectLanguageInPopoverProps> = ({
  children,
}) => {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const currentLocale = (params?.locale as string) ?? 'ru';
  const { t } = useTranslation('common');

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const languages: SelectlanguageItem[] = [
    { id: 1, flagIconName: 'fi-ru', language: 'Русский', locale: 'ru' },
    { id: 2, flagIconName: 'fi-us', language: 'English', locale: 'en' },
    { id: 3, flagIconName: 'fi-am', language: 'Հայերեն', locale: 'hy' },
  ];

  // URL — источник правды для активного языка
  const currentLanguage =
    languages.find((l) => l.locale === currentLocale) ?? languages[0];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // ===== SELECT LANGUAGE =====
  const handleLanguageSelect = (option: SelectlanguageItem) => {
    if (option.locale === currentLocale) { handleClose(); return; }
    document.cookie = `NEXT_LOCALE=${option.locale}; path=/; max-age=31536000`;
    const segments = (pathname ?? '/').split('/');
    segments[1] = option.locale;
    const newPath = segments.join('/') || `/${option.locale}`;
    router.push(newPath);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'language-popover' : undefined;

  useEffect(() => {
    if (!open) return;

    const handleScroll = () => handleClose();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [open]);

  return (
    <Box>
      {children ? (
        <Box
          component="span"
          onClick={handleClick}
          aria-describedby={id}
          sx={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
        >
          {children}
        </Box>
      ) : (
        <Box
          className={styles.trigger}
          onClick={handleClick}
          aria-describedby={id}
          component="button"
          sx={{ background: 'transparent', border: 'none', p: 0, m: 0, cursor: 'pointer' }}
        >
          <span className={`fi ${currentLanguage.flagIconName} ${styles.flagIcon}`} />
        </Box>
      )}

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableScrollLock
        transitionDuration={0}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ className: styles.popoverPaper }}
      >
        <Box className={styles.popover}>
          <Box className={styles.languagesList}>
            {languages.map((language) => (
              <SelectLanguageItem
                key={language.id}
                {...language}
                isSelected={currentLanguage.locale === language.locale}
                onSelect={() => handleLanguageSelect(language)}
              />
            ))}
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

export default SelectLanguageInPopover;






// import * as React from 'react';
// import Popover from '@mui/material/Popover';
// import Typography from '@mui/material/Typography';
// import SelectLanguageItem from '../SelectLanguageItem';
// import styles from '@homeberris/components/SelectLanguageInPopover/index.module.css';
// import { Box, Divider } from '@mui/material';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useTranslation } from 'react-i18next';

// interface SelectLanguageInPopoverProps { }

// interface SelectlanguageItem {
//   id: number;
//   currency: string;
//   flagIconName: string;
//   description: string;
//   language: string;
//   locale: string;
// }

// const SelectLanguageInPopover: React.FC<SelectLanguageInPopoverProps> = (
//   props
// ) => {
//   const { } = props as SelectLanguageInPopoverProps;
//   const router = useRouter();
//   const { t } = useTranslation('common');
//   const [selectedLanguage, setSelectedLanguage] = useState<string>('RUB');

//   // Загружаем выбранный язык из localStorage
//   // useEffect(() => {
//   //   if (typeof window !== 'undefined') {
//   //     const saved = localStorage.getItem('selectedLanguage');
//   //     if (saved) {
//   //       setSelectedLanguage(saved);
//   //     }
//   //   }
//   // }, []);

//   const languages = [
//     {
//       id: 1,
//       currency: 'RUB',
//       flagIconName: 'fi-ru',
//       description: 'Российский рубль',
//       language: 'Русский'
//     },
//     {
//       id: 2,
//       currency: 'USD',
//       flagIconName: 'fi-us',
//       description: 'Доллар США',
//       language: 'English'
//     },
//     {
//       id: 3,
//       currency: 'AMD',
//       flagIconName: 'fi-am',
//       description: 'Армянский драм',
//       language: 'Հայերեն'
//     },
//     {
//       id: 4,
//       currency: 'EUR',
//       flagIconName: 'fi-eu',
//       description: 'Евро',
//       language: 'Deutsch'
//     }
//   ] as SelectlanguageItem[];

//   const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(
//     null
//   );

//   const handleClick = (event: React.MouseEvent<HTMLElement>) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleClose = () => {
//     setAnchorEl(null);
//   };

//   // const handleLanguageSelect = (currency: string) => {
//   //   setSelectedLanguage(currency);
//   //   if (typeof window !== 'undefined') {
//   //     localStorage.setItem('selectedLanguage', currency);
//   //   }
//   //   handleClose();
//   // };
//   const handleLanguageSelect = (option: SelectlanguageItem) => {
//     setSelectedLanguage(option.currency);
//     if (typeof window !== 'undefined') {
//       localStorage.setItem('selectedLanguage', option.currency);
//     }
//     router.push(router.asPath, router.asPath, { locale: option.locale });
//     handleClose();
//   };

//   const open = Boolean(anchorEl);
//   const id = open ? 'language-popover' : undefined;
//   // const currentLanguage = languages.find(lang => lang.currency === selectedLanguage) || languages[0];
//   const currentLanguage = languages.find((l) => l.locale === router.locale) ?? languages[0];

//   useEffect(() => {
//     const handleScroll = () => {
//       if (open) {
//         handleClose();
//       }
//     };

//     if (open) {
//       window.addEventListener('scroll', handleScroll, { passive: true });
//     }

//     return () => {
//       window.removeEventListener('scroll', handleScroll);
//     };
//   }, [open]);

//   return (
//     <Box>
//       <Box
//         className={styles.trigger}
//         onClick={handleClick}
//         aria-describedby={id}
//         component="button"
//         sx={{ background: 'transparent', border: 'none', p: 0, m: 0, cursor: 'pointer' }}
//       >
//         <span className={`fi ${currentLanguage.flagIconName} ${styles.flagIcon}`}></span>
//         <Typography className={styles.currencyText}>
//           {currentLanguage.currency}
//         </Typography>
//       </Box>
//       <Popover
//         id={id}
//         open={open}
//         anchorEl={anchorEl}
//         onClose={handleClose}
//         disableScrollLock
//         transitionDuration={0}
//         anchorOrigin={{
//           vertical: 'bottom',
//           horizontal: 'left'
//         }}
//         transformOrigin={{
//           vertical: 'top',
//           horizontal: 'left'
//         }}
//         PaperProps={{
//           className: styles.popoverPaper
//         }}
//       >
//         <Box className={styles.popover}>
//           {/* <Typography className={styles.title}>Выберите валюту и язык</Typography> */}
//           <Typography className={styles.title}>{t('language.selectTitle')}</Typography>
//           <Divider sx={{ my: 1.5 }} />
//           <Box className={styles.languagesList}>
//             {languages.map((language: SelectlanguageItem) => (
//               <SelectLanguageItem
//                 {...language}
//                 key={language.id}
//                 isSelected={selectedLanguage === language.currency}
//                 onSelect={() => handleLanguageSelect(language)}
//               />
//             ))}
//           </Box>
//         </Box>
//       </Popover>
//     </Box>
//   );
// };

// export default SelectLanguageInPopover;
