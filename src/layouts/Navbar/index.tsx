'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@homeberris/context/favoritesContext';
import { useQuery } from '@tanstack/react-query';
import { useCookies } from 'react-cookie';
import { useAuth } from '@homeberris/hooks/useAuth';
import { getAllBaskets } from '@homeberris/http/basketApi';
import { getBasketCount } from '@homeberris/utils/indexedDB';
import qs from 'qs';
import styles from './index.module.css';
import { CartIcon, FavoriteIcon, SearchIcon, UserIcon } from '@homeberris/assets/icons/navbar';

const Navbar = () => {
  const router = useRouter();
  const isAuth = useAuth();
  const [cookies] = useCookies(['token']);
  const { items: favorites } = useFavorites();
  const [localBasketCount, setLocalBasketCount] = React.useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const { data: basket } = useQuery({
    queryKey: ['basketCount', cookies.token],
    queryFn: () => getAllBaskets(qs.stringify({ queryMeta: { paginate: true } }), cookies.token),
    enabled: !!isAuth && !!cookies.token,
  });

  React.useEffect(() => {
    if (!isAuth) {
      getBasketCount().then(setLocalBasketCount).catch(() => setLocalBasketCount(0));

      const handleBasketUpdated = () => {
        getBasketCount().then(setLocalBasketCount).catch(() => setLocalBasketCount(0));
      };

      window.addEventListener('basketUpdated', handleBasketUpdated);
      return () => window.removeEventListener('basketUpdated', handleBasketUpdated);
    }
  }, [isAuth]);

  const basketCount = isAuth ? (basket?.meta?.count || 0) : localBasketCount;

  return (
    <div className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
      <div className={styles.navbarInner}>

        {/* Лого */}
        <span className={styles.logo} onClick={() => router.push('/')}>
          cyber
        </span>

        {/* Поиск */}
        <div className={styles.searchBox}>
          <SearchIcon className={styles.searchIcon} />
          <input
            placeholder="Search"
            className={styles.searchInput}
          />
        </div>

        {/* Навигация */}
        <nav className={styles.navLinks}>
          {['Home', 'About', 'Contact Us', 'Blog'].map((item) => (
            <span
              key={item}
              onClick={() => router.push('/')}
              className={`${styles.navLink} ${item === 'Home' ? styles.navLinkActive : ''}`}
            >
              {item}
            </span>
          ))}
        </nav>

        <div className={styles.navActions}>
          <button className={styles.iconBtn} onClick={() => router.push('/favorites')}>
            <div className={styles.badgeWrapper}>
              <FavoriteIcon />
              {favorites.length > 0 && <span key={favorites.length} className={styles.badge}>{favorites.length}</span>}
            </div>
          </button>
          <button className={styles.iconBtn} onClick={() => router.push('/basket')}>
            <div className={styles.badgeWrapper}>
              <CartIcon />
              {basketCount > 0 && <span key={basketCount} className={styles.badge}>{basketCount}</span>}
            </div>
          </button>
          <button className={styles.iconBtn} onClick={() => router.push(isAuth ? '/profile' : '/security/login')}>
            <UserIcon />
          </button>
        </div>

        {/* Бургер кнопка */}
        <button
          className={styles.burgerBtn}
          onClick={() => setMenuOpen(true)}
          aria-label="open menu"
        >
          <svg width="25" height="17" viewBox="0 0 25 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="25" height="2.5" rx="1.25" fill="#080341"/>
            <rect y="7.25" width="25" height="2.5" rx="1.25" fill="#080341"/>
            <rect y="14.5" width="25" height="2.5" rx="1.25" fill="#080341"/>
          </svg>
        </button>

      </div>

      {/* Overlay */}
      <div
        className={`${styles.overlay} ${menuOpen ? styles.overlayVisible : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Drawer */}
      <div className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <span className={styles.drawerLogo}>cyber</span>
          <button
            className={styles.closeBtn}
            onClick={() => setMenuOpen(false)}
            aria-label="close menu"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <nav className={styles.drawerNav}>
          {['Home', 'About', 'Contact Us', 'Blog'].map((item) => (
            <span
              key={item}
              onClick={() => { router.push('/'); setMenuOpen(false); }}
              className={`${styles.drawerNavLink} ${item === 'Home' ? styles.drawerNavLinkActive : ''}`}
            >
              {item}
            </span>
          ))}
        </nav>

        <div className={styles.drawerActions}>
          <button className={styles.drawerIconBtn} onClick={() => { router.push('/favorites'); setMenuOpen(false); }}>
            <div className={styles.badgeWrapper}>
              <FavoriteIcon />
              {favorites.length > 0 && <span className={styles.badge}>{favorites.length}</span>}
            </div>
            <span className={styles.drawerIconLabel}>Избранное</span>
          </button>
          <button className={styles.drawerIconBtn} onClick={() => { router.push('/basket'); setMenuOpen(false); }}>
            <div className={styles.badgeWrapper}>
              <CartIcon />
              {basketCount > 0 && <span className={styles.badge}>{basketCount}</span>}
            </div>
            <span className={styles.drawerIconLabel}>Корзина</span>
          </button>
          <button className={styles.drawerIconBtn} onClick={() => { router.push(isAuth ? '/profile' : '/security/login'); setMenuOpen(false); }}>
            <UserIcon />
            <span className={styles.drawerIconLabel}>{isAuth ? 'Профиль' : 'Войти'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
