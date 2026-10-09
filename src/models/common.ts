import { z } from 'zod';

export const objectIdRegex = /^[a-f\d]{24}$/i;

export const objectIdZ = z.string().regex(objectIdRegex, 'Invalid ObjectId');