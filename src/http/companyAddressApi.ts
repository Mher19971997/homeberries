import { $host } from '@homeberris/http/index';

export interface CompanyAddressData {
  uuid?: string;
  address: string;
  latitude: number;
  longitude: number;
  companyUuid?: string;
  company?: {
    uuid: string;
    name: string;
    description?: string;
  };
}

const getCompanyAddressesPublic = async () => {
  const { data } = await $host.get('/api/v1/companyAddress/public');
  return data;
};

const getCompanyAddresses = async (query: string, token: string) => {
  const { data } = await $host.get(`/api/v1/companyAddress?${query}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return data;
};

const createCompanyAddress = async (formData: CompanyAddressData, token?: string) => {
  const { data } = await $host.post('/api/v1/companyAddress', formData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const updateCompanyAddress = async (uuid: string, formData: Partial<CompanyAddressData>, token?: string) => {
  const { data } = await $host.patch(`/api/v1/companyAddress/${uuid}`, formData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

const deleteCompanyAddress = async (uuid: string, token?: string) => {
  const { data } = await $host.delete(`/api/v1/companyAddress/${uuid}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
};

export {
  getCompanyAddressesPublic,
  getCompanyAddresses,
  createCompanyAddress,
  updateCompanyAddress,
  deleteCompanyAddress
};
