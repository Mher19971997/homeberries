'use client';

import { useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CookiesProvider } from 'react-cookie';
import { FavoritesProvider } from '@homeberris/context/favoritesContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '@homeberris/lib/i18n';
import { Box, Button, Typography } from '@mui/material';
import Navbar from '@homeberris/layouts/Navbar';
import Footer from '@homeberris/layouts/Footer';

function ErrorContent({
  reset,
}: {
  reset: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(0);
  const queryClient = useRef(new QueryClient());

  useEffect(() => {
    setMounted(true);

    let start = 0;
    const end = 500;
    const step = Math.ceil(1200 / end);
    const timer = setInterval(() => {
      start += 10;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, step);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) return <div style={{ visibility: 'hidden', height: '100vh' }} />;

  return (
    <QueryClientProvider client={queryClient.current}>
      <CookiesProvider>
        <FavoritesProvider>
          <I18nextProvider i18n={i18n}>
            <Box
              sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: '#ffffff',
              }}
            >
              <Navbar />

              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: '16px',
                  overflow: 'hidden',
                  position: 'relative',
                  background: '#ffffff',
                }}
              >
                {[...Array(12)].map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      position: 'absolute',
                      width: `${4 + (i % 3) * 3}px`,
                      height: `${4 + (i % 3) * 3}px`,
                      borderRadius: '50%',
                      background: '#f0f0f0',
                      top: `${8 + i * 7}%`,
                      left: `${4 + i * 8}%`,
                      animation: `dotFloat ${3 + (i % 4)}s ease-in-out infinite`,
                      animationDelay: `${i * 0.3}s`,
                      '@keyframes dotFloat': {
                        '0%, 100%': { transform: 'translateY(0px)', opacity: 0.4 },
                        '50%': { transform: 'translateY(-12px)', opacity: 1 },
                      },
                    }}
                  />
                ))}

                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 600,
                    letterSpacing: '6px',
                    textTransform: 'uppercase',
                    color: '#9a9a9a',
                    fontFamily: '-apple-system, "Inter", sans-serif',
                    mb: '20px',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(-16px)',
                    transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
                  }}
                >
                  cyber
                </Typography>

                <Typography
                  sx={{
                    fontSize: { xs: '88px', md: '140px' },
                    fontWeight: 700,
                    lineHeight: 0.9,
                    letterSpacing: '-6px',
                    color: '#f0f0f0',
                    fontFamily: '-apple-system, "Inter", sans-serif',
                    userSelect: 'none',
                    animation: mounted ? 'floatNum 4s ease-in-out infinite' : 'none',
                    '@keyframes floatNum': {
                      '0%, 100%': { transform: 'translateY(0px)' },
                      '50%': { transform: 'translateY(-10px)' },
                    },
                    opacity: mounted ? 1 : 0,
                    transition: 'opacity 0.4s ease',
                  }}
                >
                  {count}
                </Typography>

                <Box
                  sx={{
                    height: '2px',
                    background: '#000000',
                    my: '18px',
                    width: mounted ? '40px' : '0px',
                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.3 },
                    },
                    animation: 'pulse 2s ease-in-out infinite 1.4s',
                  }}
                />

                <Typography
                  sx={{
                    fontSize: { xs: '20px', md: '26px' },
                    fontWeight: 600,
                    color: '#000000',
                    fontFamily: '-apple-system, "Inter", sans-serif',
                    mb: '8px',
                    textAlign: 'center',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.6s ease 0.8s, transform 0.6s ease 0.8s',
                  }}
                >
                  Something went wrong
                </Typography>

                <Typography
                  sx={{
                    fontSize: '14px',
                    color: '#9a9a9a',
                    fontFamily: '-apple-system, "Inter", sans-serif',
                    lineHeight: 1.6,
                    textAlign: 'center',
                    maxWidth: '360px',
                    mb: '28px',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.6s ease 1s, transform 0.6s ease 1s',
                  }}
                >
                  An unexpected error occurred. You can try again or go back to the homepage.
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.6s ease 1.2s, transform 0.6s ease 1.2s',
                  }}
                >
                  <Button
                    onClick={reset}
                    sx={{
                      background: '#000000',
                      color: '#ffffff',
                      borderRadius: '8px',
                      padding: '12px 32px',
                      fontSize: '14px',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontFamily: '-apple-system, "Inter", sans-serif',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                        transition: 'left 0.4s ease',
                      },
                      '&:hover::after': { left: '100%' },
                      '&:hover': {
                        background: '#222222',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Try Again
                  </Button>

                  <Button
                    onClick={() => window.location.href = '/'}
                    sx={{
                      background: 'transparent',
                      color: '#000000',
                      borderRadius: '8px',
                      padding: '12px 32px',
                      fontSize: '14px',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontFamily: '-apple-system, "Inter", sans-serif',
                      border: '1px solid #b5b5b5',
                      '&:hover': {
                        background: '#f5f5f5',
                        borderColor: '#000000',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Go to Home
                  </Button>
                </Box>
              </Box>

              <Box sx={{ flexShrink: 0, '& footer': { padding: '20px 0 !important' } }}>
                <Footer />
              </Box>
            </Box>
          </I18nextProvider>
        </FavoritesProvider>
      </CookiesProvider>
    </QueryClientProvider>
  );
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html suppressHydrationWarning>
      <body style={{ margin: 0, padding: 0 }} suppressHydrationWarning>
        <ErrorContent reset={reset} />
      </body>
    </html>
  );
}
