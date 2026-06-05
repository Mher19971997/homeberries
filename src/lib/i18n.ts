import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ruCommon from '../../public/locales/ru/common.json';
import enCommon from '../../public/locales/en/common.json';
import hyCommon from '../../public/locales/hy/common.json';

const resources = {
  ru: { common: ruCommon },
  en: { common: enCommon },
  hy: { common: hyCommon },
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'ru',
      fallbackLng: 'ru',
      supportedLngs: ['ru', 'en', 'hy'],
      defaultNS: 'common',
      ns: ['common'],
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    });
}

export async function loadLocaleMessages(locale: string) {
  if (i18n.language !== locale) {
    await i18n.changeLanguage(locale);
  }
}

export default i18n;
