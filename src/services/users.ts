import { HydratedDocument } from 'mongoose';
import { UserModel, IUser } from '../models/users';
import { DepositModel } from '../models/deposits';
import { FundModel } from '../models/funds';
import { DreamModel } from '../models/dreams';
import { hashPassword } from '../utils/password';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
}

export class UserService {
  async getAllUsers(): Promise<IUser[]> {
    return await UserModel.find().lean();
  }

  async getUserById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id).lean();
  }

  async userExists(id: string): Promise<boolean> {
    return (await UserModel.exists({ _id: id })) !== null;
  }

  async createUser(data: CreateUserData): Promise<HydratedDocument<IUser>> {
    const { password, ...rest } = data;
    const user = new UserModel({ ...rest, passwordHash: hashPassword(password) });
    return await user.save();
  }

  async updateUser(id: string, data: UpdateUserData): Promise<IUser | null> {
    const { password, ...rest } = data;
    const update: Partial<IUser> = { ...rest };
    if (password) update.passwordHash = hashPassword(password);

    return await UserModel.findByIdAndUpdate(id, update, {
      returnDocument: 'after',
      runValidators: true,
    }).lean();
  }

  async deleteUser(id: string): Promise<IUser | null> {
    const user = await UserModel.findByIdAndDelete(id).lean();
    if (user) {
      await Promise.all([
        DepositModel.deleteMany({ userId: id }),
        FundModel.deleteMany({ userId: id }),
        DreamModel.deleteMany({ userId: id }),
      ]);
    }
    return user;
  }
}
