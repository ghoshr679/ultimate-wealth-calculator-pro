export interface CalculationInputs {
  investment: number;
  monthlyContribution: number;
  targetAmount: number;
  monthlyRate: number;
  currency: string;
  startDate: string;
  goalName: string;
  inflationRate?: number; // annual inflation rate
}

export interface MonthlyProjection {
  month: number;
  dateStr: string;
  contributions: number;
  profit: number;
  balance: number;
  adjustedBalance: number; // inflation-adjusted purchasing power
}

export interface CalculationResults {
  finalAmount: number;
  totalContributions: number;
  totalProfit: number;
  roi: number;
  cagr: number;
  monthsNeeded: number;
  yearsNeeded: number;
  remainingMonths: number;
  completionDate: string;
  projections: MonthlyProjection[];
  
  // Inflation adjusted real outcomes
  realFinalAmount: number;
  realProfit: number;
  realRoi: number;
  realCagr: number;
  realMonthsNeeded: number;
  realYearsNeeded: number;
  realRemainingMonths: number;
  realCompletionDate: string;
}

export interface CurrencyOption {
  code: string;
  locale: string;
  symbol: string;
  name: string;
  flag: string;
}
