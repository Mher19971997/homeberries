import { OrderItem } from "@homeberris/http/orderApi";
import EmtpImg from 'public/images/cardEmpty.png';

const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'delivered':
        case 'completed':
            return 'success';
        case 'cancelled':
        case 'canceled':
            return 'error';
        case 'processing':
        case 'in_progress':
        case 'pending':
            return 'warning';
        case 'shipped':
            return 'info';
        case 'paid':
            return 'success';
        default:
            return 'default';
    }
};

const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'delivered':
        case 'completed':
            return 'Доставлен';
        case 'cancelled':
        case 'canceled':
            return 'Отменен';
        case 'processing':
        case 'in_progress':
            return 'В обработке';
        case 'shipped':
            return 'Отправлен';
        case 'pending':
            return 'Ожидает';
        case 'paid':
            return 'Оплачено';
        default:
            return status || 'Неизвестно';
    }
};


const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
};

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(price);
};

const getProductImage = (order: OrderItem) => {
    if (order.catalog?.images && order.catalog.images.length > 0) {
        const imagePath = order.catalog.images[0].image;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
        return baseUrl + (imagePath.startsWith('/') ? imagePath : '/' + imagePath);
    }
    return EmtpImg.src;
};

export { getStatusColor, getStatusLabel, formatDate, formatPrice, getProductImage }