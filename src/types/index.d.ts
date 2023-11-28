import { UserOutput } from '../users/users.dto';

declare global {
  namespace Express {
    export interface User extends UserOutput {}
  }
}
