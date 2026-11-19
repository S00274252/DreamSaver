import { z } from 'zod';

export const objectIdRegex = /^[a-f\d]{24}$/i;

export const objectIdZ = z.string().regex(objectIdRegex, 'Invalid ObjectId');

export const idParamsZSchema = z.object({ id: objectIdZ });

export const userIdQueryZSchema = z.object({ userId: objectIdZ.optional() });