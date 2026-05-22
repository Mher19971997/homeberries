import { loginData } from '@homeberris/types/auth';
import { $host } from '@homeberris/http/index';

const login = async (formData: loginData) => {
  return await $host.post('/api/v1/auth/login', formData);
};

export { login };
