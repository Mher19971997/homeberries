import ruCommon from '../../public/locales/ru/common.json';
import enCommon from '../../public/locales/en/common.json';
import hyCommon from '../../public/locales/hy/common.json';

export const i18nResources = {
  ru: { common: ruCommon },
  en: { common: enCommon },
  hy: { common: hyCommon },
};

export const i18nConfig = {
  fallbackLng: 'ru',
  supportedLngs: ['ru', 'en', 'hy'],
  defaultNS: 'common',
  ns: ['common'],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
} as const;
