import { UUID } from 'crypto';
import { BrandItem } from './brand';

export interface CatalogItem {
  uuid: UUID;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  name: string;
  description: string;
  price: string;
  oldPrice?: string;
  categoryUuid: UUID;
  subCategoryUuid: UUID;
  brandUuid?: UUID;
  images: ImagesItem[];
  gallery_images?: ImagesItem[];
  category: CategoryItem;
  subCategorie: CategoryItem;
  brand?: BrandItem;
  colors: any;
  infos: InfoItem[];
  comments: CommentItem[];
  groupOption: groupOptionItem[];
  productSpecs?: ProductSpecItem[];
  isDiscount?: boolean;
  discountPercent: number
}
export interface InfoItem {
  uuid: UUID;
  title: string;
  description: string;
}

export interface groupOptionItem {
  name: string;
  options: OptionsItem[];
}

export interface OptionsItem {
  name: string;
  value: string;
  groupOptionUuid: UUID;
}

export interface CommentItem {
  uuid: UUID;
  text: string;
  image?: string;
  createdAt?: Date | string;
  user: {
    email: string;
  };
}

export interface ImagesItem {
  uuid?: string;
  image?: string;
}

export interface ProductSpecItem {
  uuid?: string;
  icon?: string;
  name: { ru: string; en: string; hy: string } | string;
  value: { ru: string; en: string; hy: string } | string;
}

export interface CategoryItem {
  uuid?: string;
  price?: number | string;
  image?: string;
  name: string;
}
