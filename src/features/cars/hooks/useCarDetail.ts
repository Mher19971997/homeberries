import { useQuery } from '@tanstack/react-query';
import {
    getCarByUuid,
    getCarStatistics,
    getSimilarCars,
    Car,
} from '@homeberris/http/carApi';

export const useCarDetail = (carUuid: string) => {
    const { data: car, isLoading } = useQuery<Car>({
        queryKey: ['getCar', carUuid],
        queryFn: () => getCarByUuid(carUuid),
        enabled: !!carUuid,
    });

    const { data: statistics } = useQuery({
        queryKey: ['carStatistics', carUuid],
        queryFn: () => getCarStatistics(carUuid),
        enabled: !!car && !!carUuid,
    });

    const { data: similarCars } = useQuery({
        queryKey: ['similarCars', carUuid],
        queryFn: () => getSimilarCars(carUuid, 6),
        enabled: !!car && !!carUuid,
    });

    return {
        car,
        statistics,
        similarCars,
        isLoading,
    };
};
