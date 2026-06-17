import { $host } from '@homeberris/http/index';
import {
  ContactMessageDataItem,
  CreateContactMessageInput
} from '@homeberris/types/contactMessages';

const authHeader = (token?: string) =>
  token ? { Authorization: `Bearer ${token}` } : {};

const insertContactMessage = async (
  inputDto: CreateContactMessageInput,
  token?: string
): Promise<ContactMessageDataItem> => {
  const { data } = await $host.post(`/api/v1/contact-messages`, inputDto, {
    headers: authHeader(token)
  });
  return data;
};

export { insertContactMessage };