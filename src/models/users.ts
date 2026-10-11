import { Schema, model } from 'mongoose';
import { z } from 'zod';

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 665f1c2e8a1b2c3d4e5f6a7b
 *         name:
 *           type: string
 *           example: Roman
 *         email:
 *           type: string
 *           example: roman@example.com
 *         role:
 *           type: string
 *           enum: [user, admin]
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CreateUserInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           example: Roman
 *         email:
 *           type: string
 *           example: roman@example.com
 *         password:
 *           type: string
 *           minLength: 8
 *           example: supersecret123
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           default: user
 *     UpdateUserInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *           minLength: 8
 *         role:
 *           type: string
 *           enum: [user, admin]
 */
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