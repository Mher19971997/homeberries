import React from 'react';
import { Box } from '@mui/material';

interface MastercardIconProps {
  width?: number;
  height?: number;
}

const MastercardIcon: React.FC<MastercardIconProps> = ({ width = 48, height = 32 }) => {
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
        backgroundColor: 'white'
      }}
    >
      <rect width="48" height="32" rx="4" fill="white"/>
      <circle cx="18" cy="16" r="9" fill="#EB001B"/>
      <circle cx="30" cy="16" r="9" fill="#F79E1B"/>
      <circle cx="24" cy="16" r="7" fill="#FF5F00" opacity="0.6"/>
    </Box>
  );
};

export default MastercardIcon;
