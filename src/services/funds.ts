import { HydratedDocument } from 'mongoose';
import { FundModel, IFund } from '../models/funds';

export interface CreateFundData {
  userId: string;
  name: string;
  type: IFund['type'];
  amount: number;
  interestRate?: number | undefined;
  startDate?: Date | undefined;
  durationMonths?: number | undefined;
}

export class FundService {
  async getAllFunds(userId?: string): Promise<IFund[]> {
    const filter = userId ? { userId } : {};
    return await FundModel.find(filter).lean();
  }

  async getFundById(id: string): Promise<IFund | null> {
    return await FundModel.findById(id).lean();
  }

  async createFund(data: CreateFundData): Promise<HydratedDocument<IFund>> {
    const fund = new FundModel(data);
    return await fund.save();
  }

  async updateFund(id: string, data: Partial<Omit<CreateFundData, 'userId'>>): Promise<IFund | null> {
    return await FundModel.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
      runValidators: true,
    }).lean();
  }

  async deleteFund(id: string): Promise<IFund | null> {
    return await FundModel.findByIdAndDelete(id).lean();
  }
}
