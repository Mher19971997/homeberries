'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, InputBase, Badge, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useFavorites } from '@homeberris/context/favoritesContext';
import { useQuery } from '@tanstack/react-query';
import { useCookies } from 'react-cookie';
import { useAuth } from '@homeberris/hooks/useAuth';
import { getAllBaskets } from '@homeberris/http/basketApi';
import { getBasketCount } from '@homeberris/utils/indexedDB';
import qs from 'qs';
import styles from './index.module.css'
import { CartIcon, FavoriteIcon, SearchIcon, UserIcon } from '@homeberris/assets/icons/navbar';

const Navbar = () => {
  const router = useRouter();
  const isAuth = useAuth();
  const [cookies] = useCookies(['token']);
  const { items: favorites } = useFavorites();
  const [localBasketCount, setLocalBasketCount] = React.useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Получение корзины для авторизованных
  const { data: basket } = useQuery({
    queryKey: ['basketCount', cookies.token],
    queryFn: () => getAllBaskets(qs.stringify({ queryMeta: { paginate: true } }), cookies.token),
    enabled: !!isAuth && !!cookies.token,
  });

  // Корзина для неавторизованных
  React.useEffect(() => {
    if (!isAuth) {
      getBasketCount().then(setLocalBasketCount).catch(() => setLocalBasketCount(0));
    }
  }, [isAuth]);

  const basketCount = isAuth ? (basket?.meta?.count || 0) : localBasketCount;

  return (
    <Box className={styles.navbar}>
      <Box className={styles.navbarInner}>

        {/* Лого */}
        <Typography className={styles.logo} onClick={() => router.push('/')}>
          cyber
        </Typography>

        {/* Поиск */}
        <Box className={styles.searchBox}>
          <SearchIcon className={styles.searchIcon} />
          <InputBase
            placeholder="Search"
            className={styles.searchInput}
          />
        </Box>

        {/* Навигация */}
        <Box className={styles.navLinks}>
          {['Home', 'About', 'Contact Us', 'Blog'].map((item) => (
            <Typography
              key={item}
              onClick={() => router.push('/')}
              className={`${styles.navLink} ${item === 'Home' ? styles.navLinkActive : ''}`}
            >
              {item}
            </Typography>
          ))}
        </Box>

        <Box className={styles.navActions}>
          <IconButton className={styles.iconBtn} onClick={() => router.push('/favorites')}>
            <Badge badgeContent={favorites.length > 0 ? favorites.length : undefined} color="error">
              <FavoriteIcon />
            </Badge>
          </IconButton>
          <IconButton className={styles.iconBtn} onClick={() => router.push('/basket')}>
            <Badge badgeContent={basketCount > 0 ? basketCount : undefined} color="error">
              <CartIcon />
            </Badge>
          </IconButton>
          <IconButton className={styles.iconBtn} onClick={() => router.push(isAuth ? '/profile' : '/security/login')}>
            <UserIcon />
          </IconButton>
        </Box>

        {/* Кнопка Бургера (Мобильная) */}
        <IconButton
          className={styles.burgerBtn}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="menu"
        >
          <MenuIcon />
        </IconButton>

      </Box>
    </Box>
  );
};

export default Navbar;





// import React from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { useRouter } from 'next/navigation';
// import { Box, Typography } from '@mui/material';
// import { useHover } from '@homeberris/hooks/useHover';
// import { checkToken } from '@homeberris/utils/auth';

// // Layouts
// import LeftMenu from '@homeberris/layouts/LeftMenu';

// // Components
// import SearchInput from '@homeberris/components/SearchInput';
// import NavbarItem from '@homeberris/components/NavbarItem';
// import ProfileDropdown from '@homeberris/components/ProfileDropdown';
// // Icons
// import IBurgerMenu from '@homeberris/components/Icons/IBurgerMenu';
// import LocationOnIcon from '@mui/icons-material/LocationOn';
// import Person2Icon from '@mui/icons-material/Person2';
// import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
// import LocalShippingIcon from '@mui/icons-material/LocalShipping';
// import PersonIcon from '@mui/icons-material/Person';
// import FavoriteIcon from '@mui/icons-material/Favorite';
// import SmartToyIcon from '@mui/icons-material/SmartToy';

// // styles
// import styles from '@homeberris/layouts/Navbar/index.module.css';
// import CreateAddress from '@homeberris/components/CreateAddress';
// import SelectLanguageInPopover from '@homeberris/components/SelectLanguageInPopover';
// import { getAllBaskets } from '@homeberris/http/basketApi';
// import qs from 'qs';
// import { useCookies } from 'react-cookie';
// import { useFavorites } from '@homeberris/context/favoritesContext';
// import { getBasketCount } from '@homeberris/utils/indexedDB';
// import { useAuth } from '@homeberris/hooks/useAuth';
// import { useTranslation } from 'react-i18next';

// const Navbar = () => {
//   const { t } = useTranslation('common');
//   const ref = React.useRef<HTMLDivElement | null>(null);
//   const isHovering = useHover(ref);
//   const router = useRouter();
//   const [cookies] = useCookies(['token']);
//   const { items: favorites } = useFavorites();

//   // const [isAuth, setIsAuth] = React.useState(false);
//   const isAuth = useAuth();
//   const [openMenu, setOpenMenu] = React.useState<boolean>(false);
//   const [profileAnchorEl, setProfileAnchorEl] = React.useState<HTMLElement | null>(null);
//   const profileRef = React.useRef<HTMLDivElement>(null);

//   const closeMenu = () => setOpenMenu(false);
//   const openLeftMenu = () => setOpenMenu(true);
//   const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
//     setProfileAnchorEl(event.currentTarget);
//   };
//   const handleProfileClose = () => {
//     setProfileAnchorEl(null);
//   };
//   // searchCatalog

//   const { isLoading, data: basket } = useQuery(
//     ['basketCount', cookies.token],
//     () =>
//       getAllBaskets(
//         qs.stringify({
//           queryMeta: {
//             paginate: true
//           }
//         }),
//         cookies.token
//       ),
//     {
//       enabled: !!isAuth && !!cookies.token
//     }
//   );

//   // Для неавторизованных пользователей получаем корзину из IndexedDB
//   const [localBasketCount, setLocalBasketCount] = React.useState(0);

//   React.useEffect(() => {
//     const updateLocalBasketCount = async () => {
//       if (!isAuth) {
//         try {
//           const count = await getBasketCount();
//           setLocalBasketCount(count);
//         } catch (error) {
//           console.error('Ошибка при получении корзины из IndexedDB:', error);
//           setLocalBasketCount(0);
//         }
//       }
//     };

//     updateLocalBasketCount();

//     // Слушаем события обновления корзины
//     if (typeof window !== 'undefined') {
//       const handleBasketUpdate = () => {
//         updateLocalBasketCount();
//       };

//       window.addEventListener('basketUpdated', handleBasketUpdate);

//       return () => {
//         window.removeEventListener('basketUpdated', handleBasketUpdate);
//       };
//     }
//   }, [isAuth]);

//   // Получаем количество товаров в корзине
//   const basketCount = isAuth ? (basket?.meta?.count || 0) : localBasketCount;

//   // React.useEffect(() => {
//   //   setIsAuth(checkToken());
//   // }, []);

//   return (
//     <Box className={styles.navbar}>
//       <LeftMenu
//         closeMenu={closeMenu}
//         isOpen={openMenu}
//         openLeftMenu={openLeftMenu}
//       />
//       <Box className={styles.navbarHeader}>
//         <SelectLanguageInPopover />
//         <CreateAddress />
//       </Box>
//       <Box className={styles.navbarFoother}>
//         <Box className={styles.navbarFootherLeft}>

//           <Typography className={styles.logo} onClick={() => router.push('/')}>
//             <Box component="span" className={styles.logoGradient}>STYLE</Box>
//             <Box component="span" className={styles.logoBox}>BOX</Box>
//           </Typography>
//           <Box
//             ref={ref}
//             className={styles.burgerMenu}
//             onClick={() => setOpenMenu(true)}
//             sx={{
//               borderColor: (isHovering && '#FFFFFF') || 'rgba(255,255,255,.4)'
//             }}
//           >
//             <IBurgerMenu color={isHovering ? 'white' : 'white'} />
//           </Box>
//         </Box>
//         <Box className={styles.navbarCenter}>
//           <SearchInput />
//         </Box>
//         <Box display={'flex'} alignItems={'center'} gap={2}>
//           <NavbarItem
//             label={t('nav.aiAssistant')}
//             Icon={<SmartToyIcon sx={{ color: 'white' }} />}
//             to={'/ai-assistant'}
//           />
//           <NavbarItem
//             label={t('nav.addresses')}
//             Icon={<LocationOnIcon sx={{ color: 'white' }} />}
//             to={'/services/address'}
//           />
//           {/* Избранное - показываем всегда */}
//           <NavbarItem
//             bageCount={favorites.length > 0 ? favorites.length : undefined}
//             label={t('nav.favorites')}
//             Icon={<FavoriteIcon sx={{ color: 'white' }} />}
//             to='/favorites'
//           />
//           {/* Корзина - показываем всегда */}
//           <NavbarItem
//             bageCount={basketCount > 0 ? basketCount : undefined}
//             label={t('nav.basket')}
//             Icon={<ShoppingBasketIcon sx={{ color: 'white' }} />}
//             to='/basket'
//           />
//           {(!isAuth && (
//             <>
//               <NavbarItem
//                 label={t('nav.login')}
//                 Icon={<Person2Icon sx={{ color: 'white' }} />}
//                 to='/security/login'
//               />
//             </>
//           )) || (
//               <>
//                 <NavbarItem
//                   label={t('nav.delivery')}
//                   Icon={<LocalShippingIcon sx={{ color: 'white' }} />}
//                   to='/myorders/delivery'
//                 />
//                 <Box
//                   ref={profileRef}
//                   display={'flex'}
//                   flexDirection={'column'}
//                   alignItems={'center'}
//                   justifyContent={'center'}
//                   gap={1}
//                   onClick={handleProfileClick}
//                   sx={{ cursor: 'pointer' }}
//                 >
//                   <PersonIcon sx={{ color: router.pathname === '/profile' ? '#FFFFFF' : 'rgba(255,255,255,.6)' }} />
//                   <Typography
//                     sx={{ fontSize: '14px', color: router.pathname === '/profile' ? '#FFFFFF' : 'rgba(255,255,255,.6)' }}
//                   >
//                     {t('nav.profile')}
//                   </Typography>
//                 </Box>
//                 {profileAnchorEl && (
//                   <ProfileDropdown
//                     anchorEl={profileAnchorEl}
//                     open={!!profileAnchorEl}
//                     onClose={handleProfileClose}
//                   />
//                 )}
//               </>
//             )}
//         </Box>
//       </Box>

//       <Box className={styles.navbarMobileContent}>
//         <Typography className={styles.logo} onClick={() => router.push('/')}>
//           <Box component="span" className={styles.logoGradient}>STYLE</Box>
//           <Box component="span" className={styles.logoBox}>BOX</Box>
//         </Typography>
//         <Box className={styles.rightBox}>
//           <CreateAddress />
//         </Box>
//       </Box>
//       <Box sx={{ mt: 2 }}>
//         <SearchInput />
//       </Box>
//     </Box>
//   );
// };

// export default Navbar;
