import { UUID } from 'crypto';

export interface User {
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  uuid: UUID;
  email: string;
  roles: string[];
  userId: number;
  avatar?: string;
}
