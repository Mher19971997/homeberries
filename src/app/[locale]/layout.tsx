import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from '@homeberris/app/providers';
import Navbar from '@homeberris/layouts/Navbar';
import BottomBarMobile from '@homeberris/layouts/BottomBarMobile';
import Preloader from '@homeberris/components/Preloader';
import '@homeberris/styles/globals.css';
import '@homeberris/styles/cropper.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'react-image-gallery/styles/scss/image-gallery.scss';
import 'flag-icons/css/flag-icons.min.css';
import styles from '@homeberris/styles/Home.module.css';
import Footer from '@homeberris/layouts/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cyber',
  description: 'Cyber - Премиальный интернет-магазин',
};

const locales = ['ru', 'en', 'hy'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <Providers>
          <Preloader />
          <main className={styles.main}>
            <Navbar />
            <section className={styles.sectionTwo}>{children}</section>
            {/* <BottomBarMobile /> */}
            <Footer/>
          </main>
        </Providers>
      </body>
    </html>
  );
}
