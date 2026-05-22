import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import {
    getCars,
    getCarMenu,
    CarMenuBrand,
    Car,
} from '@homeberris/http/carApi';
import { checkToken } from '@homeberris/utils/auth';

export const useCarsCatalog = () => {
    const router = useRouter();
    const { brand, model, subModel } = router.query;

    const brandId = typeof brand === 'string' ? brand : undefined;
    const modelId = typeof model === 'string' ? model : undefined;
    const subModelId = typeof subModel === 'string' ? subModel : undefined;

    const isAuth = checkToken();

    const { data: carMenu } = useQuery<CarMenuBrand[]>(
        'getCarMenu',
        getCarMenu
    );

    const { data: carsData, isLoading } = useQuery(
        ['getCars', brandId, modelId, subModelId],
        () =>
            getCars({
                brand_id: brandId,
                model_id: modelId,
                sub_model_id: subModelId,
                is_available: true,
            }),
        { enabled: router.isReady }
    );

    const cars: Car[] = carsData?.data || [];

    const currentBrand = carMenu?.find((b) => b.uuid === brandId);
    const currentModel = currentBrand?.models.find(
        (m) => m.uuid === modelId
    );

    return {
        router,
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
