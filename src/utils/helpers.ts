import { CalculationInputs, CalculationResults, MonthlyProjection, CurrencyOption } from "../types";

export const CURRENCIES: CurrencyOption[] = [
  { code: "INR", locale: "en-IN", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "USD", locale: "en-US", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", locale: "de-DE", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", locale: "en-GB", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "AUD", locale: "en-AU", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", locale: "en-CA", symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AED", locale: "ar-AE", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "SGD", locale: "en-SG", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬" },
];

export function getCurrencyConfig(code: string): CurrencyOption {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const config = getCurrencyConfig(currencyCode);
  try {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (e) {
    return `${config.symbol}${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
}

export function formatCurrencyWithDecimals(amount: number, currencyCode: string): string {
  const config = getCurrencyConfig(currencyCode);
  try {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (e) {
    return `${config.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

export function formatPercent(val: number): string {
  return `${val.toFixed(2)}%`;
}

export function getMonthYearString(startDateStr: string, monthsOffset: number): string {
  const date = startDateStr ? new Date(startDateStr) : new Date();
  if (isNaN(date.getTime())) {
    return "";
  }
  date.setMonth(date.getMonth() + monthsOffset);
  return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export function calculateWealthProjection(inputs: CalculationInputs): CalculationResults {
  const { investment, monthlyContribution, targetAmount, monthlyRate, startDate, inflationRate = 0 } = inputs;

  const r = monthlyRate / 100;
  const inf = (inflationRate || 0) / 100;
  
  let balance = investment;
  let totalContributions = investment;
  let months = 0;
  const projections: MonthlyProjection[] = [];

  // Add month 0 starting state
  projections.push({
    month: 0,
    dateStr: getMonthYearString(startDate, 0),
    contributions: investment,
    profit: 0,
    balance: investment,
    adjustedBalance: investment,
  });

  const maxMonths = 1200; // Capped at 100 years for readability and safety

  let nominalMonthsNeeded = -1;
  let realMonthsNeeded = -1;

  // Calculation loop
  while (months < maxMonths) {
    const currentAdjusted = balance / Math.pow(1 + inf, months / 12);

    if (balance >= targetAmount && nominalMonthsNeeded === -1) {
      nominalMonthsNeeded = months;
    }
    if (currentAdjusted >= targetAmount && realMonthsNeeded === -1) {
      realMonthsNeeded = months;
    }

    // Stop if both goals are reached
    const bothReached = (nominalMonthsNeeded !== -1) && (realMonthsNeeded !== -1);
    const nominalReachedButRealUnreachable = (nominalMonthsNeeded !== -1) && (inf > 0) && (r <= inf && monthlyContribution <= 0);

    if (bothReached || nominalReachedButRealUnreachable) {
      break;
    }

    // If nominal target is achieved but real is taking extremely long (or infinite), stop after a reasonable buffer
    if (nominalMonthsNeeded !== -1 && months > nominalMonthsNeeded + 180) {
      break;
    }

    months++;
    // Compound previous balance
    const interest = balance * r;
    balance = balance + interest + monthlyContribution;
    totalContributions += monthlyContribution;
    const profit = balance - totalContributions;
    const nextAdjusted = balance / Math.pow(1 + inf, months / 12);

    projections.push({
      month: months,
      dateStr: getMonthYearString(startDate, months),
      contributions: totalContributions,
      profit: Math.max(0, profit),
      balance: balance,
      adjustedBalance: nextAdjusted,
    });

    // If both return and contribution are 0 or negative and we haven't reached target, break to avoid infinite loop
    if (r <= 0 && monthlyContribution <= 0 && balance < targetAmount) {
      break;
    }
  }

  // Fallbacks if not reached
  if (nominalMonthsNeeded === -1) {
    nominalMonthsNeeded = months;
  }
  if (realMonthsNeeded === -1) {
    realMonthsNeeded = months;
  }

  const finalAmount = balance;
  const totalProfit = Math.max(0, finalAmount - totalContributions);
  const roi = totalContributions > 0 ? (totalProfit / totalContributions) * 100 : 0;
  
  const yearsNeeded = nominalMonthsNeeded / 12;
  const cagr = yearsNeeded > 0 && investment > 0
    ? (Math.pow(finalAmount / investment, 1 / yearsNeeded) - 1) * 100
    : 0;

  const wholeYears = Math.floor(nominalMonthsNeeded / 12);
  const remainingMonths = nominalMonthsNeeded % 12;

  // Completion Date calculation
  const compDate = startDate ? new Date(startDate) : new Date();
  compDate.setMonth(compDate.getMonth() + nominalMonthsNeeded);
  const completionDate = compDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Real values
  const realFinalAmount = finalAmount / Math.pow(1 + inf, nominalMonthsNeeded / 12);
  const realProfit = Math.max(0, realFinalAmount - totalContributions);
  const realRoi = totalContributions > 0 ? (realProfit / totalContributions) * 100 : 0;
  
  const realYearsNeeded = realMonthsNeeded / 12;
  const realCagr = realYearsNeeded > 0 && investment > 0
    ? (Math.pow(realFinalAmount / investment, 1 / realYearsNeeded) - 1) * 100
    : 0;

  const realWholeYears = Math.floor(realMonthsNeeded / 12);
  const realRemainingMonths = realMonthsNeeded % 12;

  const realCompDate = startDate ? new Date(startDate) : new Date();
  realCompDate.setMonth(realCompDate.getMonth() + realMonthsNeeded);
  const realCompletionDate = realCompDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    finalAmount,
    totalContributions,
    totalProfit,
    roi,
    cagr,
    monthsNeeded: nominalMonthsNeeded,
    yearsNeeded: wholeYears,
    remainingMonths,
    completionDate,
    projections,

    // Real values
    realFinalAmount,
    realProfit,
    realRoi,
    realCagr,
    realMonthsNeeded,
    realYearsNeeded: realWholeYears,
    realRemainingMonths,
    realCompletionDate,
  };
}

export function saveInputsToLocalStorage(inputs: CalculationInputs): void {
  try {
    localStorage.setItem("wealth_calculator_inputs", JSON.stringify(inputs));
  } catch (e) {
    console.error("Error saving inputs to localStorage:", e);
  }
}

export function loadInputsFromLocalStorage(): CalculationInputs | null {
  try {
    const data = localStorage.getItem("wealth_calculator_inputs");
    if (!data) return null;
    const parsed = JSON.parse(data);
    // basic schema check
    if (typeof parsed.investment === "number" && typeof parsed.targetAmount === "number") {
      return parsed as CalculationInputs;
    }
  } catch (e) {
    console.error("Error loading inputs from localStorage:", e);
  }
  return null;
}
