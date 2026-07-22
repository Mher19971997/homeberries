import { $host } from "@homeberris/http/index";
import { LocalizedString } from "./bannerApi";

export interface SmallerBannerItem {
  uuid: string;
  title: LocalizedString;
  subtitle?: LocalizedString;
  image?: string;
  buttonText?: LocalizedString;
  buttonLink?: string;
  sortOrder: number;
  isActive: boolean;
}

const getActiveSmallerBanners = async (): Promise<SmallerBannerItem[]> => {
  const { data } = await $host.get(`/api/v1/smaller-banner/active`);
  return data;
};

export { getActiveSmallerBanners };
