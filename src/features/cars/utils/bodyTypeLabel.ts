export const getBodyTypeLabel = (type?: string) => {
    if (!type) return '';

    const bodyTypes: Record<string, string> = {
        sedan: 'Седан',
        hatchback: 'Хэтчбек',
        wagon: 'Универсал',
        coupe: 'Купе',
        suv: 'Внедорожник',
        crossover: 'Кроссовер',
        minivan: 'Минивэн',
        pickup: 'Пикап',
        convertible: 'Кабриолет',
    };

    return bodyTypes[type.toLowerCase()] || type;
};
