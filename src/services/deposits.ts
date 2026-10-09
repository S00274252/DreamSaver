import { HydratedDocument } from 'mongoose';
import { DepositModel, IDeposit } from '../models/deposits';

export interface CreateDepositData {
  userId: string;
  amount: number;
  date: Date;
  note?: string | undefined;
}

export class DepositService {
  async getAllDeposits(userId?: string): Promise<IDeposit[]> {
    const filter = userId ? { userId } : {};
    return await DepositModel.find(filter).sort({ date: -1 }).lean();
  }

  async getDepositById(id: string): Promise<IDeposit | null> {
    return await DepositModel.findById(id).lean();
  }

  async createDeposit(data: CreateDepositData): Promise<HydratedDocument<IDeposit>> {
    const deposit = new DepositModel(data);
    return await deposit.save();
  }

  async updateDeposit(id: string, data: Partial<Omit<CreateDepositData, 'userId'>>): Promise<IDeposit | null> {
    return await DepositModel.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
      runValidators: true,
    }).lean();
  }

  async deleteDeposit(id: string): Promise<IDeposit | null> {
    return await DepositModel.findByIdAndDelete(id).lean();
  }
}