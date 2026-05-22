import React from 'react';
import { Box } from '@mui/material';
import VisaIcon from './VisaIcon';
import MastercardIcon from './MastercardIcon';

interface PaymentIconsProps {
  size?: number;
}

const MaestroIcon: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  return (
    <Box
      component="svg"
      width={width}
      height={height}
      viewBox="0 0 48 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      sx={{ 
        display: 'inline-block', 
        borderRadius: '4px', 
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        backgroundColor: '#0A1F8F'
      }}
    >
      <rect width="48" height="32" rx="4" fill="#0A1F8F"/>
      <circle cx="18" cy="16" r="8" fill="#00A0E3"/>
      <circle cx="30" cy="16" r="8" fill="#ED1C24"/>
      <text x="24" y="20" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">Maestro</text>
    </Box>
  );
};

const PayPalIcon: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  return (
    <Box
      component="svg"
      width={width}
      height={height}
      viewBox="0 0 48 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      sx={{ 
        display: 'inline-block', 
        borderRadius: '4px', 
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        backgroundColor: '#003087'
      }}
    >
      <rect width="48" height="32" rx="4" fill="#003087"/>
      <text x="24" y="20" fontSize="14" fontWeight="bold" fill="#009CDE" textAnchor="middle" fontFamily="Arial, sans-serif">PayPal</text>
    </Box>
  );
};

const PaymentIcons: React.FC<PaymentIconsProps> = ({ size = 48 }) => {
  const iconHeight = size * 0.67;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
      <VisaIcon width={size} height={iconHeight} />
      <MastercardIcon width={size} height={iconHeight} />
      <MaestroIcon width={size} height={iconHeight} />
      <PayPalIcon width={size} height={iconHeight} />
    </Box>
  );
};

export { VisaIcon, MastercardIcon };
export default PaymentIcons;
