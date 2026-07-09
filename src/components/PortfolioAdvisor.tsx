import React from "react";
import { TrendingUp, Zap } from "lucide-react";
import { getPortfolioRecommendation } from "../utils/helpers";

interface PortfolioAdvisorProps {
  riskScore: number;
  riskLevel: "conservative" | "moderate" | "aggressive";
}

export default function PortfolioAdvisor({ riskScore, riskLevel }: PortfolioAdvisorProps) {
  const recommendation = getPortfolioRecommendation(riskScore);

  const getColorClass = (level: string) => {
    switch (level) {
      case "conservative":
        return "from-blue-500 to-blue-600";
      case "moderate":
        return "from-amber-500 to-amber-600";
      default:
        return "from-red-500 to-red-600";
    }
  };

  return (
    <div className="space-y-6" role="region" aria-label="Portfolio recommendations">
      {/* Risk Level Overview */}
      <div className={`p-6 bg-gradient-to-r ${getColorClass(riskLevel)} rounded-lg text-white shadow-lg`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-semibold opacity-90">Your Risk Profile</p>
            <h3 className="text-2xl font-bold capitalize mt-1">{riskLevel}</h3>
          </div>
          <Zap size={24} aria-hidden="true" />
        </div>
        <p className="text-sm opacity-95">
          Risk Score: <strong>{riskScore}/100</strong> - Based on your responses
        </p>
      </div>

      {/* Asset Allocation Breakdown */}
      <div className="space-y-4">
        <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp size={18} /> Recommended Asset Allocation
        </h4>

        <div className="space-y-3">
          {[
            { label: "Equities", value: recommendation.allocation.equities, color: "bg-green-500" },
            { label: "Bonds", value: recommendation.allocation.bonds, color: "bg-blue-500" },
            { label: "Gold", value: recommendation.allocation.gold, color: "bg-yellow-500" },
            { label: "Cash", value: recommendation.allocation.cash, color: "bg-slate-400" },
          ].map((asset) => (
            <div key={asset.label}>
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{asset.label}</p>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{asset.value}%</span>
              </div>
              <div className="h-3 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full ${asset.color} rounded-full`}
                  style={{ width: `${asset.value}%` }}
                  role="progressbar"
                  aria-valuenow={asset.value}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expected Returns & Volatility */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-lg">
          <p className="text-xs font-semibold text-slate-600 dark:text-white/70 uppercase">Expected Annual Return</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{recommendation.expectedReturn.toFixed(1)}%</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-lg">
          <p className="text-xs font-semibold text-slate-600 dark:text-white/70 uppercase">Expected Volatility</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{recommendation.expectedVolatility.toFixed(1)}%</p>
        </div>
      </div>

      {/* Investment Strategy */}
      <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg">
        <h5 className="font-semibold text-emerald-900 dark:text-emerald-200 mb-3 text-sm">Investment Strategy</h5>
        <ul className="space-y-2 text-xs text-emerald-800 dark:text-emerald-300">
          {riskLevel === "conservative" && (
            <>
              <li>✓ Focus on capital preservation and steady income</li>
              <li>✓ Prioritize bonds and fixed-income securities</li>
              <li>✓ Include dividend-paying stocks for stability</li>
              <li>✓ Maintain adequate cash reserves (12-24 months)</li>
            </>
          )}
          {riskLevel === "moderate" && (
            <>
              <li>✓ Balance growth and income with moderate risk</li>
              <li>✓ Diversify across multiple asset classes</li>
              <li>✓ Include both growth and value stocks</li>
              <li>✓ Rebalance portfolio annually</li>
            </>
          )}
          {riskLevel === "aggressive" && (
            <>
              <li>✓ Maximize long-term growth potential</li>
              <li>✓ Focus on growth stocks and emerging markets</li>
              <li>✓ Consider sector-specific investments</li>
              <li>✓ Accept short-term volatility for long-term gains</li>
            </>
          )}
        </ul>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-slate-500 dark:text-white/50 italic">
        This recommendation is for educational purposes. Consult with a financial advisor before making investment decisions.
      </p>
    </div>
  );
}
