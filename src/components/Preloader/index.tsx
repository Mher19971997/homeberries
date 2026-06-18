'use client';

import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { keyframes } from '@mui/system';

const spin = keyframes`
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;
const spinReverse = keyframes`
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(-360deg); }
`;
const pulse = keyframes`
  0%, 100% { transform: scale(1);    opacity: 1; }
  50%       { transform: scale(1.15); opacity: 0.7; }
`;
const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;
const dotBounce = keyframes`
  0%, 80%, 100% { transform: translateY(0);    opacity: 0.3; }
  40%           { transform: translateY(-8px); opacity: 1;   }
`;
const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;
const fadeOut = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`;

const MIN_DISPLAY_MS = 700;

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const hideTimer = setTimeout(() => {
      setHiding(true);
    }, MIN_DISPLAY_MS);

    const removeTimer = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = '';
      (window as any).__preloaderDone = true;
      window.dispatchEvent(new Event('preloaderDone'));
    }, MIN_DISPLAY_MS + 400);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
      document.body.style.overflow = '';
    };
  }, []);

  if (!visible) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '32px',
        animation: hiding
          ? `${fadeOut} 0.4s ease forwards`
          : `${fadeIn} 0.3s ease forwards`,
        pointerEvents: hiding ? 'none' : 'all',
      }}
    >
      <Box sx={{ position: 'relative', width: '96px', height: '96px' }}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid #f0f0f0',
            borderTopColor: '#000000',
            animation: `${spin} 1s linear infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: '12px',
            borderRadius: '50%',
            border: '2px solid #f0f0f0',
            borderBottomColor: '#555555',
            animation: `${spinReverse} 0.8s linear infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: '28px',
            borderRadius: '50%',
            background: '#000000',
            animation: `${pulse} 1.2s ease-in-out infinite`,
          }}
        />
      </Box>

      <Typography
        sx={{
          fontSize: '15px',
          fontWeight: 700,
          letterSpacing: '6px',
          textTransform: 'uppercase',
          fontFamily: '-apple-system, "Inter", sans-serif',
          background: 'linear-gradient(90deg, #9a9a9a 0%, #000000 40%, #9a9a9a 60%, #9a9a9a 100%)',
          backgroundSize: '200% auto',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: `${shimmer} 2s linear infinite`,
        }}
      >
        cyber
      </Typography>

      <Box sx={{ display: 'flex', gap: '8px' }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#000000',
              animation: `${dotBounce} 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: '#f0f0f0',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            height: '100%',
            width: '60%',
            background: '#000000',
            animation: `${keyframes`
              0%   { left: -60%; }
              100% { left: 110%; }
            `} 1.4s ease-in-out infinite`,
          }}
        />
      </Box>
    </Box>
  );
}
