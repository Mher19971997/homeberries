import { $authHost } from "@homeberris/http/index";
import { ListResult } from "@homeberris/types/filter";
import * as qs from "qs";

export interface OrderItem {
  uuid: string;
  order_N?: number;
  price: number;
  quantity: number;
  status: string;
  type?: string;
  catalogUuid: string;
  userUuid: string;
  createdAt: string;
  updatedAt: string;
  catalog?: {
    uuid: string;
    name: string;
    description: string;
    price: number;
    category?: {
      name: string;
    };
    images?: Array<{ image: string }>;
  };
  user?: {
    uuid: string;
    email: string;
  };
  deliveryAddress?: {
    uuid: string;
    address: string;
    lat?: string;
    lng?: string;
    tag?: string;
  };
}

export interface OrdersResponse {
  data: OrderItem[];
  meta: ListResult;
}

const getAllOrders = async (
  query?: string,
  token?: string,
): Promise<OrdersResponse> => {
  const queryString = query || qs.stringify({ queryMeta: { paginate: true } });
  const { data } = await $authHost.get(`/api/v1/order?${queryString}`);
  return data;
};

const getOrderByUuid = async (uuid: string): Promise<OrderItem> => {
  const { data } = await $authHost.get(`/api/v1/order/${uuid}`);
  return data;
};

const createOrder = async (inputDto: any): Promise<OrderItem> => {
  const { data } = await $authHost.post("/api/v1/order", inputDto);
  return data;
};

const updateOrder = async (uuid: string, inputDto: any): Promise<OrderItem> => {
  const { data } = await $authHost.patch(`/api/v1/order/${uuid}`, inputDto);
  return data;
};

const deleteOrder = async (uuid: string): Promise<void> => {
  await $authHost.delete(`/api/v1/order/${uuid}`);
};

export { getAllOrders, getOrderByUuid, createOrder, updateOrder, deleteOrder };
