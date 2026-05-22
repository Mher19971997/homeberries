import React from 'react';
import { Box } from '@mui/material';

interface VisaIconProps {
  width?: number;
  height?: number;
}

const VisaIcon: React.FC<VisaIconProps> = ({ width = 48, height = 32 }) => {
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
        backgroundColor: '#1434CB'
      }}
    >
      <rect width="48" height="32" rx="4" fill="#1434CB"/>
      <text x="24" y="20" fontSize="20" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">VISA</text>
    </Box>
  );
};

export default VisaIcon;
