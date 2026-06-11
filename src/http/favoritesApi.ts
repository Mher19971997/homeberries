import { $host } from '@homeberris/http/index';
import { ListResult } from '@homeberris/types/filter';

const authHeader = (token: string) =>
    token ? { Authorization: `Bearer ${token}` } : {};

const getAllFavorites = async (
    query: any,
    token: string
): Promise<{ data: any[]; meta: ListResult }> => {
    const { data } = await $host.get(`/api/v1/favorites?${query}`, {
        headers: authHeader(token)
    });
    return data;
};

const toggleFavorite = async (
    catalogUuid: string,
    token: string
): Promise<{ added: boolean; item: any }> => {
    const { data } = await $host.post(`/api/v1/favorites`, { catalogUuid }, {
        headers: authHeader(token)
    });
    return data;
};

const checkFavorite = async (
    catalogUuid: string,
    token: string
): Promise<{ isFavorite: boolean }> => {
    const { data } = await $host.get(`/api/v1/favorites/check/${catalogUuid}`, {
        headers: authHeader(token)
    });
    return data;
};

export { getAllFavorites, toggleFavorite, checkFavorite };