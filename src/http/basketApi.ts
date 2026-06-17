import { BasketDataItem } from '@homeberris/types/basket';
import { $host } from '@homeberris/http/index';
import { ListResult } from '@homeberris/types/filter';

const authHeader = (token: string) =>
  token ? { Authorization: `Bearer ${token}` } : {};

const getAllBaskets = async (
  query: any,
  token: any
): Promise<{ data: BasketDataItem[]; meta: ListResult }> => {
  const { data } = await $host.get(`/api/v1/basket?${query}`, {
    headers: authHeader(token)
  });
  return data;
};

const insertBasket = async (
  inputDto: any,
  token: string
): Promise<BasketDataItem> => {
  const { data } = await $host.post(`/api/v1/basket`, inputDto, {
    headers: authHeader(token)
  });
  return data;
};

const incrementBasketCatalog = async (
  uuid: any,
  token: string
): Promise<BasketDataItem> => {
  const { data } = await $host.patch(`/api/v1/basket/incremant/${uuid}`, {}, {
    headers: authHeader(token)
  });
  return data;
};

const decrementBasketCatalog = async (
  uuid: string,
  token: string
): Promise<BasketDataItem> => {
  const { data } = await $host.patch(`/api/v1/basket/decrement/${uuid}`, {}, {
    headers: authHeader(token)
  });
  return data;
};

const updateBasketQuantity = async (
  uuid: string,
  quantity: number,
  token: string
): Promise<BasketDataItem> => {
  const { data } = await $host.patch(`/api/v1/basket/${uuid}`, { quantity }, {
    headers: authHeader(token)
  });
  return data;
};

const removeBasketCatalog = async (
  uuid: string,
  token: string
): Promise<BasketDataItem> => {
  const { data } = await $host.delete(`/api/v1/basket/${uuid}`, {
    headers: authHeader(token)
  });
  return data;
};

export { getAllBaskets, insertBasket, decrementBasketCatalog, incrementBasketCatalog, updateBasketQuantity, removeBasketCatalog };
