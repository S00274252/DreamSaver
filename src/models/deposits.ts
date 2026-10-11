import { Schema, Types, model } from 'mongoose';
import { z } from 'zod';
import { objectIdZ } from './common';

/**
 * @openapi
 * components:
 *   schemas:
 *     Deposit:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         amount:
 *           type: number
 *           example: 250
 *         date:
 *           type: string
 *           format: date-time
 *         note:
 *           type: string
 *           example: January savings
 *     CreateDepositInput:
 *       type: object
 *       required:
 *         - userId
 *         - amount
 *       properties:
 *         userId:
 *           type: string
 *           example: 665f1c2e8a1b2c3d4e5f6a7b
 *         amount:
 *           type: number
 *           example: 250
 *         date:
 *           type: string
 *           format: date
 *           example: 2026-01-31
 *           description: Defaults to the current date
 *         note:
 *           type: string
 *           example: January savings
 *     UpdateDepositInput:
 *       type: object
 *       properties:
 *         amount:
 *           type: number
 *         date:
 *           type: string
 *           format: date
 *         note:
 *           type: string
 */
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