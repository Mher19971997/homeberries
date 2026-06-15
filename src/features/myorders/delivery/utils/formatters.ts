import { OrderItem } from "@homeberris/http/orderApi";
import EmtpImg from '@homeberris/assets/cardEmpty.png';

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

const getStatusLabel = (status: string, t?: (key: string) => string) => {
    const tr = (key: string, fallback: string) => t ? t(`delivery.status.${key}`) : fallback;
    switch (status?.toLowerCase()) {
        case 'delivered':
        case 'completed':
            return tr('delivered', 'Delivered');
        case 'cancelled':
        case 'canceled':
            return tr('cancelled', 'Cancelled');
        case 'processing':
        case 'in_progress':
            return tr('processing', 'Processing');
        case 'shipped':
            return tr('shipped', 'Shipped');
        case 'pending':
            return tr('pending', 'Pending');
        case 'paid':
            return tr('paid', 'Paid');
        default:
            return status || tr('unknown', 'Unknown');
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