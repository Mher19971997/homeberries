'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CookiesProvider } from 'react-cookie';
import { FavoritesProvider } from '@homeberris/context/favoritesContext';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { createInstance } from 'i18next';
import { i18nResources, i18nConfig } from '@homeberris/lib/i18n';

function createI18nInstance(locale: string) {
  const instance = createInstance();
  instance.use(initReactI18next).init({
    ...i18nConfig,
    resources: i18nResources,
    lng: locale,
  });
  return instance;
}

export default function Providers({ children, locale }: { children: React.ReactNode; locale: string }) {
  const i18nRef = React.useRef<{ instance: ReturnType<typeof createInstance>; locale: string } | null>(null);

  if (!i18nRef.current || i18nRef.current.locale !== locale) {
    i18nRef.current = { instance: createI18nInstance(locale), locale };
  }


  const queryClient = React.useRef(new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));



  return (
    <QueryClientProvider client={queryClient.current}>
      <CookiesProvider>
        <FavoritesProvider>
          <I18nextProvider i18n={i18nRef.current.instance}>
            {children}
          </I18nextProvider>
        </FavoritesProvider>
      </CookiesProvider>
    </QueryClientProvider>
  );
}
