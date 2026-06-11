import { $host } from '@homeberris/http/index';

export interface LocalizedString {
  ru: string;
  en: string;
  hy: string;
}

export interface BannerItem {
  uuid: string;
  title: LocalizedString;
  subtitle?: LocalizedString;
  description?: LocalizedString;
  image: string;
  buttonText?: LocalizedString;
  buttonLink?: string;
  sortOrder: number;
  isActive: boolean;
}

const getActiveBanners = async (): Promise<BannerItem[]> => {
  const { data } = await $host.get(`/api/v1/banner/active`);
  return data;
};

export { getActiveBanners };
