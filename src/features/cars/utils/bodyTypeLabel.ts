export const getBodyTypeLabel = (type?: string, t?: (key: string) => string) => {
    if (!type) return '';

    const key = `cars.bodyType.${type.toLowerCase()}`;
    if (t) {
        const translated = t(key);
        // If t returns the key itself (not found), fall back to type
        return translated !== key ? translated : type;
    }

    const bodyTypes: Record<string, string> = {
        sedan: 'Sedan',
        hatchback: 'Hatchback',
        wagon: 'Wagon',
        coupe: 'Coupe',
        suv: 'SUV',
        crossover: 'Crossover',
        minivan: 'Minivan',
        pickup: 'Pickup',
        convertible: 'Convertible',
    };

    return bodyTypes[type.toLowerCase()] || type;
};
