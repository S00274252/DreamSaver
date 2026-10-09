import { Schema, Types, model } from 'mongoose';
import { z } from 'zod';
import { objectIdZ } from './common';


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