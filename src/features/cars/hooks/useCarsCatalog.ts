import { useQuery } from '@tanstack/react-query';
import {
    getCars,
    getCarMenu,
    CarMenuBrand,
    Car,
} from '@homeberris/http/carApi';
import { checkToken } from '@homeberris/utils/auth';

export const useCarsCatalog = (brandId?: string, modelId?: string, subModelId?: string) => {
    const isAuth = checkToken();

    const { data: carMenu } = useQuery<CarMenuBrand[]>({
        queryKey: ['getCarMenu'],
        queryFn: getCarMenu,
    });

    const { data: carsData, isLoading } = useQuery({
        queryKey: ['getCars', brandId, modelId, subModelId],
        queryFn: () =>
            getCars({
                brand_id: brandId,
                model_id: modelId,
                sub_model_id: subModelId,
                is_available: true,
            }),
    });

    const cars: Car[] = (carsData as any)?.data || [];

    const currentBrand = carMenu?.find((b) => b.uuid === brandId);
    const currentModel = currentBrand?.models.find(
        (m) => m.uuid === modelId
    );

    return {
        brandId,
        modelId,
        subModelId,
        isAuth,
        carMenu,
        cars,
        isLoading,
        currentBrand,
        currentModel,
    };
};
