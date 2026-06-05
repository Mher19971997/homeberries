/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'ru',
    locales: ['ru', 'en', 'hy'],
  },
  defaultNS: 'common',
  localePath: './public/locales',
  keySeparator: '.',
};