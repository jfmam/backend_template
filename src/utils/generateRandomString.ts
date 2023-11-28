import { randomBytes } from 'crypto';

export function generateRandomId(): string {
  return randomBytes(10).toString('hex');
}
