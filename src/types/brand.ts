import { UUID } from 'crypto';

/**
 * Интерфейс бренда
 */
export interface BrandItem {
  uuid: UUID;
  name: string;
  logo?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
