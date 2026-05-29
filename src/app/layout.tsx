import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StyleBox - Премиальный интернет-магазин модной одежды и обуви',
  description: 'StyleBox - Премиальный интернет-магазин модной одежды и обуви',
  icons: { icon: '/favicon.ico' },
  other: {
    'Permissions-Policy':
      'accelerometer=(), autoplay=*, clipboard-write=*, encrypted-media=*, gyroscope=(), picture-in-picture=*',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
