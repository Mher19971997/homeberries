import { $host } from '@homeberris/http/index';
import { User } from '@homeberris/types/user';

const getProfile = async (token: string): Promise<User> => {
  const { data } = await $host.get('/api/v1/user/profile', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return data;
};

export { getProfile };
