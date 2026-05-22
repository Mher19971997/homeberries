import { $authHost, $host } from '@homeberris/http/index';

export interface CompanyData {
  uuid?: string;
  name: string;
  description?: string;
  ownerUuid?: string;
  catalogs?: any[];
  addresses?: any[];
}

const getCompany = async (uuid: string) => {
  const { data } = await $host.get(`/api/v1/company/${uuid}`);
  return data;
};

const createCompany = async (formData: CompanyData) => {
  const { data } = await $host.post('/api/v1/company', formData);
  return data;
};

export { getCompany, createCompany };
