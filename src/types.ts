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

export interface ValidationError {
  field: string;
  message: string;
}

export interface InvestmentScenario {
  id: string;
  name: string;
  inputs: CalculationInputs;
  results?: CalculationResults;
  createdAt: string;
}

export interface RiskProfile {
  score: number; // 0-100
  level: "conservative" | "moderate" | "aggressive";
  allocation: {
    bonds: number;
    stocks: number;
    cash: number;
  };
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  expectedReturn: number;
  priority: "high" | "medium" | "low";
  deadline?: string;
  currency: string;
}

export interface TaxInfo {
  annualIncome: number;
  taxBracket: number; // as percentage
  capitalGainsTax: number;
  effectiveReturn: number;
  taxPaid: number;
}

export interface PortfolioRecommendation {
  riskLevel: string;
  allocation: {
    equities: number;
    bonds: number;
    gold: number;
    cash: number;
  };
  expectedReturn: number;
  expectedVolatility: number;
  timeHorizon: string;
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
