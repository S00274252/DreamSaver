import { Schema, Types, model } from 'mongoose';
import { z } from 'zod';
import { objectIdZ } from './common';

/**
 * @openapi
 * components:
 *   schemas:
 *     Dream:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         title:
 *           type: string
 *           example: New car
 *         targetAmount:
 *           type: number
 *           example: 15000
 *         achieved:
 *           type: boolean
 *     CreateDreamInput:
 *       type: object
 *       required:
 *         - userId
 *         - title
 *         - targetAmount
 *       properties:
 *         userId:
 *           type: string
 *           example: 665f1c2e8a1b2c3d4e5f6a7b
 *         title:
 *           type: string
 *           example: New car
 *         targetAmount:
 *           type: number
 *           example: 15000
 *     UpdateDreamInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         targetAmount:
 *           type: number
 *         achieved:
 *           type: boolean
 *     DreamEstimate:
 *       type: object
 *       properties:
 *         achievable:
 *           type: boolean
 *         currentBalance:
 *           type: number
 *         targetAmount:
 *           type: number
 *         remainingAmount:
 *           type: number
 *         monthlyDeposit:
 *           type: number
 *         monthsRemaining:
 *           type: integer
 *           nullable: true
 *         daysRemaining:
 *           type: integer
 *           nullable: true
 *         estimatedDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 */
export const createDreamZSchema = z.object({
  userId: objectIdZ,
  title: z.string().trim().min(1),
  targetAmount: z.number().positive(),
});

export const updateDreamZSchema = z.object({
  title: z.string().trim().min(1).optional(),
  targetAmount: z.number().positive().optional(),
  achieved: z.boolean().optional(),
});

export interface IDream {
  userId: Types.ObjectId;
  title: string;
  targetAmount: number;
  achieved: boolean;
}

const dreamSchema = new Schema<IDream>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    targetAmount: { type: Number, required: true, min: 0.01 },
    achieved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const DreamModel = model<IDream>('Dream', dreamSchema);