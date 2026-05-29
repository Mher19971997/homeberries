'use client';

import React, { useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Avatar
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useCookies } from 'react-cookie';
import { removeToken } from '@homeberris/utils/auth';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@homeberris/http/userApi';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import RateReviewIcon from '@mui/icons-material/RateReview';
import BusinessIcon from '@mui/icons-material/Business';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import styles from './index.module.css';
import { useTranslation } from 'react-i18next';

interface ProfileDropdownProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

function ProfileDropdown({ anchorEl, open, onClose }: ProfileDropdownProps): React.JSX.Element | null {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [cookies] = useCookies(['token']);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: user } = useQuery({
    queryKey: ['getProfile'],
    queryFn: () => getProfile(cookies.token),
    enabled: open && !!cookies.token
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, anchorEl, onClose]);

  const handleLogout = () => {
    removeToken();
    onClose();
    router.push('/');
  };

  const menuItems = [
    {
      icon: <ShoppingBagIcon />,
      label: `${t('profile.menu.purchases')}`,
      onClick: () => {
        router.push('/myorders/delivery');
        onClose();
      }
    },
    {
      icon: <FavoriteIcon />,
      label: `${t('profile.menu.favorites')}`,
      onClick: () => {
        router.push('/favorites');
        onClose();
      }
    },
    {
      icon: <LocalOfferIcon />,
      label: `${t('profile.menu.brands')}`,
      onClick: () => {
        router.push('/profile?tab=brands');
        onClose();
      }
    },
    {
      icon: <CardGiftcardIcon />,
      label: `${t('profile.menu.orders')}`,
      onClick: () => {
        router.push('/myorders/delivery');
        onClose();
      }
    },
    {
      icon: <CardGiftcardIcon />,
      label: `${t('profile.menu.certificates')}`,
      onClick: () => {
        router.push('/profile?tab=certificates');
        onClose();
      }
    },
    {
      icon: <AccountBalanceWalletIcon />,
      label: `${t('profile.menu.wallet')}`,
      balance: '0 ₽',
      onClick: () => {
        router.push('/profile?tab=bank');
        onClose();
      }
    },
    {
      icon: <CreditCardIcon />,
      label: `${t('profile.menu.paymentMethods')}`,
      onClick: () => {
        router.push('/profile?tab=payment');
        onClose();
      }
    }
  ];

  const chatItems = [
    {
      icon: <ChatBubbleOutlineIcon />,
      label: `${t('profile.chat.title')}`,
      description: `${t('profile.chat.description')}`,
      onClick: () => {
        router.push('/profile?tab=chats');
        onClose();
      }
    },
    {
      icon: <RateReviewIcon />,
      label: `${t('profile.chat.reviews')}`,
      onClick: () => {
        router.push('/profile?tab=reviews');
        onClose();
      }
    },
    {
      icon: <BusinessIcon />,
      label: `${t('profile.chat.business')}`,
      onClick: () => {
        router.push('/profile?tab=business');
        onClose();
      }
    }
  ];

  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && anchorEl) {
      const anchorRect = anchorEl.getBoundingClientRect();
      const top = anchorRect.bottom + 10;
      const left = Math.max(10, anchorRect.right - 320);
      setPosition({ top, left });
    }
  }, [open, anchorEl]);

  if (!open || !anchorEl) return null;

  return (
    <Paper
      ref={dropdownRef}
      className={styles.dropdown}
      sx={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: '320px',
        maxHeight: '80vh',
        overflowY: 'auto',
        zIndex: 1300,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        borderRadius: '12px'
      }}
    >
      {/* User Profile Section */}
      <Box className={styles.userSection}>
        <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: '#667eea', flexShrink: 0 }}>
            {(user as any)?.email?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Box flex={1} sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%'
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {(user as any)?.email?.split('@')[0] || 'Пользователь'}
              </span>
              <ArrowForwardIosIcon sx={{ fontSize: 14, color: '#868695' }} />
            </Typography>
          </Box>
          <Badge badgeContent={2} color="error" sx={{ mr: 1, flexShrink: 0 }}>
            <NotificationsNoneIcon sx={{ color: '#868695' }} />
          </Badge>
        </Box>

        {/* Info Cards */}
        <Box display="flex" gap={1.5} sx={{ mb: 2 }}>
          <Box className={styles.infoCard}>
            <Typography variant="caption" color="text.secondary">
              {t('profile.discount')}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {t('profile.upTo')} 40%
            </Typography>
          </Box>
          <Box className={styles.infoCard}>
            <Typography variant="caption" color="text.secondary">
              {t('profile.paymentOnDelivery')}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {t('profile.upTo')} 196 000 ₽
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Main Menu Items */}
      <List sx={{ py: 1 }}>
        {menuItems.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton onClick={item.onClick} className={styles.menuItem}>
              <ListItemIcon sx={{ minWidth: 40, color: '#868695' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                secondary={(item as any).balance}
                primaryTypographyProps={{
                  fontSize: '14px',
                  fontWeight: 400
                }}
                secondaryTypographyProps={{
                  fontSize: '12px',
                  color: '#667eea',
                  fontWeight: 600
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Chat Section */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography
          variant="caption"
          sx={{ color: '#868695', fontWeight: 600, textTransform: 'uppercase' }}
        >
          {t('profile.chat.title')}
        </Typography>
        <Typography variant="caption" sx={{ color: '#868695', display: 'block', mt: 0.5 }}>
          {t('profile.chat.description')}
        </Typography>
      </Box>

      <List sx={{ py: 1 }}>
        {chatItems.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton onClick={item.onClick} className={styles.menuItem}>
              <ListItemIcon sx={{ minWidth: 40, color: '#868695' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                secondary={(item as any).description}
                primaryTypographyProps={{
                  fontSize: '14px',
                  fontWeight: 400
                }}
                secondaryTypographyProps={{
                  fontSize: '12px',
                  color: '#868695'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Logout */}
      <List sx={{ py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} className={styles.menuItem}>
            <ListItemIcon sx={{ minWidth: 40, color: '#868695' }}>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('profile.logout')}
              primaryTypographyProps={{
                fontSize: '14px',
                fontWeight: 400
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Paper>
  );
}

export default ProfileDropdown;
