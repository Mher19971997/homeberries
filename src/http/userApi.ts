import { $host, $authHost } from '@homeberris/http/index';
import { User } from '@homeberris/types/user';

const getProfile = async (token: string): Promise<User> => {
  const { data } = await $host.get('/api/v1/user/profile', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return data;
};

const uploadAvatar = async (uuid: string, formData: FormData): Promise<User> => {
  const { data } = await $authHost.patch(`/api/v1/user/${uuid}`, formData);
  return data;
};

export { getProfile, uploadAvatar };
