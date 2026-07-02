import { CatalogItem } from '@homeberris/types/catalog';
import { $host } from '@homeberris/http/index';
import { ListResult } from '@homeberris/types/filter';
import * as qs from 'qs';

const getAllCatalogs = async (
  query: any
): Promise<{ data: CatalogItem[]; meta: ListResult }> => {
  const { data } = await $host.get(`/api/v1/catalog?${query}`);
  return data;
};

const getCatalogByUud = async (identifier: any, query: any): Promise<CatalogItem> => {
  // Проверяем, является ли identifier UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
  
  if (!isUUID) {
    // Если это не UUID, это может быть имя подкатегории, а не продукта
    // Не пытаемся искать продукт по имени подкатегории - это вызовет ошибку
    throw new Error(`getCatalogByUud expects a UUID, but received: ${identifier}. Use getAllCatalogs for searching by name.`);
  }
  
  // Если это UUID, используем стандартный endpoint
  const { data } = await $host.get(`/api/v1/catalog/${identifier}?${query}`);
  return data;
};

const searchCatalog = async (query: any): Promise<{ data: CatalogItem[]; meta: ListResult }> => {
  const { data } = await $host.get(`/api/v1/catalog/search?${query}`);
  return data;
};

const getPriceRange = async (categoryUuid?: string): Promise<{ min: number; max: number }> => {
  const { data } = await $host.get(`/api/v1/catalog/price-range`, {
    params: categoryUuid ? { categoryUuid } : {},
  });
  return data;
};

export { getAllCatalogs, getCatalogByUud, searchCatalog, getPriceRange };
