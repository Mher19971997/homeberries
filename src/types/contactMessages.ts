export interface ContactMessageDataItem {
  uuid: string;
  name: string;
  surname: string;
  phone?: string;
  email: string;
  message: string;
  userUuid?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactMessageInput {
  name: string;
  surname: string;
  phone?: string;
  email: string;
  message: string;
}