import { useLocalizedRouter as useRouter } from '@homeberris/hooks/useLocalizedRouter';
import { checkToken } from '@homeberris/utils/auth';
import { useIsMobile } from '@homeberris/hooks/useIsMobile';
import { getMenuTree } from '@homeberris/http/categoryApi';
import { useQuery } from '@tanstack/react-query';
import { CategoryItem } from '@homeberris/types/catalog';
import {  useState } from 'react';
import { getCarMenu } from '@homeberris/http/carApi';

export const useMobileSearch = () => {
    const router = useRouter();
    const isAuth = checkToken();
    const isMobile = useIsMobile();
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

    const { data: menuTree, isLoading: isLoadingCategories } = useQuery({ queryKey: ['getMenuTree'], queryFn: getMenuTree });
    const { data: brands, isLoading: isLoadingCarBrand } = useQuery({ queryKey: ['getCarMenu'], queryFn: getCarMenu });

    const handleCategoryClick = (category: CategoryItem) => {
        router.push(`/catalog/${category.name}`);
        setHoveredCategory(null);
        // onCloseMenu?.();
    };
    return {
        router,
        isAuth,
        isMobile,
        categories: menuTree || [],
        car_brands: brands || [],
        isLoadingCategories,
        isLoadingCarBrand,
        hoveredCategory,
        setHoveredCategory,
        handleCategoryClick
    };
};
