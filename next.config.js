const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '6001'
      },
      {
        protocol: 'http',
        hostname: '192.168.27.15',
        port: '6001'
      },
      {
        protocol: 'https',
        hostname: 'static-basket-01.wb.ru',
        port: ''
      }
    ]
  },
};

module.exports = nextConfig;