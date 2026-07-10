import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cyber',
  description: 'Cyber - Премиальный интернет-магазин',
  manifest: '/manifest.json',

  // description: 'StyleBox - Премиальный интернет-магазин модной одежды и обуви',
  // title: 'StyleBox - Премиальный интернет-магазин модной одежды и обуви',
  // icons: { icon: '/favicon.ico' },
  // other: {
  //   'Permissions-Policy':
  //     'accelerometer=(), autoplay=*, clipboard-write=*, encrypted-media=*, gyroscope=(), picture-in-picture=*',
  // },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
