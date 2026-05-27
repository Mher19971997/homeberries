import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getTranslationProps = async (
  locale: string | undefined,
  namespaces: string[] = ['common']
) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'ru', namespaces)),
    },
  };
};