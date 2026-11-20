import { z } from 'zod';
import { objectIdZ } from './common';

export const balanceQueryZSchema = z.object({
  userId: objectIdZ,
});

export const predictionQueryZSchema = z.object({
  userId: objectIdZ,
  date: z.coerce.date(),
  monthlyDeposit: z.coerce.number().min(0).optional(),
});

export type BalanceQuery = z.infer<typeof balanceQueryZSchema>;
export type PredictionQuery = z.infer<typeof predictionQueryZSchema>;