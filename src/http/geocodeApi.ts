import { $host } from '@homeberris/http/index';

const getReverseGeocode = async (lat: string, lng: string, lang: string): Promise<{ address: string | null }> => {
  const { data } = await $host.get('/api/v1/geocode/reverse', {
    params: { lat, lng, lang },
  });
  return data;
};

export { getReverseGeocode };
