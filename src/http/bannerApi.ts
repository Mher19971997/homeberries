import { $host } from '@homeberris/http/index';

export interface BannerItem {
  uuid: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  sortOrder: number;
  isActive: boolean;
}

const getActiveBanners = async (): Promise<BannerItem[]> => {
  const { data } = await $host.get(`/api/v1/banner/active`);
  return data;
};

export { getActiveBanners };
