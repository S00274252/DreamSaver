import { Schema, Types, model } from 'mongoose';
import { z } from 'zod';
import { objectIdZ } from './common';


export const FUND_TYPES = ['static', 'interest'] as const;

export const createFundZSchema = z
  .object({
    userId: objectIdZ,
    name: z.string().trim().min(1),
    type: z.enum(FUND_TYPES),
    amount: z.number().positive(),
    interestRate: z.number().min(0).max(100).optional(),
    startDate: z.coerce.date().optional(),
    durationMonths: z.number().int().positive().optional(),
  })
  .refine(
    (fund) =>
      fund.type === 'static' ||
      (fund.interestRate !== undefined && fund.startDate !== undefined && fund.durationMonths !== undefined),
    { message: 'Interest funds require interestRate, startDate and durationMonths' }
  );

export const updateFundZSchema = z.object({
  name: z.string().trim().min(1).optional(),
  type: z.enum(FUND_TYPES).optional(),
  amount: z.number().positive().optional(),
  interestRate: z.number().min(0).max(100).optional(),
  startDate: z.coerce.date().optional(),
  durationMonths: z.number().int().positive().optional(),
});

export interface IFund {
  userId: Types.ObjectId;
  name: string;
  type: (typeof FUND_TYPES)[number];
  amount: number;
  interestRate?: number;
  startDate?: Date;
  durationMonths?: number;
}

const fundSchema = new Schema<IFund>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: FUND_TYPES, required: true },
    amount: { type: Number, required: true, min: 0.01 },
    interestRate: { type: Number, min: 0, max: 100 },
    startDate: { type: Date },
    durationMonths: { type: Number, min: 1 },
  },
  { timestamps: true }
);

export const FundModel = model<IFund>('Fund', fundSchema);
