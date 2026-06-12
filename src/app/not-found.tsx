import { Inter } from 'next/font/google';
import NotFoundWrapper from './not-found-wrapper';
import '@homeberris/styles/globals.css';
import '@homeberris/styles/cropper.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'react-image-gallery/styles/scss/image-gallery.scss';
import 'flag-icons/css/flag-icons.min.css';

const inter = Inter({ subsets: ['latin'] });

export default function GlobalNotFound() {
  return (
    <html suppressHydrationWarning>
      <body className={inter.className} style={{ margin: 0, padding: 0 }} suppressHydrationWarning>
        <NotFoundWrapper />
      </body>
    </html>
  );
}
