'use client';
import React from 'react';
import styles from './index.module.css';
import { Badge, Box } from '@mui/material';

import HomeIcon from '@mui/icons-material/Home';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { usePathname } from 'next/navigation';

import { getAllBaskets } from '@homeberris/http/basketApi';
import { useQuery } from '@tanstack/react-query';
import qs from 'qs';
import { useCookies } from 'react-cookie';

interface BottomBarMobileProps { }

const BottomBarMobile: React.FC<BottomBarMobileProps> = ({ }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [cookies] = useCookies(['token']);

  const { isLoading, data: basket } = useQuery({
    queryKey: ['basketCount', cookies.token],
    queryFn: () =>
      getAllBaskets(
        qs.stringify({
          queryMeta: {
            paginate: true
          }
        }),
        cookies.token
      ),
  });

  const bottomBarData = [
    {
      id: 1,
      icon: (
        <HomeIcon
          style={{ color: (pathname === '/' && '#667eea') || '#868695' }}
        />
      ),
      onClick: () => router.push('/')
    },
    {
      id: 2,
      icon: (
        <ManageSearchIcon
          style={{
            color: '#868695'
          }}
        />
      ),
      onClick: () => router.push('/search')
    },
    {
      id: 3,
      icon: (
        <Badge badgeContent={basket?.meta?.count} color='secondary'>
          <ShoppingCartOutlinedIcon
            style={{
              color: (pathname === '/basket' && '#667eea') || '#868695'
            }}
          />
        </Badge>
      ),
      onClick: () => router.push('/basket')
    },
    {
      id: 5,
      icon: (
        <PersonIcon
          style={{
            color: (pathname === '/profile' && '#667eea') || '#868695'
          }}
        />
      ),
      onClick: () => router.push('/profile')
    }
  ];

  return (
    <Box className={styles.body}>
      {bottomBarData.map((item: any, index: number) => (
        <Box onClick={item.onClick} key={index} className={styles.navItem}>
          {item.icon}
        </Box>
      ))}
    </Box>
  );
};

export default BottomBarMobile;
