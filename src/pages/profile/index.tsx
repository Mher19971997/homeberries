import React, { useEffect } from 'react';
import {
  Box,
  Avatar,
  Card,
  Grid,
  Typography,
  Button,
  Badge,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import styles from '@homeberris/pages/profile/index.module.css';
import { QueryClient, dehydrate, useQuery } from 'react-query';
import { getProfile } from '@homeberris/http/userApi';
import { InferGetStaticPropsType } from 'next';
import { getTokenFromCookie } from '@homeberris/utils/auth';
import { User } from '@homeberris/types/user';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import StarIcon from '@mui/icons-material/Star';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SettingsIcon from '@mui/icons-material/Settings';
import DevicesIcon from '@mui/icons-material/Devices';
import BusinessIcon from '@mui/icons-material/Business';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { getAllCatalogs } from '@homeberris/http/catalogApi';
import * as qs from 'qs';
import FavoriteItem from '@homeberris/features/favorites/components/FavoriteItems';
import { TopNav } from '@homeberris/features/myorders/delivery';

export default function Profile({ }: InferGetStaticPropsType<
  typeof getServerSideProps
>) {
  const [cookies] = useCookies(['token']);
  const router = useRouter();

  // 🔐 Проверка токена
  useEffect(() => {
    if (!cookies.token) {
      router.replace('/security/login');
    }
  }, [cookies.token, router]);
  const { data: user } = useQuery<User>('getProfile', () => getProfile(cookies.token));

  // Получаем недавно просмотренные товары (заглушка)
  const { data: recentCatalogs } = useQuery(
    'recentCatalogs',
    () => getAllCatalogs(qs.stringify({ queryMeta: { paginate: true, limit: 4 } })),
    { enabled: !!cookies.token }
  );

  return (
    <Box className={styles.body}>
      {/* Top Navigation */}
      <TopNav />

      <Grid container spacing={3} className={styles.container}>
        {/* Left Sidebar */}
        <Grid item lg={3} md={4} xs={12}>
          <Card className={styles.sidebarCard}>
            {/* User Profile */}
            <Box className={styles.userProfileSection}>
              <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: '#667eea' }}>
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={600}>
                    {user?.email?.split('@')[0] || 'Пользователь'}
                  </Typography>
                </Box>
                <Badge badgeContent={2} color="error">
                  <IconButton size="small">
                    <NotificationsNoneIcon />
                  </IconButton>
                </Badge>
              </Box>

              {/* Info Cards */}
              <Box display="flex" gap={1.5} sx={{ mb: 3 }}>
                <Card className={styles.infoCard}>
                  <Typography variant="caption" color="text.secondary">
                    WB скидка
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="#667eea">
                    до 40%
                  </Typography>
                </Card>
                <Card className={styles.infoCard}>
                  <Typography variant="caption" color="text.secondary">
                    Оплата при получении
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="#667eea">
                    до 196 000 ₽
                  </Typography>
                </Card>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Финансы */}
            <Box className={styles.sidebarSection}>
              <Typography variant="caption" className={styles.sectionTitle}>
                Финансы
              </Typography>
              <List>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => router.push('/profile?tab=payment')}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.08)',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: '#242424', minWidth: 40 }}>
                      <CreditCardIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Способы оплаты"
                      primaryTypographyProps={{
                        color: '#242424',
                        fontSize: '14px'
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => router.push('/profile?tab=requisites')}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.08)',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: '#242424', minWidth: 40 }}>
                      <CreditCardIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Реквизиты"
                      primaryTypographyProps={{
                        color: '#242424',
                        fontSize: '14px'
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Управление */}
            <Box className={styles.sidebarSection}>
              <Typography variant="caption" className={styles.sectionTitle}>
                Управление
              </Typography>
              <List>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => router.push('/profile?tab=settings')}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.08)',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: '#242424', minWidth: 40 }}>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Настройки"
                      primaryTypographyProps={{
                        color: '#242424',
                        fontSize: '14px'
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => router.push('/profile?tab=devices')}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.08)',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: '#242424', minWidth: 40 }}>
                      <DevicesIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Ваши устройства"
                      primaryTypographyProps={{
                        color: '#242424',
                        fontSize: '14px'
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Бизнес */}
            <Box className={styles.sidebarSection}>
              <Typography variant="caption" className={styles.sectionTitle}>
                Бизнес
              </Typography>
              <Button
                variant="contained"
                fullWidth
                startIcon={<BusinessIcon />}
                className={styles.businessButton}
                onClick={() => router.push('/profile?tab=business')}
              >
                Покупайте как бизнес
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Main Content */}
        <Grid item lg={9} md={8} xs={12}>
          {/* WB Банк */}
          <Card className={styles.mainCard}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                  0 ₽
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  WB Банк
                </Typography>
              </Box>
              <Button
                variant="contained"
                className={styles.walletButton}
                onClick={() => router.push('/profile?tab=bank')}
              >
                Открыть WB Кошелёк
              </Button>
            </Box>
          </Card>

          {/* Quick Stats */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <Card className={styles.statCard} onClick={() => router.push('/favorites')}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Избранное
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      36 товаров
                    </Typography>
                  </Box>
                  <FavoriteIcon sx={{ fontSize: 40, color: '#667eea' }} />
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card className={styles.statCard} onClick={() => router.push('/profile?tab=purchases')}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Покупки
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      Смотреть
                    </Typography>
                  </Box>
                  <ShoppingBagIcon sx={{ fontSize: 40, color: '#667eea' }} />
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card className={styles.statCard} onClick={() => router.push('/profile?tab=ratings')}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Ждут оценки
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      105 товаров
                    </Typography>
                  </Box>
                  <StarIcon sx={{ fontSize: 40, color: '#667eea' }} />
                </Box>
              </Card>
            </Grid>
          </Grid>

          {/* Сервис и помощь */}
          <Card className={styles.mainCard} sx={{ mt: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Сервис и помощь
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ChatBubbleOutlineIcon />}
                  className={styles.serviceButton}
                  onClick={() => router.push('/profile?tab=support')}
                >
                  Написать в поддержку
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AssignmentReturnIcon />}
                  className={styles.serviceButton}
                  onClick={() => router.push('/profile?tab=return')}
                >
                  Вернуть товар
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<HelpOutlineIcon />}
                  className={styles.serviceButton}
                  onClick={() => router.push('/profile?tab=faq')}
                >
                  Частые вопросы
                </Button>
              </Grid>
            </Grid>
          </Card>

          {/* Недавно смотрели */}
          <Card className={styles.mainCard} sx={{ mt: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Недавно смотрели
              </Typography>
              <Button
                variant="text"
                endIcon={<ArrowForwardIosIcon />}
                onClick={() => router.push('/profile?tab=recent')}
              >
                Все
              </Button>
            </Box>
            {recentCatalogs?.data && recentCatalogs.data.length > 0 ? (
              <Grid container spacing={2}>
                {recentCatalogs.data.slice(0, 4).map((catalog: any) => (
                  <FavoriteItem catalog={catalog} />
                ))}
              </Grid>
            ) : (
              <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                Вы еще не просматривали товары
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export async function getServerSideProps({ req }: any) {
  const queryClient = new QueryClient();
  const token = getTokenFromCookie(req);

  if (token) {
    await queryClient.prefetchQuery('getProfile', () => getProfile(token));
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient)
    }
  };
}
