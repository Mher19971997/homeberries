import { CatalogItem } from "./catalog";

export interface RecentlyViewedDataItem {
  uuid: string;
  catalogUuid: string;
  userUuid: string;
  catalog?: CatalogItem;
  createdAt: string;
  updatedAt: string;
}