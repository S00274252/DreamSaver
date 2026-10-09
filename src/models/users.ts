import { Schema, model } from 'mongoose';
import { z } from 'zod';

export const createUserZSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email().toLowerCase(),
  password: z.string().min(8),
});

export const updateUserZSchema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.email().toLowerCase().optional(),
  password: z.string().min(8).optional(),
});

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date; 
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

export const UserModel = model<IUser>('User', userSchema);