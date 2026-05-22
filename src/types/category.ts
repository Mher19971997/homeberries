import { UUID } from 'crypto';

/**
 * Интерфейс категории
 */
export interface CategoryItem {
  uuid: UUID;
  name: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  subCategories?: SubCategoryItem[];
}

/**
 * Интерфейс подкатегории
 */
export interface SubCategoryItem {
  uuid: UUID;
  name: string;
  image?: string;
  categoryUuid?: UUID;
  category?: CategoryItem;
  parentUuid?: UUID;
  parentType?: 'category' | 'subcategory';
  children?: SubCategoryItem[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
