'use client';
import React, { useEffect, useRef } from 'react';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCookies } from 'react-cookie';
import * as qs from 'qs';
import { getProfile, uploadAvatar } from '@homeberris/http/userApi';
import { getAllCatalogs } from '@homeberris/http/catalogApi';
import { getAllBaskets } from '@homeberris/http/basketApi';
import { getRecentlyViewed } from '@homeberris/utils/recentlyViewed';
import { removeToken } from '@homeberris/utils/auth';
import { useFavorites } from '@homeberris/context/favoritesContext';
import { useTranslation } from 'react-i18next';
import { User } from '@homeberris/types/user';
import CatalogCard from '@homeberris/components/CatalogCard';
import styles from '@homeberris/pages/profile/index.module.css';
import { Package, Heart, ShoppingCart, MapPin, MessageCircle, RotateCcw, HelpCircle, ChevronRight, LogOut } from 'lucide-react';

const buildCatalogUrl = (catalog: any) => {
  const cat = catalog?.category?.name;
  const sub = catalog?.subCategorie?.name;
  if (cat && sub) return `/catalog/${encodeURIComponent(cat)}/${encodeURIComponent(sub)}/${catalog.uuid}`;
  if (cat) return `/catalog/${encodeURIComponent(cat)}/${catalog.uuid}`;
  return `/catalog`;
};

export default function Profile() {
  const [cookies] = useCookies(['token']);
  const router = useRouter();
  const { items: favorites } = useFavorites();
  const { t } = useTranslation('common');

  useEffect(() => {
    if (!cookies.token) router.replace('/security/login');
  }, [cookies.token, router]);

  const { data: user } = useQuery<User>({
    queryKey: ['getProfile'],
    queryFn: () => getProfile(cookies.token),
    enabled: !!cookies.token,
  });

  const { data: basket } = useQuery({
    queryKey: ['basketCount', cookies.token],
    queryFn: () => getAllBaskets(qs.stringify({ queryMeta: { paginate: true } }), cookies.token),
    enabled: !!cookies.token,
  });

  const basketCount = basket?.meta?.count || 0;

  const [recentUuids, setRecentUuids] = React.useState<string[]>([]);

  useEffect(() => {
    setRecentUuids(getRecentlyViewed().slice(0, 4));
  }, []);

  const { data: recentCatalogs } = useQuery({
    queryKey: ['recentCatalogs', recentUuids],
    queryFn: () => getAllCatalogs(qs.stringify({ queryMeta: { paginate: true, limit: 4 }, filterMeta: { uuid: { in: recentUuids } } })),
    enabled: !!cookies.token && recentUuids.length > 0,
  });

  const handleLogout = () => {
    removeToken();
    router.push('/');
  };

  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: updateAvatar } = useMutation({
    mutationFn: ({ uuid, formData }: { uuid: string; formData: FormData }) =>
      uploadAvatar(uuid, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getProfile'] });
    },
  });

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uuid) return;
    const formData = new FormData();
    formData.append('avatar', file);
    updateAvatar({ uuid: user.uuid, formData });
    e.target.value = '';
  };

  const BASE_URL = 'http://localhost:6001';
  const userLetter = user?.email?.[0]?.toUpperCase() || 'U';
  const userName = user?.email?.split('@')[0] || 'User';

  const MENU_ITEMS = [
    { label: t('profile.myOrders'), icon: Package, path: '/myorders/delivery' },
    { label: t('profile.favorites'), icon: Heart, path: '/favorites' },
    { label: t('profile.basket'), icon: ShoppingCart, path: '/basket' },
    { label: t('profile.myAddresses'), icon: MapPin, path: '/order' },
  ];

  const SERVICE_ITEMS = [
    { label: t('profile.support'), icon: MessageCircle },
    { label: t('profile.return'), icon: RotateCcw },
    { label: t('profile.faq'), icon: HelpCircle },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <div className={styles.avatar} onClick={handleAvatarClick} style={{ cursor: 'pointer', overflow: 'hidden', padding: 0 }}>
            {user?.avatar
              ? <img src={`${BASE_URL}/${user.avatar}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : userLetter}
          </div>
          <div className={styles.headerInfo}>
            <p className={styles.userName}>{userName}</p>
            <p className={styles.userEmail}>{user?.email}</p>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16} strokeWidth={1.8} />
            {t('profile.logout')}
          </button>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard} onClick={() => router.push('/favorites')}>
            <Heart size={28} strokeWidth={1.8} color="#111" />
            <p className={styles.statValue}>{favorites.length}</p>
            <p className={styles.statLabel}>{t('profile.favorites')}</p>
          </div>
          <div className={styles.statCard} onClick={() => router.push('/myorders/delivery')}>
            <Package size={28} strokeWidth={1.8} color="#111" />
            <p className={styles.statValue}>—</p>
            <p className={styles.statLabel}>{t('profile.orders')}</p>
          </div>
          <div className={styles.statCard} onClick={() => router.push('/basket')}>
            <ShoppingCart size={28} strokeWidth={1.8} color="#111" />
            <p className={styles.statValue}>{basketCount}</p>
            <p className={styles.statLabel}>{t('profile.basket')}</p>
          </div>
        </div>

        <div className={styles.content}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <p className={styles.sidebarTitle}>{t('profile.navigation')}</p>
              {MENU_ITEMS.map((item) => (
                <button key={item.label} className={styles.menuItem} onClick={() => router.push(item.path)}>
                  <item.icon size={18} strokeWidth={1.8} color="#111" />
                  <span className={styles.menuLabel}>{item.label}</span>
                  <ChevronRight size={16} strokeWidth={1.8} color="#bbb" />
                </button>
              ))}
            </div>

            <div className={styles.sidebarCard}>
              <p className={styles.sidebarTitle}>{t('profile.service')}</p>
              {SERVICE_ITEMS.map((item) => (
                <button key={item.label} className={styles.menuItem}>
                  <item.icon size={18} strokeWidth={1.8} color="#111" />
                  <span className={styles.menuLabel}>{item.label}</span>
                  <ChevronRight size={16} strokeWidth={1.8} color="#bbb" />
                </button>
              ))}
            </div>
          </div>

          {/* Main */}
          <div className={styles.main}>
            <div className={styles.mainCard}>
              <div className={styles.cardHeader}>
                <p className={styles.cardTitle}>{t('profile.recentlyViewed')}</p>
                <button className={styles.seeAll} onClick={() => router.push('/recently-viewed')}>{t('profile.seeAll')}</button>
              </div>
              {recentCatalogs?.data && recentCatalogs.data.length > 0 ? (
                <div className={styles.catalogGrid}>
                  {recentCatalogs.data.slice(0, 4).map((catalog: any) => (
                    <div key={catalog.uuid} className={styles.catalogItem}>
                      <CatalogCard
                        catalog={catalog}
                        onNavigate={() => router.push(buildCatalogUrl(catalog))}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.emptyText}>{t('profile.notViewed')}</p>
              )}
            </div>

            <div className={styles.mainCard}>
              <div className={styles.cardHeader}>
                <p className={styles.cardTitle}>{t('profile.accountInfo')}</p>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>{t('profile.email')}</span>
                <span className={styles.infoValue}>{user?.email || '—'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>{t('profile.role')}</span>
                <span className={styles.infoValue}>
                  {Array.isArray(user?.roles) ? user.roles.join(', ') : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
