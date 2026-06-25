import { $host } from '@homeberris/http/index';
import { ListResult } from '@homeberris/types/filter';

export interface PromocodeUsageDataItem {
    uuid: string;
    promocodeUuid: string;
    userUuid: string;
    usedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface ValidatePromocodeResult {
    valid: boolean;
    reason?: string;
    discountPercent?: number;
}

const authHeader = (token: string) =>
    token ? { Authorization: `Bearer ${token}` } : {};

const getAllPromocodeUsages = async (
    query: any,
    token: string
): Promise<{ data: PromocodeUsageDataItem[]; meta: ListResult }> => {
    const { data } = await $host.get(`/api/v1/promocode/usage?${query}`, {
        headers: authHeader(token)
    });
    return data;
};

const validatePromocode = async (
    code: string,
    token: string
): Promise<ValidatePromocodeResult> => {
    const { data } = await $host.get(`/api/v1/promocode/validate`, {
        params: { code },
        headers: authHeader(token),
    });
    return data;
};

export { getAllPromocodeUsages, validatePromocode };