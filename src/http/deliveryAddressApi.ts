import { deliveryAddressData } from '@homeberris/types/deliveryAddress';
import { $host } from '@homeberris/http/index';
import { getToken } from '@homeberris/utils/auth';

const getAuthHeader = (token?: string) => {
  const t = token || getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const getDeliveryAddressApi = async (query: string, token?: string) => {
  const { data } = await $host.get(`/api/v1/deliveryAddress?${query}`, {
    headers: getAuthHeader(token)
  });
  return data;
};

const createDeliveryAddress = async (formData: deliveryAddressData, token?: string) => {
  const { data } = await $host.post('/api/v1/deliveryAddress', formData, {
    headers: getAuthHeader(token)
  });
  return data;
};

const updateDeliveryAddress = async (uuid: string, formData: Partial<deliveryAddressData>, token?: string) => {
  const { data } = await $host.patch(`/api/v1/deliveryAddress/${uuid}`, formData, {
    headers: getAuthHeader(token)
  });
  return data;
};

const deleteDeliveryAddress = async (uuid: string, token?: string) => {
  const { data } = await $host.delete(`/api/v1/deliveryAddress/${uuid}`, {
    headers: getAuthHeader(token)
  });
  return data;
};

export { getDeliveryAddressApi, createDeliveryAddress, updateDeliveryAddress, deleteDeliveryAddress };
