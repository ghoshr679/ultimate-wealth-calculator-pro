import React, { useState } from "react";
import { DollarSign } from "lucide-react";
import { CalculationInputs, CalculationResults } from "../types";
import { calculateTaxImpact, formatCurrency } from "../utils/helpers";

interface TaxCalculatorProps {
  inputs: CalculationInputs;
  results: CalculationResults;
}

export default function TaxCalculator({ inputs, results }: TaxCalculatorProps) {
  const [incomeTaxRate, setIncomeTaxRate] = useState<number>(20);
  const [capitalGainsTaxRate, setCapitalGainsTaxRate] = useState<number>(15);

  const taxImpact = calculateTaxImpact(inputs, incomeTaxRate, capitalGainsTaxRate);

  return (
    <div className="space-y-6" role="region" aria-label="Tax calculator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Income Tax Rate */}
        <div>
          <label htmlFor="income-tax" className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Income Tax Rate (%)
          </label>
          <input
            id="income-tax"
            type="number"
            min="0"
            max="50"
            value={incomeTaxRate}
            onChange={(e) => setIncomeTaxRate(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm outline-none transition text-slate-900 dark:text-white"
          />
        </div>

        {/* Capital Gains Tax Rate */}
        <div>
          <label htmlFor="capital-gains-tax" className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Capital Gains Tax Rate (%)
          </label>
          <input
            id="capital-gains-tax"
            type="number"
            min="0"
            max="50"
            value={capitalGainsTaxRate}
            onChange={(e) => setCapitalGainsTaxRate(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm outline-none transition text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Tax Impact Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 rounded-lg border border-red-200 dark:border-red-800/50">
          <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1 flex items-center gap-2">
            <DollarSign size={14} /> Total Tax Paid
          </p>
          <p className="text-lg font-bold text-red-900 dark:text-red-200">
            {formatCurrency(taxImpact.taxPaid, inputs.currency)}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            Effective Rate: {taxImpact.effectiveRate.toFixed(2)}%
          </p>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800/50">
          <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">After-Tax Return</p>
          <p className="text-lg font-bold text-green-900 dark:text-green-200">
            {formatCurrency(taxImpact.afterTaxReturn, inputs.currency)}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
            vs. Pre-tax: {formatCurrency(results.finalAmount, inputs.currency)}
          </p>
        </div>

        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg border border-blue-200 dark:border-blue-800/50">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Tax Savings Opportunity</p>
          <p className="text-lg font-bold text-blue-900 dark:text-blue-200">
            {formatCurrency(results.finalAmount - taxImpact.afterTaxReturn, inputs.currency)}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            With optimization strategies
          </p>
        </div>
      </div>

      {/* Tax Optimization Tips */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg">
        <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-3 text-sm">Tax Optimization Tips</h4>
        <ul className="space-y-2 text-xs text-amber-800 dark:text-amber-300">
          <li>✓ Consider tax-advantaged accounts (401k, IRA, HSA)</li>
          <li>✓ Use tax-loss harvesting strategies</li>
          <li>✓ Diversify across tax-efficient investments</li>
          <li>✓ Hold investments for long-term capital gains rates</li>
          <li>✓ Consult a tax professional for personalized advice</li>
        </ul>
      </div>
    </div>
  );
}
