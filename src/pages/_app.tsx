import React from 'react';
import type { AppProps } from 'next/app';
import MainContainer from '@homeberris/layouts/MainContainer';
import '@homeberris/styles/globals.css';
import '@homeberris/styles/cropper.css';
import 'slick-carousel/slick/slick.css';
import 'react-credit-cards/es/styles-compiled.css';
import 'slick-carousel/slick/slick-theme.css';
import 'react-image-gallery/styles/scss/image-gallery.scss';
import 'flag-icons/css/flag-icons.min.css';
import { HydrationBoundary, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CookiesProvider } from 'react-cookie';
import { FavoritesProvider } from '@homeberris/context/favoritesContext';
import { appWithTranslation } from 'next-i18next';

function App({ Component, pageProps }: AppProps) {
  const queryClient = React.useRef<QueryClient>(new QueryClient());

  return (
    <QueryClientProvider client={queryClient.current}>
      <CookiesProvider>
        <HydrationBoundary state={pageProps.dehydratedState}>
          <FavoritesProvider>
            <MainContainer title='StyleBox - Premium Online Fashion Store'>
              <Component {...pageProps} />
            </MainContainer>
          </FavoritesProvider>
        </HydrationBoundary>
      </CookiesProvider>
    </QueryClientProvider>
  );
}

export default appWithTranslation(App);
