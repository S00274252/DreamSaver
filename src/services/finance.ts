import { DepositModel } from '../models/deposits';
import { FundModel } from '../models/funds';
import {
  BalanceSummary,
  DreamEstimate,
  averageMonthlyDeposit,
  calculateBalance,
  estimateDream,
  predictBalance,
  round2,
} from '../utils/calculations';

export interface BalanceResult extends BalanceSummary {
  asOf: Date;
}

export interface PredictionResult {
  asOf: Date;
  predictionDate: Date;
  monthlyDeposit: number;
  currentBalance: number;
  predictedBalance: number;
  expectedGrowth: number;
}

export class FinanceService {
  private async loadData(userId: string) {
    const [deposits, funds] = await Promise.all([
      DepositModel.find({ userId }).lean(),
      FundModel.find({ userId }).lean(),
    ]);
    return { deposits, funds };
  }

  async getBalance(userId: string, now: Date = new Date()): Promise<BalanceResult> {
    const { deposits, funds } = await this.loadData(userId);
    return { asOf: now, ...calculateBalance(deposits, funds, now) };
  }

  async getPrediction(
    userId: string,
    predictionDate: Date,
    monthlyDepositOverride?: number,
    now: Date = new Date()
  ): Promise<PredictionResult> {
    const { deposits, funds } = await this.loadData(userId);
    const monthlyDeposit = monthlyDepositOverride ?? averageMonthlyDeposit(deposits, now);
    const currentBalance = calculateBalance(deposits, funds, now).totalBalance;
    const predictedBalance = predictBalance(deposits, funds, predictionDate, now, monthlyDeposit);

    return {
      asOf: now,
      predictionDate,
      monthlyDeposit,
      currentBalance,
      predictedBalance,
      expectedGrowth: round2(predictedBalance - currentBalance),
    };
  }

  async getDreamEstimate(
    userId: string,
    targetAmount: number,
    monthlyDepositOverride?: number,
    now: Date = new Date()
  ): Promise<DreamEstimate> {
    const { deposits, funds } = await this.loadData(userId);
    const monthlyDeposit = monthlyDepositOverride ?? averageMonthlyDeposit(deposits, now);
    return estimateDream(deposits, funds, targetAmount, now, monthlyDeposit);
  }
}
