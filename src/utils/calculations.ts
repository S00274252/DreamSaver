export interface DepositLike {
  amount: number;
  date: Date;
}

export interface FundLike {
  type: 'static' | 'interest';
  amount: number;
  interestRate?: number | null;
  startDate?: Date | null;
  durationMonths?: number | null;
}

export interface BalanceSummary {
  depositsTotal: number;
  staticFundsTotal: number;
  interestFundsPrincipal: number;
  interestEarned: number;
  interestFundsTotal: number;
  totalBalance: number;
}

export interface DreamEstimate {
  achievable: boolean;
  currentBalance: number;
  targetAmount: number;
  remainingAmount: number;
  monthlyDeposit: number;
  monthsRemaining: number | null;
  daysRemaining: number | null;
  estimatedDate: Date | null;
}

export const MAX_ESTIMATE_MONTHS = 1200; // 100 years

export const round2 = (value: number): number => Math.round(value * 100) / 100;

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date.getTime());
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
};

export const wholeMonthsBetween = (from: Date, to: Date): number => {
  if (to.getTime() <= from.getTime()) return 0;
  let months =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth());
  if (to.getUTCDate() < from.getUTCDate()) months--;
  return Math.max(0, months);
};

export const fundValueAt = (fund: FundLike, at: Date): number => {
  if (fund.type === 'static') return fund.amount;

  const rate = (fund.interestRate ?? 0) / 100 / 12;
  const duration = fund.durationMonths ?? 0;
  const start = fund.startDate ?? at;
  const months = Math.min(wholeMonthsBetween(start, at), duration);

  return fund.amount * Math.pow(1 + rate, months);
};

export const depositsTotalAt = (deposits: DepositLike[], at: Date): number =>
  deposits.filter((d) => d.date.getTime() <= at.getTime()).reduce((sum, d) => sum + d.amount, 0);

export const calculateBalance = (deposits: DepositLike[], funds: FundLike[], at: Date): BalanceSummary => {
  const depositsTotal = depositsTotalAt(deposits, at);

  const staticFundsTotal = funds
    .filter((f) => f.type === 'static')
    .reduce((sum, f) => sum + f.amount, 0);

  const interestFunds = funds.filter((f) => f.type === 'interest');
  const interestFundsPrincipal = interestFunds.reduce((sum, f) => sum + f.amount, 0);
  const interestFundsTotal = interestFunds.reduce((sum, f) => sum + fundValueAt(f, at), 0);
  const interestEarned = interestFundsTotal - interestFundsPrincipal;

  return {
    depositsTotal: round2(depositsTotal),
    staticFundsTotal: round2(staticFundsTotal),
    interestFundsPrincipal: round2(interestFundsPrincipal),
    interestEarned: round2(interestEarned),
    interestFundsTotal: round2(interestFundsTotal),
    totalBalance: round2(depositsTotal + staticFundsTotal + interestFundsTotal),
  };
};

export const averageMonthlyDeposit = (deposits: DepositLike[], now: Date): number => {
  const past = deposits.filter((d) => d.date.getTime() <= now.getTime());
  if (past.length === 0) return 0;

  const first = new Date(Math.min(...past.map((d) => d.date.getTime())));
  const months =
    (now.getUTCFullYear() - first.getUTCFullYear()) * 12 + (now.getUTCMonth() - first.getUTCMonth()) + 1;
  const total = past.reduce((sum, d) => sum + d.amount, 0);

  return round2(total / Math.max(1, months));
};

export const predictBalance = (
  deposits: DepositLike[],
  funds: FundLike[],
  target: Date,
  now: Date,
  monthlyDeposit: number
): number => {
  const monthsAhead = wholeMonthsBetween(now, target);
  const depositsNow = depositsTotalAt(deposits, now);
  const fundsAtTarget = funds.reduce((sum, f) => sum + fundValueAt(f, target), 0);

  return round2(depositsNow + monthlyDeposit * monthsAhead + fundsAtTarget);
};

export const estimateDream = (
  deposits: DepositLike[],
  funds: FundLike[],
  targetAmount: number,
  now: Date,
  monthlyDeposit: number
): DreamEstimate => {
  const currentBalance = calculateBalance(deposits, funds, now).totalBalance;

  const base = {
    currentBalance,
    targetAmount,
    remainingAmount: round2(Math.max(0, targetAmount - currentBalance)),
    monthlyDeposit,
  };

  if (currentBalance >= targetAmount) {
    return { ...base, achievable: true, monthsRemaining: 0, daysRemaining: 0, estimatedDate: now };
  }

  for (let month = 1; month <= MAX_ESTIMATE_MONTHS; month++) {
    const date = addMonths(now, month);
    if (predictBalance(deposits, funds, date, now, monthlyDeposit) >= targetAmount) {
      const daysRemaining = Math.ceil((date.getTime() - now.getTime()) / 86_400_000);
      return { ...base, achievable: true, monthsRemaining: month, daysRemaining, estimatedDate: date };
    }
  }

  return { ...base, achievable: false, monthsRemaining: null, daysRemaining: null, estimatedDate: null };
};
