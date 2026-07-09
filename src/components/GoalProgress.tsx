import React from "react";
import { CheckCircle, Target } from "lucide-react";

interface GoalProgressProps {
  goalName: string;
  currentAmount: number;
  targetAmount: number;
  currency: string;
  formatCurrency: (amount: number, currency: string) => string;
  showMilestones?: boolean;
}

export default function GoalProgress({
  goalName,
  currentAmount,
  targetAmount,
  currency,
  formatCurrency,
  showMilestones = true,
}: GoalProgressProps) {
  const progressPercent = Math.min((currentAmount / targetAmount) * 100, 100);

  const milestones = [
    { percent: 25, label: "25%" },
    { percent: 50, label: "50%" },
    { percent: 75, label: "75%" },
    { percent: 100, label: "100%" },
  ];

  const achievedMilestones = milestones.filter((m) => progressPercent >= m.percent);

  return (
    <div className="space-y-4" role="region" aria-label={`Progress for ${goalName}`}>
      {/* Goal Header */}
      <div className="flex items-center gap-3">
        <Target size={20} className="text-emerald-500" aria-hidden="true" />
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white">{goalName}</h4>
          <p className="text-xs text-slate-500 dark:text-white/50">
            {formatCurrency(currentAmount, currency)} / {formatCurrency(targetAmount, currency)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-medium text-slate-600 dark:text-white/70">Progress</span>
          <span
            className="font-bold text-emerald-600 dark:text-emerald-400"
            aria-live="polite"
            aria-atomic="true"
          >
            {Math.round(progressPercent)}%
          </span>
        </div>
        <div className="h-3 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progressPercent)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progress: ${Math.round(progressPercent)}% complete`}
          />
        </div>
      </div>

      {/* Milestones */}
      {showMilestones && (
        <div aria-label="Achievement milestones">
          <p className="text-xs font-medium text-slate-600 dark:text-white/70 mb-3">Milestones</p>
          <div className="grid grid-cols-4 gap-2">
            {milestones.map((milestone) => {
              const achieved = progressPercent >= milestone.percent;
              return (
                <div
                  key={milestone.percent}
                  className={`p-3 rounded-lg text-center transition-all ${
                    achieved
                      ? "bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700"
                      : "bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                  }`}
                  role="status"
                  aria-label={`${milestone.label} milestone ${achieved ? "achieved" : "pending"}`}
                >
                  {achieved ? (
                    <CheckCircle
                      size={16}
                      className="text-emerald-600 dark:text-emerald-400 mx-auto mb-1"
                      aria-hidden="true"
                    />
                  ) : (
                    <div className="w-4 h-4 border-2 border-slate-300 dark:border-white/20 rounded-full mx-auto mb-1" />
                  )}
                  <p
                    className={`text-xs font-bold ${
                      achieved ? "text-emerald-700 dark:text-emerald-300" : "text-slate-500 dark:text-white/40"
                    }`}
                  >
                    {milestone.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
