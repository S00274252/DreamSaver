import {
  addMonths,
  averageMonthlyDeposit,
  calculateBalance,
  estimateDream,
  fundValueAt,
  predictBalance,
  wholeMonthsBetween,
  DepositLike,
  FundLike,
} from '../../utils/calculations';

const d = (iso: string): Date => new Date(iso);

describe('date helpers', () => {
  it('wholeMonthsBetween counts completed months only', () => {
    expect(wholeMonthsBetween(d('2026-01-15'), d('2026-03-14'))).toBe(1);
    expect(wholeMonthsBetween(d('2026-01-15'), d('2026-03-15'))).toBe(2);
    expect(wholeMonthsBetween(d('2026-01-15'), d('2027-01-15'))).toBe(12);
  });

  it('wholeMonthsBetween returns 0 when the end is not after the start', () => {
    expect(wholeMonthsBetween(d('2026-05-01'), d('2026-01-01'))).toBe(0);
    expect(wholeMonthsBetween(d('2026-05-01'), d('2026-05-01'))).toBe(0);
  });

  it('addMonths clamps to the end of shorter months', () => {
    expect(addMonths(d('2026-01-31'), 1).toISOString().slice(0, 10)).toBe('2026-02-28');
    expect(addMonths(d('2026-11-15'), 3).toISOString().slice(0, 10)).toBe('2027-02-15');
  });
});

describe('fundValueAt', () => {
  const staticFund: FundLike = { type: 'static', amount: 1000 };
  const interestFund: FundLike = {
    type: 'interest',
    amount: 1000,
    interestRate: 12, // 1% per month
    startDate: d('2026-01-01'),
    durationMonths: 12,
  };

  it('static funds never grow', () => {
    expect(fundValueAt(staticFund, d('2030-01-01'))).toBe(1000);
  });

  it('interest funds compound monthly', () => {
    expect(fundValueAt(interestFund, d('2026-03-01'))).toBeCloseTo(1000 * 1.01 ** 2, 6);
  });

  it('interest funds stop growing after the term ends', () => {
    const atMaturity = fundValueAt(interestFund, d('2027-01-01'));
    expect(fundValueAt(interestFund, d('2030-01-01'))).toBeCloseTo(atMaturity, 6);
    expect(atMaturity).toBeCloseTo(1000 * 1.01 ** 12, 6);
  });

  it('interest funds have no growth before they start', () => {
    expect(fundValueAt(interestFund, d('2025-06-01'))).toBe(1000);
  });
});

describe('calculateBalance', () => {
  const deposits: DepositLike[] = [
    { amount: 200, date: d('2026-01-31') },
    { amount: 300, date: d('2026-02-28') },
    { amount: 999, date: d('2026-12-31') }, // in the future, must be ignored
  ];
  const funds: FundLike[] = [
    { type: 'static', amount: 500 },
    { type: 'interest', amount: 1000, interestRate: 12, startDate: d('2026-01-01'), durationMonths: 12 },
  ];

  it('adds deposits, static funds and interest funds', () => {
    const result = calculateBalance(deposits, funds, d('2026-03-01'));

    expect(result.depositsTotal).toBe(500);
    expect(result.staticFundsTotal).toBe(500);
    expect(result.interestFundsPrincipal).toBe(1000);
    expect(result.interestEarned).toBe(20.1);
    expect(result.interestFundsTotal).toBe(1020.1);
    expect(result.totalBalance).toBe(2020.1);
  });

  it('is zero for a user with no data', () => {
    expect(calculateBalance([], [], d('2026-03-01')).totalBalance).toBe(0);
  });
});

describe('averageMonthlyDeposit', () => {
  it('is 0 without deposits', () => {
    expect(averageMonthlyDeposit([], d('2026-03-15'))).toBe(0);
  });

  it('spreads deposits over the months since the first one (inclusive)', () => {
    const deposits: DepositLike[] = [
      { amount: 100, date: d('2026-01-10') },
      { amount: 100, date: d('2026-02-10') },
      { amount: 100, date: d('2026-03-10') },
    ];
    expect(averageMonthlyDeposit(deposits, d('2026-03-15'))).toBe(100);
  });

  it('counts months with no deposit as zero', () => {
    const deposits: DepositLike[] = [{ amount: 300, date: d('2026-01-10') }];
    expect(averageMonthlyDeposit(deposits, d('2026-03-15'))).toBe(100);
  });
});

describe('predictBalance', () => {
  it('adds monthly deposits and fund growth up to the target date', () => {
    const deposits: DepositLike[] = [{ amount: 1000, date: d('2026-01-01') }];
    const funds: FundLike[] = [{ type: 'static', amount: 500 }];

    const result = predictBalance(deposits, funds, d('2026-07-01'), d('2026-01-01'), 100);

    expect(result).toBe(1000 + 6 * 100 + 500);
  });
});

describe('estimateDream', () => {
  const now = d('2026-01-01');

  it('is already achieved when the balance covers the target', () => {
    const result = estimateDream([{ amount: 1000, date: d('2025-12-01') }], [], 800, now, 0);

    expect(result.achievable).toBe(true);
    expect(result.monthsRemaining).toBe(0);
    expect(result.remainingAmount).toBe(0);
  });

  it('finds the month in which the target is reached', () => {
    // balance 1000, saving 100/month, target 1500 -> 5 months
    const result = estimateDream([{ amount: 1000, date: d('2025-12-01') }], [], 1500, now, 100);

    expect(result.achievable).toBe(true);
    expect(result.monthsRemaining).toBe(5);
    expect(result.estimatedDate?.toISOString().slice(0, 10)).toBe('2026-06-01');
    expect(result.remainingAmount).toBe(500);
  });

  it('is not achievable without savings or interest', () => {
    const result = estimateDream([], [], 1000, now, 0);

    expect(result.achievable).toBe(false);
    expect(result.estimatedDate).toBeNull();
    expect(result.monthsRemaining).toBeNull();
  });

  it('uses interest growth to reach the target sooner', () => {
    const funds: FundLike[] = [
      { type: 'interest', amount: 1000, interestRate: 12, startDate: d('2026-01-01'), durationMonths: 24 },
    ];
    const withInterest = estimateDream([], funds, 1100, now, 0);

    expect(withInterest.achievable).toBe(true);
    expect(withInterest.monthsRemaining).toBe(10); // 1000 * 1.01^10 = 1104.62
  });
});
