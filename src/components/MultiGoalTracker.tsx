import React, { useState } from "react";
import { Target, Plus, Trash2 } from "lucide-react";
import { Goal } from "../types";
import { formatCurrency } from "../utils/helpers";

interface MultiGoalTrackerProps {
  currency: string;
}

export default function MultiGoalTracker({ currency }: MultiGoalTrackerProps) {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      name: "Dream Home",
      targetAmount: 500000,
      currentAmount: 100000,
      monthlyContribution: 5000,
      expectedReturn: 8,
      priority: "high",
      currency,
    },
    {
      id: "2",
      name: "Retirement",
      targetAmount: 2000000,
      currentAmount: 250000,
      monthlyContribution: 10000,
      expectedReturn: 10,
      priority: "high",
      currency,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    name: "",
    targetAmount: 100000,
    currentAmount: 0,
    monthlyContribution: 1000,
    expectedReturn: 8,
    priority: "medium",
  });

  const addGoal = () => {
    if (newGoal.name) {
      const goal: Goal = {
        id: Date.now().toString(),
        name: newGoal.name,
        targetAmount: newGoal.targetAmount || 100000,
        currentAmount: newGoal.currentAmount || 0,
        monthlyContribution: newGoal.monthlyContribution || 1000,
        expectedReturn: newGoal.expectedReturn || 8,
        priority: (newGoal.priority as any) || "medium",
        currency,
      };
      setGoals([...goals, goal]);
      setNewGoal({ name: "", targetAmount: 100000, currentAmount: 0, monthlyContribution: 1000, expectedReturn: 8, priority: "medium" });
      setShowForm(false);
    }
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  const sortedGoals = [...goals].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const totalProgress = sortedGoals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount) * 100, 0) / sortedGoals.length;

  return (
    <div className="space-y-6" role="region" aria-label="Multi-goal tracker">
      {/* Overall Progress */}
      <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold opacity-90">Overall Goal Progress</p>
            <h3 className="text-3xl font-bold mt-1">{Math.round(totalProgress)}%</h3>
            <p className="text-sm opacity-95 mt-2">{sortedGoals.length} active goals</p>
          </div>
          <Target size={32} aria-hidden="true" />
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {sortedGoals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const priorityColors = {
            high: "border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/20",
            medium: "border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20",
            low: "border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-950/20",
          };

          return (
            <div
              key={goal.id}
              className={`p-4 border rounded-lg ${priorityColors[goal.priority]} transition-all hover:shadow-md`}
              role="article"
              aria-label={`Goal: ${goal.name}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 dark:text-white">{goal.name}</h4>
                  <div className="flex gap-4 mt-2 text-xs text-slate-600 dark:text-white/60">
                    <p>Current: <strong>{formatCurrency(goal.currentAmount, currency)}</strong></p>
                    <p>Target: <strong>{formatCurrency(goal.targetAmount, currency)}</strong></p>
                  </div>
                </div>
                <button
                  onClick={() => removeGoal(goal.id)}
                  className="p-2 hover:bg-red-200 dark:hover:bg-red-900/30 rounded transition-colors"
                  aria-label={`Remove goal: ${goal.name}`}
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-white/70">
                  <span>Progress</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={Math.round(progress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>

              {/* Goal Details */}
              <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
                <div className="p-2 bg-white/50 dark:bg-white/5 rounded">
                  <p className="text-slate-600 dark:text-white/60">Monthly Contribution</p>
                  <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(goal.monthlyContribution, currency)}</p>
                </div>
                <div className="p-2 bg-white/50 dark:bg-white/5 rounded">
                  <p className="text-slate-600 dark:text-white/60">Expected Return</p>
                  <p className="font-bold text-slate-900 dark:text-white">{goal.expectedReturn}% p.a.</p>
                </div>
                <div className="p-2 bg-white/50 dark:bg-white/5 rounded">
                  <p className="text-slate-600 dark:text-white/60">Remaining</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(goal.targetAmount - goal.currentAmount, currency)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add New Goal
        </button>
      )}

      {/* Add Goal Form */}
      {showForm && (
        <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg space-y-3">
          <input
            type="text"
            placeholder="Goal name (e.g., Car, Vacation)"
            value={newGoal.name || ""}
            onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
            className="w-full px-3 py-2 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-emerald-500 text-sm"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Target amount"
              value={newGoal.targetAmount || ""}
              onChange={(e) => setNewGoal({ ...newGoal, targetAmount: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-emerald-500 text-sm"
            />
            <input
              type="number"
              placeholder="Current amount"
              value={newGoal.currentAmount || ""}
              onChange={(e) => setNewGoal({ ...newGoal, currentAmount: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-emerald-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Monthly contribution"
              value={newGoal.monthlyContribution || ""}
              onChange={(e) => setNewGoal({ ...newGoal, monthlyContribution: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-emerald-500 text-sm"
            />
            <input
              type="number"
              placeholder="Expected return %"
              value={newGoal.expectedReturn || ""}
              onChange={(e) => setNewGoal({ ...newGoal, expectedReturn: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-emerald-500 text-sm"
            />
          </div>

          <select
            value={newGoal.priority || "medium"}
            onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as "high" | "medium" | "low" })}
            className="w-full px-3 py-2 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-emerald-500 text-sm"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={addGoal}
              className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded transition-colors"
            >
              Add Goal
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 bg-slate-300 dark:bg-white/10 hover:bg-slate-400 dark:hover:bg-white/20 text-slate-900 dark:text-white font-semibold rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
