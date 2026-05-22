import React from 'react';
import type { AppProps } from 'next/app';
import MainContainer from '@homeberris/layouts/MainContainer';
import '@homeberris/styles/globals.css';
import '@homeberris/styles/cropper.css';
import 'slick-carousel/slick/slick.css';
import 'react-credit-cards/es/styles-compiled.css';
import 'slick-carousel/slick/slick-theme.css';
import 'react-image-gallery/styles/scss/image-gallery.scss';
import '/node_modules/flag-icons/css/flag-icons.min.css';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import { CookiesProvider } from 'react-cookie';
import { FavoritesProvider } from '@homeberris/context/favoritesContext';

export default function App({ Component, pageProps }: AppProps) {
  const queryClient = React.useRef<any | null>(new QueryClient());

  return (
    <QueryClientProvider client={queryClient.current}>
      <CookiesProvider>
        <Hydrate state={pageProps.dehydratedState}>
          <FavoritesProvider>
            <MainContainer title='StyleBox - Премиальный интернет-магазин модной одежды и обуви'>
              <Component {...pageProps} />
            </MainContainer>
          </FavoritesProvider>
        </Hydrate>
      </CookiesProvider>
    </QueryClientProvider>
  );
}
