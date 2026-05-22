import { UUID } from 'crypto';

export interface BasketDataItem {
  catalogUuid?: UUID;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  quantity?: number;
  userUuid?: UUID;
  uuid?: UUID;
  catalog: any;
}
