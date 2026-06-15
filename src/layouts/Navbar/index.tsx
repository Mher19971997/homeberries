'use client';
import React, { useState } from 'react';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { useFavorites } from '@homeberris/context/favoritesContext';
import { useQuery } from '@tanstack/react-query';
import { useCookies } from 'react-cookie';
import { useAuth } from '@homeberris/hooks/useAuth';
import { getAllBaskets } from '@homeberris/http/basketApi';
import { getBasketCount } from '@homeberris/utils/indexedDB';
import qs from 'qs';
import styles from './index.module.css';
import { getProfile } from '@homeberris/http/userApi';
import { getAllCatalogs } from '@homeberris/http/catalogApi';
import { CartIcon, FavoriteIcon, GlobeIcon, SearchIcon, UserIcon } from '@homeberris/assets/icons/navbar';
import SelectLanguageInPopover from '@homeberris/components/SelectLanguageInPopover';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '@homeberris/hooks/useDebounce';
import { CatalogItem } from '@homeberris/types/catalog';
import { useParams } from 'next/navigation';

const getLoc = (val: any, locale: string): string => {
  if (!val || typeof val === 'string') return val ?? '';
  return val[locale] || val.en || val.ru || '';
};


const Navbar = () => {
  const { t } = useTranslation('common');
  const params = useParams();
  const locale = (params?.locale as string) ?? 'en';
  const router = useRouter();
  const isAuth = useAuth();
  const [cookies] = useCookies(['token']);
  const { items: favorites } = useFavorites();
  const [localBasketCount, setLocalBasketCount] = React.useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchValue, 300);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    const onOpenMenu = () => setMenuOpen(true);
    window.addEventListener('openNavMenu', onOpenMenu);
    return () => window.removeEventListener('openNavMenu', onOpenMenu);
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['getProfile', cookies.token],
    queryFn: () => getProfile(cookies.token),
    enabled: !!isAuth && !!cookies.token,
  });

  const userLetter = profile?.email ? profile.email[0].toUpperCase() : null;

  const { data: searchResults } = useQuery({
    queryKey: ['navbarSearch', debouncedSearch],
    queryFn: () => getAllCatalogs(qs.stringify({ filterMeta: { name: { iLike: `%${debouncedSearch}%` } }, queryMeta: { paginate: true, limit: 8 } })),
    enabled: debouncedSearch.length >= 2,
  });

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const userAvatar = profile?.avatar ? `http://localhost:6001/${profile.avatar}` : null;

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
        <div className={styles.searchWrapper} ref={searchRef}>
          <div className={styles.searchBox}>
            <SearchIcon className={styles.searchIcon} />
            <input
              placeholder={t('nav.search')}
              className={styles.searchInput}
              suppressHydrationWarning
              value={searchValue}
              onChange={(e) => { setSearchValue(e.target.value); setShowDropdown(true); }}
              onFocus={() => searchValue.length >= 2 && setShowDropdown(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchValue.trim()) {
                  setShowDropdown(false);
                  router.push(`/catalog?search=${encodeURIComponent(searchValue.trim())}`);
                }
              }}
            />
          </div>
          {showDropdown && debouncedSearch.length >= 2 && (
            <div className={styles.searchDropdown}>
              {searchResults?.data && searchResults.data.length > 0 ? (
                searchResults.data.map((item: CatalogItem) => {
                  const cat = getLoc((item as any).category?.name, locale);
                  const sub = getLoc((item as any).subCategorie?.name, locale);
                  const href = cat && sub
                    ? `/catalog/${encodeURIComponent(cat)}/${encodeURIComponent(sub)}/${item.uuid}`
                    : cat ? `/catalog/${encodeURIComponent(cat)}/${item.uuid}` : `/catalog`;
                  return (
                    <div
                      key={item.uuid}
                      className={styles.searchDropdownItem}
                      onClick={() => { setShowDropdown(false); setSearchValue(''); router.push(href); }}
                    >
                      {getLoc(item.name, locale)}
                    </div>
                  );
                })
              ) : (
                <div className={styles.searchDropdownEmpty}>{t('catalog.empty')}</div>
              )}
            </div>
          )}
        </div>

        {/* Навигация */}
        <nav className={styles.navLinks}>
          {[
            { label: t('nav.home'), href: '/' },
            { label: t('nav.about'), href: '/about' },
            { label: t('nav.contact'), href: '/contact' },
            { label: t('nav.blog'), href: '/blog' },
          ].map(({ label, href }) => (
            <span
              key={href}
              onClick={() => router.push(href)}
              className={styles.navLink}
            >
              {label}
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
            {isAuth && userAvatar ? (
              <div className={styles.avatarCircle} style={{ padding: 0, overflow: 'hidden' }}>
                <img src={userAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : isAuth && userLetter ? (
              <div className={styles.avatarCircle}>{userLetter}</div>
            ) : (
              <UserIcon />
            )}
          </button>
          <SelectLanguageInPopover>
            <button className={styles.iconBtn}>
              <GlobeIcon />
            </button>
          </SelectLanguageInPopover>
        </div>

        {/* Бургер кнопка */}
        <button
          className={styles.burgerBtn}
          onClick={() => setMenuOpen(true)}
          aria-label="open menu"
        >
          <svg width="25" height="17" viewBox="0 0 25 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="25" height="2.5" rx="1.25" fill="#080341" />
            <rect y="7.25" width="25" height="2.5" rx="1.25" fill="#080341" />
            <rect y="14.5" width="25" height="2.5" rx="1.25" fill="#080341" />
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
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <nav className={styles.drawerNav}>
          {[
            { label: t('nav.home'), href: '/' },
            { label: t('nav.about'), href: '/about' },
            { label: t('nav.contact'), href: '/contact' },
            { label: t('nav.blog'), href: '/blog' },
          ].map(({ label, href }) => (
            <span
              key={href}
              onClick={() => { router.push(href); setMenuOpen(false); }}
              className={styles.drawerNavLink}
            >
              {label}
            </span>
          ))}
        </nav>

        <div className={styles.drawerActions}>
          <button className={styles.drawerIconBtn} onClick={() => { router.push('/favorites'); setMenuOpen(false); }}>
            <div className={styles.badgeWrapper}>
              <FavoriteIcon />
              {favorites.length > 0 && <span className={styles.badge}>{favorites.length}</span>}
            </div>
            <span className={styles.drawerIconLabel}>{t('profile.favorites')}</span>
          </button>
          <button className={styles.drawerIconBtn} onClick={() => { router.push('/basket'); setMenuOpen(false); }}>
            <div className={styles.badgeWrapper}>
              <CartIcon />
              {basketCount > 0 && <span className={styles.badge}>{basketCount}</span>}
            </div>
            <span className={styles.drawerIconLabel}>{t('profile.basket')}</span>
          </button>
          <button className={styles.drawerIconBtn} onClick={() => { router.push(isAuth ? '/profile' : '/security/login'); setMenuOpen(false); }}>
            {isAuth && userAvatar ? (
              <div className={styles.avatarCircle} style={{ padding: 0, overflow: 'hidden' }}>
                <img src={userAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : isAuth && userLetter ? (
              <div className={styles.avatarCircle}>{userLetter}</div>
            ) : (
              <UserIcon />
            )}
            <span className={styles.drawerIconLabel}>{isAuth ? t('nav.profile') : t('nav.login')}</span>
          </button>
          <SelectLanguageInPopover>
            <button className={styles.drawerIconBtn}>
              <GlobeIcon />
              <span className={styles.drawerIconLabel}>{t('nav.language')}</span>
            </button>
          </SelectLanguageInPopover>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
