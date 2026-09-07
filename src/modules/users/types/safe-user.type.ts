import { User } from 'generated/prisma/client';

export type SafeUser = Pick<User, 'id' | 'email' | 'role'>;
