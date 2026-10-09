import { Schema, Types, model } from 'mongoose';
import { z } from 'zod';
import { objectIdZ } from './common';

export const createDepositZSchema = z.object({
  userId: objectIdZ,
  amount: z.number().positive(),
  date: z.coerce.date().default(() => new Date()),
  note: z.string().max(200).optional(),
});

export const updateDepositZSchema = z.object({
  amount: z.number().positive().optional(),
  date: z.coerce.date().optional(),
  note: z.string().max(200).optional(),
});

export interface IDeposit {
  userId: Types.ObjectId;
  amount: number;
  date: Date;
  note?: string;
}

const depositSchema = new Schema<IDeposit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    date: { type: Date, required: true, default: Date.now },
    note: { type: String, maxlength: 200 },
  },
  { timestamps: true }
);

export const DepositModel = model<IDeposit>('Deposit', depositSchema);