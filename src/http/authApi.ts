import { loginData } from '@homeberris/types/auth';
import { $host } from '@homeberris/http/index';

const login = async (formData: loginData) => {
  return await $host.post('/api/v1/auth/login', formData);
};

const register = async (formData: { email: string; password: string }) => {
  return await $host.post('/api/v1/auth/register', formData);
};

const checkContact = async (formData: { email: string }) => {
  return await $host.patch('/api/v1/auth/checkContact', { ...formData, type: 'verify-contact' });
};

const verifyContact = async (formData: { email: string; code: string }) => {
  return await $host.patch('/api/v1/auth/verifyContact', { ...formData, type: 'verify-contact' });
};

export { login, register, checkContact, verifyContact };
