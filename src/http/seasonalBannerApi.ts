import { $host } from '@homeberris/http/index';
import { LocalizedString } from '@homeberris/http/bannerApi';

export interface SeasonalBannerItem {
  uuid: string;
  title: LocalizedString;
  subtitle?: LocalizedString;
  buttonText?: LocalizedString;
  buttonLink?: string;
  sortOrder: number;
  isActive: boolean;
}

const getActiveSeasonalBanners = async (): Promise<SeasonalBannerItem[]> => {
  const { data } = await $host.get(`/api/v1/seasonal-banner/active`);
  return data;
};

export { getActiveSeasonalBanners };
