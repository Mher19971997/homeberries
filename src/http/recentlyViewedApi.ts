import { $host } from '@homeberris/http/index';
import { ListResult } from '@homeberris/types/filter';
import { RecentlyViewedDataItem } from '@homeberris/types/recentlyViewed';

const authHeader = (token: string) =>
    token ? { Authorization: `Bearer ${token}` } : {};

const getAllRecentlyViewed = async (
    query: any,
    token: string
): Promise<{ data: RecentlyViewedDataItem[]; meta: ListResult }> => {
    const { data } = await $host.get(`/api/v1/recently-viewed?${query}`, {
        headers: authHeader(token)
    });
    return data;
};

const trackRecentlyViewed = async (
    inputDto: { catalogUuid: string },
    token: string
): Promise<RecentlyViewedDataItem> => {
    const { data } = await $host.post(`/api/v1/recently-viewed`, inputDto, {
        headers: authHeader(token)
    });
    return data;
};

const removeRecentlyViewed = async (
    uuid: string,
    token: string
): Promise<RecentlyViewedDataItem> => {
    const { data } = await $host.delete(`/api/v1/recently-viewed/${uuid}`, {
        headers: authHeader(token)
    });
    return data;
};

export { getAllRecentlyViewed, trackRecentlyViewed, removeRecentlyViewed };