import { $authHost } from '@homeberris/http/index';

export interface CreatePaymentIntentRequest {
  amount: number; // сумма в копейках
  currency?: string;
  orderUuid?: string;
  basketUuids?: string[];
  description?: string;
  promocode?: string
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  paymentMethodId?: string;
}

export interface PaymentResultResponse {
  success: boolean;
  paymentIntentId?: string;
  message?: string;
  orderUuid?: string;
}

const createPaymentIntent = async (
  inputDto: CreatePaymentIntentRequest
): Promise<PaymentIntentResponse> => {
  const { data } = await $authHost.post('/api/v1/payment/create-intent', inputDto);
  return data;
};

const confirmPayment = async (
  inputDto: ConfirmPaymentRequest,
  orderUuid?: string
): Promise<PaymentResultResponse> => {
  // orderUuid не обязателен, так как заказ создается после успешного платежа
  const queryString = orderUuid ? `?orderUuid=${orderUuid}` : '';
  const { data } = await $authHost.post(`/api/v1/payment/confirm${queryString}`, inputDto);
  return data;
};

const getPaymentIntent = async (paymentIntentId: string): Promise<any> => {
  const { data } = await $authHost.get(`/api/v1/payment/intent/${paymentIntentId}`);
  return data;
};

export { createPaymentIntent, confirmPayment, getPaymentIntent };
