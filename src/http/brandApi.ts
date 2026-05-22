import { $host } from '@homeberris/http/index';
import { BrandItem } from '@homeberris/types/brand';
import * as qs from 'qs';

/**
 * Получить все бренды
 */
const getBrands = async (): Promise<{ data: BrandItem[] }> => {
  const { data } = await $host.get('/api/v1/brands');
  return data;
};

/**
 * Получить бренды по категории
 */
const getBrandsByCategory = async (categoryUuid: string): Promise<{ data: BrandItem[] }> => {
  if (!categoryUuid) return { data: [] };
  const queryString = qs.stringify({
    includeMeta: [
      {
        association: 'categories',
        where: {
          uuid: categoryUuid
        }
      }
    ]
  });
  const { data } = await $host.get(`/api/v1/brands?${queryString}`);
  return data;
};

/**
 * Получить бренды по подкатегории
 */
const getBrandsBySubCategory = async (subCategoryUuid: string): Promise<{ data: BrandItem[] }> => {
  if (!subCategoryUuid) return { data: [] };
  const queryString = qs.stringify({
    includeMeta: [
      {
        association: 'subCategories',
        where: {
          uuid: subCategoryUuid
        }
      }
    ]
  });
  const { data } = await $host.get(`/api/v1/brands?${queryString}`);
  return data;
};

export {
  getBrands,
  getBrandsByCategory,
  getBrandsBySubCategory
};
