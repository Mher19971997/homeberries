import { Inter } from 'next/font/google';
import Providers from '@homeberris/app/providers';
import Navbar from '@homeberris/layouts/Navbar';
import Footer from '@homeberris/layouts/Footer';
import NotFoundContent from './not-found-content';
import '@homeberris/styles/globals.css';
import '@homeberris/styles/cropper.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'react-image-gallery/styles/scss/image-gallery.scss';
import 'flag-icons/css/flag-icons.min.css';

const inter = Inter({ subsets: ['latin'] });

export default function GlobalNotFound() {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className} style={{ margin: 0, padding: 0 }} suppressHydrationWarning>
        <Providers>
          <Navbar />
          <NotFoundContent />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
