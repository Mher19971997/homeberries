/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '6001',
      },
      {
        protocol: 'http',
        hostname: '192.168.27.15',
        port: '6001',
      },
      {
        protocol: 'https',
        hostname: 'static-basket-01.wb.ru',
        port: '',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: 'http://localhost:6001/:path*',
      },
    ];
  },
  // Путь алиасы
  transpilePackages: ['@homeberris'],
};

module.exports = nextConfig;
