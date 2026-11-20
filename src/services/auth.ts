import jwt from 'jsonwebtoken';
import { mongo } from 'mongoose';
import { env } from '../config/env';
import { UserModel } from '../models/users';
import { hashPassword, verifyPassword } from '../utils/password';
import { UnauthorizedError, UserAlreadyExistsError } from '../utils/errors';

export interface TokenPayload {
  sub: string; 
  email: string;
}

export interface PublicUser {
  _id: string;
  name: string;
  email: string;
}

export class AuthService {
  async register(name: string, email: string, password: string): Promise<PublicUser> {
    const passwordHash = await hashPassword(password);
    try {
      const user = await UserModel.create({ name, email, passwordHash });
      return { _id: user._id.toString(), name: user.name, email: user.email };
    } catch (error) {
      if (error instanceof mongo.MongoServerError && error.code === 11000) {
        throw new UserAlreadyExistsError();
      }
      throw error;
    }
  }

  createToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.jwtSecret, {
      algorithm: 'HS256',
      expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  verifyToken(token: string): TokenPayload {
    return jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] }) as TokenPayload;
  }

  async login(email: string, password: string): Promise<string> {
    const user = await UserModel.findOne({ email }).select('+passwordHash');
    if (!user) throw new UnauthorizedError('Invalid email or password');

    if (!(await verifyPassword(password, user.passwordHash))) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return this.createToken({ sub: user._id.toString(), email: user.email });
  }

  async getUserById(id: string): Promise<PublicUser> {
    const user = await UserModel.findById(id).lean();
    if (!user) throw new UnauthorizedError('User not found');
    return { _id: user._id.toString(), name: user.name, email: user.email };
  }
}