import { deliveryAddressData } from '@homeberris/types/deliveryAddress';
import { $authHost, $host } from '@homeberris/http/index';

const getDeliveryAddressApi = async (query: string, token: string) => {
  const { data } = await $host.get(`/api/v1/deliveryAddress?${query}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return data;
};

const createDeliveryAddress = async (formData: deliveryAddressData, token?: string) => {
  const { data } = await $host.post('/api/v1/deliveryAddress', formData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export { getDeliveryAddressApi, createDeliveryAddress };
