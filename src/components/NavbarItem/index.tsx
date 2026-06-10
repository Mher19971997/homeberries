import React, { ReactElement } from 'react';
import { Badge, Box, Typography } from '@mui/material';
import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';

interface NavbarItemProps {
  label: string;
  to: string;
  Icon: ReactElement;
  bageCount?: number | undefined;
}

const NavbarItem: React.FC<NavbarItemProps> = ({
  label,
  Icon,
  to,
  bageCount
}) => {
  const router = useRouter();

  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      justifyContent={'center'}
      gap={1}
      onClick={() => router.push(to)}
      sx={{ cursor: 'pointer' }}
    >
      {(bageCount && (
        <Badge badgeContent={bageCount} color='secondary'>
          {Icon}
        </Badge>
      )) ||
        Icon}
      <Typography
        sx={{ fontSize: '14px', color: 'rgba(255,255,255,.6)' }}
        color={'white'}
      >
        {label}
      </Typography>
    </Box>
  );
};

export default NavbarItem;
