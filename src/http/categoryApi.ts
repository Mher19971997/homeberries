import { $host } from '@homeberris/http/index';
import { CategoryItem, SubCategoryItem } from '@homeberris/types/category';
import * as qs from 'qs';

/**
 * Получить все категории
 */
const getCategories = async (): Promise<{ data: CategoryItem[] }> => {
  const { data } = await $host.get('/api/v1/categories');
  return data;
};

/**
 * Получить категорию по UUID
 */
const getCategoryByUuid = async (uuid: string): Promise<CategoryItem> => {
  const { data } = await $host.get(`/api/v1/categories/${uuid}`);
  return data;
};

/**
 * Получить все подкатегории
 * @param categoryUuid - UUID категории (опционально, для фильтрации)
 */
const getSubCategories = async (
  categoryUuid?: string
): Promise<{ data: SubCategoryItem[] }> => {
  const queryString = qs.stringify({
    ...(categoryUuid && {
      where: {
        categoryUuid: categoryUuid
      }
    })
  });
  const { data } = await $host.get(`/api/v1/subCategories?${queryString}`);
  return data;
};

/**
 * Получить подкатегорию по UUID
 */
const getSubCategoryByUuid = async (uuid: string): Promise<SubCategoryItem> => {
  const { data } = await $host.get(`/api/v1/subCategories/${uuid}`);
  return data;
};

/**
 * Получить подкатегорию по имени и категории
 */
const getSubCategoryByName = async (name: string, categoryUuid?: string): Promise<SubCategoryItem | null> => {
  try {
    const queryString = qs.stringify({
      name: name,
      ...(categoryUuid && {
        categoryUuid: categoryUuid
      })
    });
    const { data } = await $host.get(`/api/v1/subCategories?${queryString}`);
    if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
      return data.data[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching subcategory by name:', error);
    return null;
  }
};

/**
 * Поиск категорий по имени
 */
const searchCategories = async (query: string): Promise<{ data: CategoryItem[] }> => {
  const queryString = qs.stringify({
    filterMeta: {
      websearchQuery: {
        name: query
      }
    }
  });
  const { data } = await $host.get(`/api/v1/categories?${queryString}`);
  return data;
};

/**
 * Получить полное дерево меню (категории с вложенными подкатегориями)
 */
const getMenuTree = async (): Promise<CategoryItem[]> => {
  const { data } = await $host.get('/api/v1/categories/menu/tree');
  return data;
};

export {
  getCategories,
  getCategoryByUuid,
  getSubCategories,
  getSubCategoryByUuid,
  getSubCategoryByName,
  searchCategories,
  getMenuTree
};
