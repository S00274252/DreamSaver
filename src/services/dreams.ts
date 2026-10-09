import { HydratedDocument } from 'mongoose';
import { DreamModel, IDream } from '../models/dreams';

export interface CreateDreamData {
  userId: string;
  title: string;
  targetAmount: number;
}

export class DreamService {
  async getAllDreams(userId?: string): Promise<IDream[]> {
    const filter = userId ? { userId } : {};
    return await DreamModel.find(filter).lean();
  }

  async getDreamById(id: string): Promise<IDream | null> {
    return await DreamModel.findById(id).lean();
  }

  async createDream(data: CreateDreamData): Promise<HydratedDocument<IDream>> {
    const dream = new DreamModel(data);
    return await dream.save();
  }

  async updateDream(
    id: string,
    data: { title?: string | undefined; targetAmount?: number | undefined; achieved?: boolean | undefined }
  ): Promise<IDream | null> {
    return await DreamModel.findByIdAndUpdate(id, data, {
      returnDocument: 'after',
      runValidators: true,
    }).lean();
  }

  async deleteDream(id: string): Promise<IDream | null> {
    return await DreamModel.findByIdAndDelete(id).lean();
  }
}
