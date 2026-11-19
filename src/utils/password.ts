import { randomBytes, scrypt, timingSafeEqual } from 'crypto';

const KEY_LENGTH = 64;

const scryptAsync = (password: string, salt: string, keyLength: number): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scryptAsync(password, salt, KEY_LENGTH)).toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = await scryptAsync(password, salt, KEY_LENGTH);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};