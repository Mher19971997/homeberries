'use client'

import { Box, Typography, Link } from '@mui/material';
import styles from './index.module.css';
import { FacebookIcon, InstagramIcon, TikTokIcon, TwitterIcon } from '@homeberris/assets/icons/footer';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation('common');
  
  return (
    <Box component="footer" className={styles.footerContainer}>
      <Box className={styles.footerContent}>
        
        <Box className={styles.brandColumn}>
          <Typography className={styles.logo}>
            cyber
          </Typography>
          <Typography className={styles.description}>
            {t('footer.brand.description')}
          </Typography>
        </Box>

        <Box className={styles.linksColumn}>
          <Typography className={styles.columnTitle}>{t('footer.services.title')}</Typography>
          <Box className={styles.linksList}>
            <Link href="#" className={styles.footerLink}>{t('footer.services.bonusProgram')}</Link>
            <Link href="#" className={styles.footerLink}>{t('footer.services.giftCards')}</Link>
            <Link href="#" className={styles.footerLink}>{t('footer.services.creditPayment')}</Link>
            <Link href="#" className={styles.footerLink}>{t('footer.services.serviceContracts')}</Link>
            <Link href="#" className={styles.footerLink}>{t('footer.services.nonCashAccount')}</Link>
            <Link href="#" className={styles.footerLink}>{t('footer.services.payment')}</Link>
          </Box>
        </Box>

        <Box className={styles.linksColumn}>
          <Typography className={styles.columnTitle}>{t('footer.buyerHelp.title')}</Typography>
          <Box className={styles.linksList}>
            <Link href="#" className={styles.footerLink}>{t('footer.buyerHelp.findOrder')}</Link>
            <Link href="#" className={styles.footerLink}>{t('footer.buyerHelp.deliveryTerms')}</Link>
            <Link href="#" className={styles.footerLink}>{t('footer.buyerHelp.exchangeReturn')}</Link>
            <Link href="#" className={styles.footerLink}>{t('footer.buyerHelp.guarantee')}</Link>
            <Link href="#" className={styles.footerLink}>{t('footer.buyerHelp.faq')}</Link>
            <Link href="#" className={styles.footerLink}>{t('footer.buyerHelp.termsOfUse')}</Link>
          </Box>
        </Box>

        {/* Social icons always at the bottom */}
        <Box className={styles.socialWrapper}>
          <a href="#" className={styles.socialLink} target="_blank" rel="noreferrer">
            <TwitterIcon className={styles.socialIcon} />
          </a>
          <a href="#" className={styles.socialLink} target="_blank" rel="noreferrer">
            <FacebookIcon className={styles.socialIcon} />
          </a>
          <a href="#" className={styles.socialLink} target="_blank" rel="noreferrer">
            <TikTokIcon className={styles.socialIcon} />
          </a>
          <a href="#" className={styles.socialLink} target="_blank" rel="noreferrer">
            <InstagramIcon className={styles.socialIcon} />
          </a>
        </Box>

      </Box>
    </Box>
  );
}


// import React, { useState } from 'react';
// import {
//   Box,
//   Typography,
//   Grid,
//   Link,
//   Collapse,
//   IconButton
// } from '@mui/material';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import ExpandLessIcon from '@mui/icons-material/ExpandLess';
// import { useQRCode } from 'next-qrcode';
// import styles from '@homeberris/layouts/Footer/index.module.css';

// const Footer = () => {
//   const { Canvas } = useQRCode();
//   const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

//   const handleToggle = (key: string) => {
//     setExpandedItems((prev) => ({
//       ...prev,
//       [key]: !prev[key]
//     }));
//   };

//   const buyersLinks = [
//     { label: 'Частые вопросы', href: '/faq' },
//     { label: 'Покупать как бизнес', href: '/business' },
//     { label: 'Доставка по клику из пункта выдачи', href: '/delivery' },
//     {
//       label: 'Юридическая информация',
//       href: '/legal',
//       hasDropdown: true,
//       subItems: [
//         { label: 'Как обрабатываем ваши персональные данные', href: '/privacy' },
//         { label: 'Гид по безопасности', href: '/security' }
//       ]
//     }
//   ];

//   const sellersLinks = [
//     { label: 'Продавать товары', href: '/sell' },
//     { label: 'Открыть пункт выдачи', href: '/pickup-point' },
//     { label: 'Предложить помещение', href: '/premises' },
//     {
//       label: 'Развозить грузы',
//       href: '/cargo',
//       hasDropdown: true,
//       subItems: [
//         { label: 'Доставлять заказы', href: '/deliver-orders' }
//       ]
//     }
//   ];

//   const projectsLinks = [
//     { label: 'WB Guru', href: '/wb-guru' },
//     { label: 'WB Stream', href: '/wb-stream' },
//     { label: 'WB Track', href: '/wb-track' }
//   ];

//   const companyLinks = [
//     { label: 'О нас', href: '/about' },
//     { label: 'Пресс-служба', href: '/press' },
//     { label: 'Контакты', href: '/contacts' },
//     { label: 'Вакансии', href: '/careers' },
//     { label: 'Сообщить о мошенничестве', href: '/fraud' },
//     { label: 'Социальные сети', href: '/social' }
//   ];

//   const renderLinkColumn = (
//     title: string,
//     links: Array<{
//       label: string;
//       href: string;
//       hasDropdown?: boolean;
//       subItems?: Array<{ label: string; href: string }>;
//     }>
//   ) => (
//     <Box className={styles.column}>
//       <Typography variant="h6" className={styles.columnTitle}>
//         {title}
//       </Typography>
//       <Box className={styles.linksContainer}>
//         {links.map((link, index) => (
//           <React.Fragment key={index}>
//             {link.hasDropdown ? (
//               <Box>
//                 <Box
//                   className={styles.dropdownLink}
//                   onClick={() => handleToggle(`${title}-${index}`)}
//                 >
//                   <Link href={link.href} className={styles.link}>
//                     {link.label}
//                   </Link>
//                   <IconButton
//                     size="small"
//                     className={styles.dropdownIcon}
//                     onClick={(e) => {
//                       e.preventDefault();
//                       handleToggle(`${title}-${index}`);
//                     }}
//                   >
//                     {expandedItems[`${title}-${index}`] ? (
//                       <ExpandLessIcon fontSize="small" />
//                     ) : (
//                       <ExpandMoreIcon fontSize="small" />
//                     )}
//                   </IconButton>
//                 </Box>
//                 {link.subItems && (
//                   <Collapse in={expandedItems[`${title}-${index}`]}>
//                     <Box className={styles.subLinks}>
//                       {link.subItems.map((subItem, subIndex) => (
//                         <Link
//                           key={subIndex}
//                           href={subItem.href}
//                           className={styles.subLink}
//                         >
//                           {subItem.label}
//                         </Link>
//                       ))}
//                     </Box>
//                   </Collapse>
//                 )}
//               </Box>
//             ) : (
//               <Link href={link.href} className={styles.link}>
//                 {link.label}
//               </Link>
//             )}
//           </React.Fragment>
//         ))}
//       </Box>
//     </Box>
//   );

//   return (
//     <Box className={styles.footer}>
//       <Box className={styles.footerContent}>
//         <Grid container spacing={4} className={styles.gridContainer}>
//           {/* Navigation Columns */}
//           <Grid item xs={12} md={8}>
//             <Grid container spacing={4}>
//               <Grid item xs={6} sm={3}>
//                 {renderLinkColumn('Покупателям', buyersLinks)}
//               </Grid>
//               <Grid item xs={6} sm={3}>
//                 {renderLinkColumn('Продавцам и партнёрам', sellersLinks)}
//               </Grid>
//               <Grid item xs={6} sm={3}>
//                 {renderLinkColumn('Наши проекты', projectsLinks)}
//               </Grid>
//               <Grid item xs={6} sm={3}>
//                 {renderLinkColumn('Компания', companyLinks)}
//               </Grid>
//             </Grid>
//           </Grid>

//           {/* Mobile App Section */}
//           <Grid item xs={12} md={4}>
//             <Box className={styles.appSection}>
//               <Typography variant="h6" className={styles.appTitle}>
//                 Приложение
//               </Typography>
//               <Typography variant="body2" className={styles.appSubtitle}>
//                 Android и iOS
//               </Typography>
//               <Box className={styles.qrCodeContainer}>
//                 <Canvas
//                   text={process.env.NEXT_PUBLIC_BASE_URL_MAIN || 'https://homeberries.com'}
//                   options={{
//                     errorCorrectionLevel: 'M',
//                     margin: 2,
//                     scale: 4,
//                     width: 120,
//                     color: {
//                       dark: '#000000',
//                       light: '#FFFFFF'
//                     }
//                   }}
//                 />
//               </Box>
//               <Typography variant="caption" className={styles.auroraOS}>
//                 ОС Аврора
//               </Typography>
//               <Box className={styles.socialIcons}>
//                 <Link href="https://vk.com" target="_blank" className={styles.socialIcon}>
//                   <Box className={styles.vkIcon}>VK</Box>
//                 </Link>
//                 <Link href="https://ok.ru" target="_blank" className={styles.socialIcon}>
//                   <Box className={styles.okIcon}>OK</Box>
//                 </Link>
//                 <Link href="https://t.me" target="_blank" className={styles.socialIcon}>
//                   <Box className={styles.telegramIcon}>TG</Box>
//                 </Link>
//               </Box>
//             </Box>
//           </Grid>
//         </Grid>
//       </Box>

//       {/* Copyright Bar */}
//       <Box className={styles.copyrightBar}>
//         <Typography variant="body2" className={styles.copyright}>
//           © StyleBox 2024-2026. Все права защищены.
//         </Typography>
//       </Box>

//     </Box>
//   );
// };

// export default Footer;
