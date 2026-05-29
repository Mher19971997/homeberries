'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CookiesProvider } from 'react-cookie';
import { FavoritesProvider } from '@homeberris/context/favoritesContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '@homeberris/lib/i18n';
import { useParams } from 'next/navigation';

export default function Providers({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const locale = (params?.locale as string) || 'ru';

  const queryClient = React.useRef(new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  React.useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale]);

  return (
    <QueryClientProvider client={queryClient.current}>
      <CookiesProvider>
        <FavoritesProvider>
          <I18nextProvider i18n={i18n}>
            {children}
          </I18nextProvider>
        </FavoritesProvider>
      </CookiesProvider>
    </QueryClientProvider>
  );
}
