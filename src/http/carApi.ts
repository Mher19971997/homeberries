import { $host, $authHost } from '@homeberris/http/index';
import * as qs from 'qs';

export interface CarBrand {
  uuid: string;
  name: string;
  slug: string;
  country?: string;
  logo_url?: string;
}

export interface CarModel {
  uuid: string;
  brand_id: string;
  name: string;
  slug: string;
  start_year?: number;
  end_year?: number;
}

export interface CarSubModel {
  uuid: string;
  model_id: string;
  name: string;
  body_type?: string;
  generation?: string;
  start_year?: number;
  end_year?: number;
}

export interface Car {
  uuid: string;
  brand_id: string;
  model_id: string;
  sub_model_id?: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  year: number;
  mileage?: number;
  color?: string;
  engine_type?: string;
  engine_volume?: number;
  engine_power_hp?: number;
  transmission?: string;
  drive_type?: string;
  fuel_consumption_city?: number;
  fuel_consumption_highway?: number;
  tire_size?: string;
  wheel_size?: string;
  comfort_features?: object;
  safety_features?: object;
  multimedia_features?: object;
  main_image?: string;
  gallery_images?: string[];
  is_new?: boolean;
  is_available?: boolean;
  brand?: {
    uuid: string;
    name: string;
  };
  model?: {
    uuid: string;
    name: string;
  };
  subModel?: {
    uuid: string;
    name: string;
    body_type?: string;
    generation?: string;
  };
}

export interface CarMenuBrand {
  brand: string;
  uuid: string;
  models: CarMenuModel[];
}

export interface CarMenuModel {
  model: string;
  uuid: string;
  subModels: CarMenuSubModel[];
}

export interface CarMenuSubModel {
  name: string;
  uuid: string;
  generation?: string;
  body_type?: string;
}

/**
 * Получить меню автомобилей (бренды → модели → подмодели)
 */
export const getCarMenu = async (): Promise<CarMenuBrand[]> => {
  const { data } = await $host.get('/api/v1/cars/menu');
  return data;
};

/**
 * Получить все бренды автомобилей
 */
export const getCarBrands = async (): Promise<{ data: CarBrand[] }> => {
  const { data } = await $host.get('/api/v1/car-brands');
  return data;
};

/**
 * Получить модели автомобилей
 */
export const getCarModels = async (brandId?: string): Promise<{ data: CarModel[] }> => {
  const queryString = qs.stringify({
    ...(brandId && {
      filterMeta: {
        brand_id: brandId
      }
    })
  });
  const { data } = await $host.get(`/api/v1/car-models?${queryString}`);
  return data;
};

/**
 * Получить подмодели автомобилей
 */
export const getCarSubModels = async (modelId?: string): Promise<{ data: CarSubModel[] }> => {
  const queryString = qs.stringify({
    ...(modelId && {
      where: {
        model_id: modelId
      }
    })
  });
  const { data } = await $host.get(`/api/v1/car-sub-models?${queryString}`);
  return data;
};

/**
 * Получить автомобили с фильтрами
 */
export const getCars = async (filters?: {
  brand_id?: string;
  model_id?: string;
  sub_model_id?: string;
  year?: number;
  price?: number;
  engine_type?: string;
  transmission?: string;
  drive_type?: string;
  body_type?: string;
  engine_volume?: number;
  mileage?: number;
  is_available?: boolean;
  search?: string;
}): Promise<{ data: Car[] }> => {
  const queryString = qs.stringify({
    ...(filters && {
      where: filters
    })
  });
  const { data } = await $host.get(`/api/v1/cars?${queryString}`);
  return data;
};

/**
 * Поиск автомобилей для автокомплита (по названию/описанию)
 */
export const searchCars = async (term: string): Promise<{ data: Car[] }> => {
  const queryString = qs.stringify({
    search: term,
    is_available: true,
  });
  const { data } = await $host.get(`/api/v1/cars?${queryString}`);
  return data;
};

/**
 * Получить автомобиль по UUID
 */
export const getCarByUuid = async (uuid: string): Promise<Car> => {
  const { data } = await $host.get(`/api/v1/cars/${uuid}`);
  return data;
};

/**
 * Создать автомобиль (требует авторизации)
 */
export const createCar = async (
  formData: FormData
): Promise<Car> => {
  const { data } = await $authHost.post(`/api/v1/cars`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

/**
 * Обновить автомобиль (требует авторизации)
 */
export const updateCar = async (
  uuid: string,
  formData: FormData
): Promise<Car> => {
  const { data } = await $authHost.patch(`/api/v1/cars/${uuid}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

/**
 * Удалить автомобиль (требует авторизации)
 */
export const deleteCar = async (
  uuid: string
): Promise<void> => {
  await $authHost.delete(`/api/v1/cars/${uuid}`);
};

/**
 * Получить статистику по автомобилю
 */
export const getCarStatistics = async (uuid: string): Promise<{
  currentPrice: number;
  averagePrice: number;
  priceDifference: number;
  priceDifferencePercent: number;
  isCheaper: boolean;
  totalCarsInModel: number;
  averageYear: number;
  modelName: string;
  brandName: string;
}> => {
  const { data } = await $host.get(`/api/v1/cars/${uuid}/statistics`);
  return data;
};

/**
 * Получить похожие автомобили
 */
export const getSimilarCars = async (uuid: string, limit?: number): Promise<Car[]> => {
  const queryString = limit ? `?limit=${limit}` : '';
  const { data } = await $host.get(`/api/v1/cars/${uuid}/similar${queryString}`);
  return data;
};
