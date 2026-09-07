import { SafeUser } from 'src/modules/users/types/safe-user.type';

declare global {
  namespace Express {
    interface User extends SafeUser {}
  }
}
