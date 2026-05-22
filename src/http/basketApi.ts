import { BasketDataItem } from '@homeberris/types/basket';
import { $host } from '@homeberris/http/index';
import { ListResult } from '@homeberris/types/filter';

const getAllBaskets = async (
  query: any,
  token: any
): Promise<{ data: BasketDataItem[]; meta: ListResult }> => {
  const { data } = await $host.get(`/api/v1/basket?${query}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return data;
};

const insertBasket = async (
  inputDto: any,
  token: string
): Promise<BasketDataItem> => {
  $host.interceptors.request.use(
    config => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  return await $host.post(`/api/v1/basket`, inputDto);
};



const incrementBasketCatalog = async (
  uuid: any,
  token: string
): Promise<BasketDataItem> => {
  $host.interceptors.request.use(
    config => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  return await $host.patch(`/api/v1/basket/incremant/${uuid}`);
};


const decrementBasketCatalog = async (
  uuid: string,
  token: string
): Promise<BasketDataItem> => {
  $host.interceptors.request.use(
    config => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  return await $host.patch(`/api/v1/basket/decrement/${uuid}`);
};

const removeBasketCatalog = async (
  uuid: string,
  token: string
): Promise<BasketDataItem> => {
  $host.interceptors.request.use(
    config => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  return await $host.delete(`/api/v1/basket/${uuid}`);
};

export { getAllBaskets, insertBasket, decrementBasketCatalog, incrementBasketCatalog, removeBasketCatalog };
