import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import {
    getCarByUuid,
    getCarStatistics,
    getSimilarCars,
    Car,
} from '@homeberris/http/carApi';

export const useCarDetail = () => {
    const router = useRouter();
    const { uuid } = router.query;

    const carUuid = typeof uuid === 'string' ? uuid : '';

    const { data: car, isLoading } = useQuery<Car>(
        ['getCar', carUuid],
        () => getCarByUuid(carUuid),
        {
            enabled: !!carUuid && router.isReady,
        }
    );

    const { data: statistics } = useQuery(
        ['carStatistics', carUuid],
        () => getCarStatistics(carUuid),
        {
            enabled: !!car && !!carUuid,
        }
    );

    const { data: similarCars } = useQuery(
        ['similarCars', carUuid],
        () => getSimilarCars(carUuid, 6),
        {
            enabled: !!car && !!carUuid,
        }
    );

    return {
        car,
        statistics,
        similarCars,
        isLoading,
        router,
    };
};
