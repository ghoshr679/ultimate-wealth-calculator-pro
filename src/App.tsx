import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  Coins,
  Scale,
  CircleHelp,
  FileWarning,
  SlidersHorizontal,
  Sun,
  Moon,
  CheckCircle,
  Calendar,
  DollarSign,
  LineChart,
  BookOpen,
  Share2,
  Printer,
  Download,
  RefreshCw,
  MessageSquare,
  Globe,
  Mail,
  Linkedin,
  Send,
  Twitter,
  ChevronRight,
  Calculator,
  UserCheck,
  Award,
} from "lucide-react";
import { CalculationInputs, CalculationResults, CurrencyOption } from "./types";
import {
  CURRENCIES,
  getCurrencyConfig,
  calculateWealthProjection,
  formatCurrency,
  formatCurrencyWithDecimals,
  formatPercent,
  saveInputsToLocalStorage,
  loadInputsFromLocalStorage,
} from "./utils/helpers";
import AnalyticsChart from "./components/AnalyticsChart";

export default function App() {
  // Theme state: default to system preference or dark
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<"dashboard" | "calculator" | "analytics" | "reports" | "developer" | "faq" | "inflation">("dashboard");

  // Inflation comparison states
  const [inflationCompareAmount, setInflationCompareAmount] = useState<number>(100000);
  const [inflationCompareRate, setInflationCompareRate] = useState<number>(3.0);
  const [pastCompareYears, setPastCompareYears] = useState<number>(25);
  const [futureCompareYears, setFutureCompareYears] = useState<number>(25);

  // Error/validation messages
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Inputs state
  const [inputs, setInputs] = useState<CalculationInputs>({
    investment: 10000,
    monthlyContribution: 500,
    targetAmount: 500000,
    monthlyRate: 1.5,
    currency: "USD",
    startDate: new Date().toISOString().split("T")[0],
    goalName: "Dream Home Fund",
    inflationRate: 0,
  });

  // Load persistent inputs on mount
  useEffect(() => {
    // Sync dark theme class on documentElement and body
    const savedTheme = localStorage.getItem("wealthTheme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("light", savedTheme === "light");
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
      document.body.classList.toggle("light", savedTheme === "light");
      document.body.classList.toggle("dark", savedTheme === "dark");
    } else {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    }

    const savedInputs = loadInputsFromLocalStorage();
    if (savedInputs) {
      setInputs(savedInputs);
    }
  }, []);

  // Theme toggle helper
  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("wealthTheme", nextTheme);
    document.documentElement.classList.toggle("light", nextTheme === "light");
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.body.classList.toggle("light", nextTheme === "light");
    document.body.classList.toggle("dark", nextTheme === "dark");
  };

  // Input change handler
  const handleInputChange = (field: keyof CalculationInputs, value: any) => {
    const nextInputs = { ...inputs, [field]: value };
    setInputs(nextInputs);
    saveInputsToLocalStorage(nextInputs);

    // Validate in real-time
    validateField(field, value, nextInputs);
  };

  // Robust validation routine
  const validateField = (field: keyof CalculationInputs, value: any, allInputs: CalculationInputs) => {
    const errors = { ...validationErrors };

    if (field === "investment") {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        errors.investment = "Initial investment must be 0 or a positive number";
      } else {
        delete errors.investment;
      }
    }

    if (field === "monthlyContribution") {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        errors.monthlyContribution = "Monthly contribution (SIP) must be 0 or positive";
      } else {
        delete errors.monthlyContribution;
      }
    }

    if (field === "targetAmount") {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) {
        errors.targetAmount = "Target amount must be a positive number greater than 0";
      } else if (num <= allInputs.investment) {
        errors.targetAmount = "Target must be larger than your initial investment";
      } else {
        delete errors.targetAmount;
      }
    }

    if (field === "monthlyRate") {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        errors.monthlyRate = "Monthly return rate must be 0 or positive";
      } else if (num > 25) {
        errors.monthlyRate = "Warning: 25%+ monthly return is extremely high and speculative";
      } else {
        delete errors.monthlyRate;
      }
    }

    if (field === "inflationRate") {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0 || num > 50) {
        errors.inflationRate = "Annual inflation rate must be between 0% and 50%";
      } else {
        delete errors.inflationRate;
      }
    }

    setValidationErrors(errors);
  };

  // Perform calculations based on state
  const results: CalculationResults = calculateWealthProjection(inputs);

  // Quick reset
  const handleReset = () => {
    const defaultInputs: CalculationInputs = {
      investment: 5000,
      monthlyContribution: 250,
      targetAmount: 100000,
      monthlyRate: 1.2,
      currency: "INR",
      startDate: new Date().toISOString().split("T")[0],
      goalName: "Future Wealth Fund",
      inflationRate: 0,
    };
    setInputs(defaultInputs);
    setValidationErrors({});
    saveInputsToLocalStorage(defaultInputs);
  };

  // Export projections as CSV
  const handleExportCSV = () => {
    if (results.projections.length === 0) return;
    const headers = ["Month", "Expected Date", "Total Invested Capital", "Compounded Profits", "Portfolio Balance"];
    const rows = results.projections.map((p) => [
      p.month,
      p.dateStr,
      p.contributions.toFixed(2),
      p.profit.toFixed(2),
      p.balance.toFixed(2),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${inputs.goalName.replace(/\s+/g, "_")}_Wealth_Projection.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy report summary to clipboard
  const [copied, setCopied] = useState(false);
  const handleCopyReport = () => {
    const reportText = `
--- ULTIMATE WEALTH PRO REPORT ---
Goal Name: ${inputs.goalName}
Initial Capital: ${formatCurrency(inputs.investment, inputs.currency)}
Monthly Contribution: ${formatCurrency(inputs.monthlyContribution, inputs.currency)}/month
Target wealth: ${formatCurrency(inputs.targetAmount, inputs.currency)}
Monthly Return rate: ${inputs.monthlyRate}%
--- RESULTS SUMMARY ---
Target Status: Reached in ${results.monthsNeeded} Months (~${(results.monthsNeeded / 12).toFixed(1)} Years)
Estimated Completion: ${results.completionDate}
Total Capital Invested: ${formatCurrency(results.totalContributions, inputs.currency)}
Earned Profits: ${formatCurrency(results.totalProfit, inputs.currency)}
Ending Portfolio Value: ${formatCurrency(results.finalAmount, inputs.currency)}
Compound ROI: ${results.roi.toFixed(1)}%
Equivalent CAGR: ${results.cagr.toFixed(1)}%
Generated via Ultimate Wealth Calculator Pro.
    `.trim();

    navigator.clipboard.writeText(reportText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Dynamic share report modal (integrated natively)
  const [showShareModal, setShowShareModal] = useState(false);

  // Calculate milestones achievement status based on CURRENT progress
  const currentProgressPct = inputs.targetAmount > 0 ? (inputs.investment / inputs.targetAmount) * 100 : 0;
  const milestone25Achieved = currentProgressPct >= 25;
  const milestone50Achieved = currentProgressPct >= 50;
  const milestone75Achieved = currentProgressPct >= 75;
  const milestone100Achieved = currentProgressPct >= 100;

  // Rates comparison matrix options (stateful to allow dynamic bracket selection and inline editing)
  const [comparisonRates, setComparisonRates] = useState<number[]>([1.0, 2.0, 3.0, 4.0, 5.0]);
  const [activeBracket, setActiveBracket] = useState<string>("1-5");

  const rateBrackets = [
    { id: "1-5", label: "1% – 5%", values: [1.0, 2.0, 3.0, 4.0, 5.0] },
    { id: "6-10", label: "6% – 10%", values: [6.0, 7.0, 8.0, 9.0, 10.0] },
    { id: "11-15", label: "11% – 15%", values: [11.0, 12.0, 13.0, 14.0, 15.0] },
    { id: "16-20", label: "16% – 20%", values: [16.0, 17.0, 18.0, 19.0, 20.0] },
    { id: "21-25", label: "21% – 25%", values: [21.0, 22.0, 23.0, 24.0, 25.0] },
  ];

  return (
    <div className={`min-h-screen font-sans antialiased text-slate-900 dark:text-[#f5f5f5] bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-300`}>
      {/* Container holding layout */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-72 bg-white dark:bg-[#0c0c0c] border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/10 flex flex-col justify-between p-6 shrink-0 shadow-sm z-30">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 bg-emerald-500 rounded-sm flex items-center justify-center font-bold text-black text-xs italic shadow-md">
                VA
              </div>
              <div>
                <h1 className="text-lg font-serif italic text-slate-900 dark:text-[#f5f5f5] tracking-tight">
                  Vanguard Wealth Pro
                </h1>
                <p className="text-[9px] tracking-[0.18em] uppercase font-sans font-bold text-slate-400 dark:text-white/40">
                  Asset Planner
                </p>
              </div>
            </div>

            {/* Sidebar Navigation Options */}
            <nav className="space-y-1.5">
              {[
                { id: "dashboard", label: "Dashboard", icon: <LineChart size={17} /> },
                { id: "calculator", label: "Calculator Tools", icon: <SlidersHorizontal size={17} /> },
                { id: "analytics", label: "Growth Analytics", icon: <Coins size={17} /> },
                { id: "inflation", label: "Inflation Comparing", icon: <TrendingUp size={17} /> },
                { id: "reports", label: "Rate Comparison", icon: <Scale size={17} /> },
                { id: "faq", label: "Financial FAQ", icon: <CircleHelp size={17} /> },
                { id: "developer", label: "Developer", icon: <UserCheck size={17} /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3.5 px-4.5 py-2.5 rounded transition-all duration-200 text-left text-xs uppercase tracking-wider ${
                    activeTab === item.id
                      ? "bg-white/5 dark:bg-white/10 text-slate-900 dark:text-emerald-400 border border-slate-200 dark:border-white/10 font-bold"
                      : "text-slate-500 dark:text-white/50 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {activeTab === item.id && (
                    <ChevronRight size={13} className="ml-auto text-emerald-400" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer Details */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest">
                Theme Preset
              </span>
              <button
                onClick={handleToggleTheme}
                className="p-2 rounded bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/10 transition-colors"
                aria-label="Toggle Theme Color"
              >
                {theme === "dark" ? <Sun size={15} className="text-emerald-400" /> : <Moon size={15} className="text-slate-600" />}
              </button>
            </div>
            <div className="text-[10px] text-slate-400/85 dark:text-white/30 leading-relaxed font-mono">
              <p>System Standard: v4.0</p>
              <p>Status: Cloud Active</p>
            </div>
          </div>
        </aside>

        {/* Primary Workspace Panel */}
        <main className="flex-1 flex flex-col min-w-0">
          
          {/* Header Action Strip */}
          <header className="bg-white/85 dark:bg-[#0f0f0f] backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-20 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-emerald-400 border border-slate-200 dark:border-white/10 font-mono font-bold px-2.5 py-0.5 rounded uppercase tracking-widest">
                  Goal: {inputs.goalName || "Untitled"}
                </span>
              </div>
              <h2 className="text-lg lg:text-xl font-serif italic text-slate-950 dark:text-white tracking-tight mt-1.5">
                {activeTab === "dashboard" && "Portfolio Dashboard"}
                {activeTab === "calculator" && "Wealth Inputs Configuration"}
                {activeTab === "analytics" && "Growth Projection Engine"}
                {activeTab === "inflation" && "Historical & Future Inflation Comparing"}
                {activeTab === "reports" && "Benchmark Comparatives"}
                {activeTab === "faq" && "Investment Intelligence"}
                {activeTab === "developer" && "Developer Profile Panel"}
              </h2>
            </div>

            {/* Print and Share Toolbar buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleCopyReport}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white/90 text-xs font-semibold rounded-sm transition"
              >
                <Share2 size={13} />
                <span className="uppercase tracking-widest text-[10px]">{copied ? "Copied!" : "Copy Report"}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white/90 text-xs font-semibold rounded-sm transition"
              >
                <Printer size={13} />
                <span className="uppercase tracking-widest text-[10px]">Print PDF</span>
              </button>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto max-w-[1400px] w-full mx-auto">
            
            {/* Quick Stats Panel Header on top of all sheets */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-white/[0.02] dark:border-white/5 border-l-2 border-emerald-500/30 dark:border-l-emerald-400 pl-5 border border-slate-200 p-5 rounded-lg shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest">
                  Target Capital
                </span>
                <h3 className="text-lg lg:text-3xl font-serif tracking-tight text-slate-950 dark:text-[#f5f5f5] mt-1.5">
                  {formatCurrency(inputs.targetAmount, inputs.currency)}
                </h3>
              </div>
              <div className="bg-white dark:bg-white/[0.02] dark:border-white/5 border-l-2 border-emerald-500/30 dark:border-l-emerald-400 pl-5 border border-slate-200 p-5 rounded-lg shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest">
                  Initial Invested
                </span>
                <h3 className="text-lg lg:text-3xl font-serif tracking-tight text-slate-950 dark:text-[#f5f5f5] mt-1.5">
                  {formatCurrency(inputs.investment, inputs.currency)}
                </h3>
              </div>
              <div className="bg-white dark:bg-white/[0.02] dark:border-white/5 border-l-2 border-emerald-500/30 dark:border-l-emerald-400 pl-5 border border-slate-200 p-5 rounded-lg shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest">
                  Monthly Contribution
                </span>
                <h3 className="text-lg lg:text-3xl font-serif tracking-tight text-slate-950 dark:text-[#f5f5f5] mt-1.5">
                  {formatCurrency(inputs.monthlyContribution, inputs.currency)}
                </h3>
              </div>
              <div className="bg-white dark:bg-white/[0.02] dark:border-white/5 border-l-2 border-emerald-500/30 dark:border-l-emerald-400 pl-5 border border-slate-200 p-5 rounded-lg shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest">
                  Time Predicted
                </span>
                <h3 className="text-lg lg:text-3xl font-serif tracking-tight text-emerald-600 dark:text-emerald-400 mt-1.5">
                  {results.monthsNeeded === 3600
                    ? "unreachable"
                    : `${results.yearsNeeded}y ${results.remainingMonths}m`}
                </h3>
              </div>
            </div>

            {/* Error Panel if inputs are flawed */}
            {Object.keys(validationErrors).length > 0 && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex gap-3 text-xs text-rose-700 dark:text-rose-300">
                <FileWarning size={18} className="shrink-0 text-rose-500 mt-0.5" />
                <div>
                  <p className="font-bold mb-1">Please fix the input configuration issues:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {Object.values(validationErrors).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB INTERACTIVE SWAP */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                
                {/* VIEW 1: DASHBOARD */}
                {activeTab === "dashboard" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Analytics Chart, Results Dashboard */}
                    <div className="lg:col-span-2 space-y-8">
                      
                      {/* Interactive Realtime Summary Panel */}
                      <div className="bg-white dark:bg-[#0c0c0c] rounded-lg border border-slate-200 dark:border-white/10 p-6 lg:p-8 shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
                          <div>
                            <h3 className="text-base font-serif italic text-slate-900 dark:text-[#f5f5f5]">
                              Growth Target Prediction
                            </h3>
                            <p className="text-xs text-slate-400 dark:text-white/40 mt-1">
                              Target goal achievement trajectory with compounding calculations.
                            </p>
                          </div>
                          <span className="text-[10px] bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/60 font-mono uppercase tracking-wider px-3 py-1 rounded border border-slate-200/40 dark:border-white/5">
                            Start Period: {inputs.startDate}
                          </span>
                        </div>

                        {/* Chart Render */}
                        <div className="bg-slate-50 dark:bg-[#080808] p-4 rounded border border-slate-100 dark:border-white/5">
                          <AnalyticsChart projections={results.projections} currency={inputs.currency} />
                        </div>

                        {/* Summary breakdown row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                          <div className="p-4 bg-slate-50 dark:bg-white/[0.01] rounded border border-slate-200/50 dark:border-white/5 flex flex-col justify-between">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-white/40 tracking-widest block">
                                Final Forecast Val
                              </span>
                              <p className="text-lg lg:text-xl font-serif italic text-emerald-600 dark:text-emerald-400 mt-1.5">
                                {formatCurrency(results.finalAmount, inputs.currency)}
                              </p>
                            </div>
                            {inputs.inflationRate !== undefined && inputs.inflationRate > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 text-[10px] text-amber-500 font-mono">
                                Purchasing Power: {formatCurrency(results.realFinalAmount, inputs.currency)}
                              </div>
                            )}
                          </div>
                          
                          <div className="p-4 bg-slate-50 dark:bg-white/[0.01] rounded border border-slate-200/50 dark:border-white/5 flex flex-col justify-between">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-white/40 tracking-widest block">
                                Compounded Profits
                              </span>
                              <p className="text-lg lg:text-xl font-serif italic text-[#10b981] mt-1.5">
                                {formatCurrency(results.totalProfit, inputs.currency)}
                              </p>
                            </div>
                            {inputs.inflationRate !== undefined && inputs.inflationRate > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 text-[10px] text-amber-500 font-mono">
                                Real Gain: {formatCurrency(results.realProfit, inputs.currency)}
                              </div>
                            )}
                          </div>

                          <div className="p-4 bg-slate-50 dark:bg-white/[0.01] rounded border border-slate-200/50 dark:border-white/5 flex flex-col justify-between">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-white/40 tracking-widest block">
                                Absolute ROI / CAGR
                              </span>
                              <p className="text-lg lg:text-xl font-mono text-emerald-500 mt-1.5">
                                {results.roi.toFixed(1)}% / {results.cagr.toFixed(1)}%
                              </p>
                            </div>
                            {inputs.inflationRate !== undefined && inputs.inflationRate > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 text-[10px] text-amber-500 font-mono">
                                Real: {results.realRoi.toFixed(1)}% / {results.realCagr.toFixed(1)}%
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Goal completion progress card */}
                      <div className="bg-white dark:bg-[#0c0c0c] rounded-lg border border-slate-200 dark:border-white/10 p-6 lg:p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded">
                            <Award size={16} />
                          </div>
                          <h3 className="text-base font-serif italic text-slate-900 dark:text-white">
                            Wealth Milestone Tracker
                          </h3>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Current Capital Ratio:</span>
                            <span className="text-emerald-500 font-mono font-bold">{currentProgressPct.toFixed(1)}% achieved</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200/50 dark:border-white/5">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(currentProgressPct, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Interactive Grid Milestones */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {[
                            { value: 25, achieved: milestone25Achieved, label: "Starter (25%)" },
                            { value: 50, achieved: milestone50Achieved, label: "Halfway (50%)" },
                            { value: 75, achieved: milestone75Achieved, label: "Growth (75%)" },
                            { value: 100, achieved: milestone100Achieved, label: "Complete (100%)" },
                          ].map((milestone) => (
                            <div
                              key={milestone.value}
                              className={`p-4 rounded border text-center transition ${
                                milestone.achieved
                                  ? "bg-emerald-50/20 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20 text-slate-900 dark:text-[#f5f5f5]"
                                  : "bg-slate-50/50 dark:bg-white/[0.01] border-slate-100 dark:border-white/5 text-slate-400 dark:text-white/30"
                              }`}
                            >
                              <CheckCircle
                                size={16}
                                className={`mx-auto mb-2 ${milestone.achieved ? "text-emerald-500" : "text-slate-300 dark:text-white/10"}`}
                              />
                              <p className="text-[9px] font-extrabold uppercase tracking-widest">{milestone.label}</p>
                              <p className="text-xs font-medium mt-1">
                                {milestone.achieved ? "✅ Completed" : "⏳ Locked"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Calculator Inputs in brief */}
                    <div className="space-y-8">
                      
                      {/* Configuration Card */}
                      <div className="bg-white dark:bg-[#0c0c0c] rounded-lg border border-slate-200 dark:border-white/10 p-6 lg:p-8 shadow-sm space-y-6">
                        <div className="pb-4 border-b border-slate-100 dark:border-white/5">
                          <h3 className="text-base font-serif italic text-slate-900 dark:text-white flex items-center gap-2">
                            <SlidersHorizontal size={16} className="text-emerald-500" />
                            <span>Calculations Setup</span>
                          </h3>
                          <p className="text-xs text-slate-400 dark:text-white/40 mt-1">
                            Modify real-time inputs or switch calculations.
                          </p>
                        </div>

                        {/* Interactive Small Fields */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-white/40 tracking-widest mb-1.5">
                              Goal Name
                            </label>
                            <input
                              type="text"
                              value={inputs.goalName}
                              onChange={(e) => handleInputChange("goalName", e.target.value)}
                              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm outline-none transition text-slate-900 dark:text-[#f5f5f5]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-white/40 tracking-widest mb-1.5">
                              Initial Investment Sum
                            </label>
                            <input
                              type="number"
                              value={inputs.investment}
                              onChange={(e) => handleInputChange("investment", parseFloat(e.target.value) || 0)}
                              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm outline-none transition text-slate-900 dark:text-[#f5f5f5]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-white/40 tracking-widest mb-1.5">
                              Monthly Contribution (SIP)
                            </label>
                            <input
                              type="number"
                              value={inputs.monthlyContribution}
                              onChange={(e) => handleInputChange("monthlyContribution", parseFloat(e.target.value) || 0)}
                              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm outline-none transition text-slate-900 dark:text-[#f5f5f5]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-white/40 tracking-widest mb-1.5">
                              Target Wealth Limit
                            </label>
                            <input
                              type="number"
                              value={inputs.targetAmount}
                              onChange={(e) => handleInputChange("targetAmount", parseFloat(e.target.value) || 0)}
                              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm outline-none transition text-slate-900 dark:text-[#f5f5f5]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-white/40 tracking-widest mb-1.5">
                                Monthly Return (%)
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                value={inputs.monthlyRate}
                                onChange={(e) => handleInputChange("monthlyRate", parseFloat(e.target.value) || 0)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm outline-none transition text-slate-900 dark:text-[#f5f5f5]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-white/40 tracking-widest mb-1.5">
                                Currency
                              </label>
                              <select
                                value={inputs.currency}
                                onChange={(e) => handleInputChange("currency", e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs outline-none transition text-slate-700 dark:text-[#f5f5f5] cursor-pointer"
                              >
                                {CURRENCIES.map((c) => (
                                  <option key={c.code} value={c.code} className="bg-slate-100 dark:bg-[#0c0c0c] text-slate-900 dark:text-[#f5f5f5]">
                                    {c.flag} {c.code}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-white/40 tracking-widest">
                                Annual Inflation Rate (%)
                              </label>
                              {inputs.inflationRate !== undefined && inputs.inflationRate > 0 && (
                                <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/10">
                                  Real Values Active
                                </span>
                              )}
                            </div>
                            
                            {/* Preset Buttons for Inflation */}
                            <div className="grid grid-cols-6 gap-1 mb-2">
                              {[0, 2, 4, 6, 8, 10].map((rate) => {
                                const isSelected = (inputs.inflationRate ?? 0) === rate;
                                return (
                                  <button
                                    key={rate}
                                    type="button"
                                    onClick={() => handleInputChange("inflationRate", rate)}
                                    className={`py-1.5 text-[10px] font-mono font-bold rounded transition ${
                                      isSelected
                                        ? "bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20"
                                        : "bg-slate-100 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                                    }`}
                                  >
                                    {rate}%
                                  </button>
                                );
                              })}
                            </div>

                            <div className="relative">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="50"
                                value={inputs.inflationRate ?? 0}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  handleInputChange("inflationRate", isNaN(val) ? 0 : val);
                                }}
                                placeholder="Manual inflation % (e.g. 3.2)"
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs outline-none transition text-slate-900 dark:text-[#f5f5f5]"
                              />
                              <span className="absolute right-3.5 top-2.5 text-[10px] font-bold text-amber-500 font-mono">
                                % / year
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center gap-3">
                          <button
                            onClick={handleReset}
                            className="flex-1 py-2.5 text-center bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/10 rounded-sm text-[10px] uppercase tracking-wider font-bold text-slate-700 dark:text-white transition"
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => setActiveTab("calculator")}
                            className="flex-1 py-2.5 text-center bg-emerald-600 hover:bg-emerald-500 text-black rounded-sm text-[10px] uppercase tracking-wider font-bold transition shadow-md shadow-emerald-600/10"
                          >
                            Configure
                          </button>
                        </div>
                      </div>

                      {/* Timeline projection summary */}
                      <div className="bg-white dark:bg-[#0c0c0c] rounded-lg border border-slate-200 dark:border-white/10 p-6 lg:p-8 shadow-sm space-y-4">
                        <h4 className="text-[10px] font-bold uppercase text-slate-400 dark:text-white/40 tracking-widest">
                          Projection Completion
                        </h4>
                        
                        <div className="space-y-4">
                          <div className="flex gap-4 items-center">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 rounded">
                              <Calendar size={18} />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/30">Nominal Target Date</p>
                              <p className="text-base font-serif italic text-slate-900 dark:text-[#f5f5f5] mt-0.5">
                                {results.monthsNeeded === 1200 ? "Unreachable Goal" : results.completionDate}
                              </p>
                            </div>
                          </div>

                          {inputs.inflationRate !== undefined && inputs.inflationRate > 0 && (
                            <div className="flex gap-4 items-center border-t border-slate-100 dark:border-white/5 pt-3">
                              <div className="p-3 bg-amber-50 dark:bg-amber-500/5 text-amber-500 rounded">
                                <Calendar size={18} />
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-amber-400/80">Real Target Date (Purchasing Power Adjusted)</p>
                                <p className="text-base font-serif italic text-amber-500 mt-0.5">
                                  {results.realMonthsNeeded === 1200 ? "Unreachable (100+ Years)" : results.realCompletionDate}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="p-3.5 bg-slate-50 dark:bg-white/[0.01] rounded border border-slate-100 dark:border-white/5 text-[11px] text-slate-400/95 dark:text-white/60 leading-relaxed font-sans mt-2">
                          💡 <strong>Compounding Insight:</strong> In {results.monthsNeeded} months, your recurring SIP of{" "}
                          <span className="font-semibold text-slate-900 dark:text-[#f5f5f5]">{formatCurrency(inputs.monthlyContribution, inputs.currency)}</span> compounded at{" "}
                          <span className="font-semibold text-[#10b981]">{inputs.monthlyRate}%</span> monthly adds up to{" "}
                          <span className="font-semibold text-[#10b981] font-mono">{formatCurrency(results.finalAmount, inputs.currency)}</span>!
                          {inputs.inflationRate !== undefined && inputs.inflationRate > 0 && (
                            <div className="mt-2 text-amber-500 font-medium">
                              ⚠️ Due to {inputs.inflationRate}% annual inflation, it will take {results.realMonthsNeeded} months (~{(results.realMonthsNeeded / 12).toFixed(1)} years) of compounding to reach the equivalent purchasing power of {formatCurrency(inputs.targetAmount, inputs.currency)}.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* VIEW 2: FULL CONFIGURATION / CALCULATOR */}
                {activeTab === "calculator" && (
                  <div className="bg-white dark:bg-[#0c0c0c] rounded-lg border border-slate-200 dark:border-white/10 p-6 lg:p-8 shadow-sm space-y-8">
                    <div>
                      <h3 className="text-lg font-serif italic text-slate-900 dark:text-[#f5f5f5]">
                        Advanced Investment Formulation
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-white/40 mt-1">
                        Use this form to specify capital inputs, returns rates, target assets, and metadata parameters.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      
                      {/* Input fields with validation states */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-white/40 tracking-widest">
                          Goal Description
                        </label>
                        <input
                          type="text"
                          value={inputs.goalName}
                          onChange={(e) => handleInputChange("goalName", e.target.value)}
                          placeholder="e.g. Dream House Fund"
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm outline-none transition text-slate-900 dark:text-[#f5f5f5]"
                        />
                        <span className="text-[10px] text-slate-400/80 dark:text-white/30">Give this calculation a descriptive title.</span>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-white/40 tracking-widest">
                          Initial Investment Capital
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={inputs.investment}
                            onChange={(e) => handleInputChange("investment", parseFloat(e.target.value) || 0)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm outline-none transition text-slate-900 dark:text-[#f5f5f5]"
                          />
                          <span className="absolute left-3.5 top-3 text-xs text-slate-400 font-bold">
                            {getCurrencyConfig(inputs.currency).symbol}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400/80 dark:text-white/30">One-time initial capital deposit.</span>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-white/40 tracking-widest">
                          Monthly Contribution (SIP)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={inputs.monthlyContribution}
                            onChange={(e) => handleInputChange("monthlyContribution", parseFloat(e.target.value) || 0)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm outline-none transition text-slate-900 dark:text-[#f5f5f5]"
                          />
                          <span className="absolute left-3.5 top-3 text-xs text-slate-400 font-bold">
                            {getCurrencyConfig(inputs.currency).symbol}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400/80 dark:text-white/30">Monthly addition to the principal.</span>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-white/40 tracking-widest">
                          Target Wealth Capital Goal
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={inputs.targetAmount}
                            onChange={(e) => handleInputChange("targetAmount", parseFloat(e.target.value) || 0)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm outline-none transition text-slate-900 dark:text-[#f5f5f5]"
                          />
                          <span className="absolute left-3.5 top-3 text-xs text-slate-400 font-bold">
                            {getCurrencyConfig(inputs.currency).symbol}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400/80 dark:text-white/30">Goal target valuation.</span>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-white/40 tracking-widest">
                          Assumed Monthly Return (%)
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          value={inputs.monthlyRate}
                          onChange={(e) => handleInputChange("monthlyRate", parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm outline-none transition text-slate-900 dark:text-[#f5f5f5]"
                        />
                        <span className="text-[10px] text-slate-400/80 dark:text-white/30">Compound interest rate monthly.</span>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-white/40 tracking-widest">
                          Goal Start Date
                        </label>
                        <input
                          type="date"
                          value={inputs.startDate}
                          onChange={(e) => handleInputChange("startDate", e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm outline-none transition text-slate-700 dark:text-[#f5f5f5]"
                        />
                        <span className="text-[10px] text-slate-400/80 dark:text-white/30">Initial calculation compounding month starting point.</span>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-white/40 tracking-widest">
                          Annual Inflation Rate (%)
                        </label>
                        <div className="flex flex-col gap-2">
                          <div className="grid grid-cols-6 gap-1">
                            {[0, 2, 4, 6, 8, 10].map((rate) => {
                              const isSelected = (inputs.inflationRate ?? 0) === rate;
                              return (
                                <button
                                  key={rate}
                                  type="button"
                                  onClick={() => handleInputChange("inflationRate", rate)}
                                  className={`py-1 text-[10px] font-mono font-bold rounded transition ${
                                    isSelected
                                      ? "bg-amber-500 text-slate-950 shadow-sm"
                                      : "bg-slate-100 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                                  }`}
                                >
                                  {rate}%
                                </button>
                              );
                            })}
                          </div>
                          
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="50"
                              value={inputs.inflationRate ?? 0}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                handleInputChange("inflationRate", isNaN(val) ? 0 : val);
                              }}
                              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm outline-none transition text-slate-900 dark:text-[#f5f5f5]"
                              placeholder="Manual entry..."
                            />
                            <span className="absolute right-3.5 top-3 text-[10px] font-bold text-amber-500 font-mono">
                              % / year
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400/80 dark:text-white/30">Discount results and timeline for currency devaluation.</span>
                      </div>
                    </div>

                    {/* Submit / actions strip */}
                    <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                          onClick={handleReset}
                          className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/10 rounded-sm text-[10px] uppercase tracking-wider font-bold transition text-slate-700 dark:text-white"
                        >
                          Reset Default Parameters
                        </button>
                      </div>

                      <button
                        onClick={() => setActiveTab("dashboard")}
                        className="w-full sm:w-auto px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black rounded-sm text-[10px] uppercase tracking-wider font-bold transition shadow-lg shadow-emerald-600/10"
                      >
                        Calculate Trajectory
                      </button>
                    </div>
                  </div>
                )}

                {/* VIEW 3: GROWTH PROJECTION ENGINE (ANALYTICS) */}
                {activeTab === "analytics" && (
                  <div className="space-y-8">
                    
                    {/* SVG Chart Panel */}
                    <div className="bg-white dark:bg-[#0c0c0c] rounded-lg border border-slate-200 dark:border-white/10 p-6 lg:p-8 shadow-sm space-y-6">
                      <div>
                        <h3 className="text-lg font-serif italic text-slate-900 dark:text-white">
                          Growth Projections Trajectory
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-white/40 mt-1">
                          Visually compare your direct cumulative contributions (dashed line) against the compounding interest curve (solid line).
                        </p>
                      </div>

                      <div className="bg-slate-50 dark:bg-[#080808] p-4 rounded border border-slate-100 dark:border-white/5">
                        <AnalyticsChart projections={results.projections} currency={inputs.currency} />
                      </div>
                    </div>

                    {/* Detailed Data Tables */}
                    <div className="bg-white dark:bg-[#0c0c0c] rounded-lg border border-slate-200 dark:border-white/10 p-6 lg:p-8 shadow-sm space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h3 className="text-base font-serif italic text-slate-900 dark:text-white">
                            Historical Projection Matrix
                          </h3>
                          <p className="text-xs text-slate-400 dark:text-white/40 mt-1">
                            A month-by-month financial projection table showing compound increments.
                          </p>
                        </div>

                        <button
                          onClick={handleExportCSV}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-widest rounded-sm transition shadow-md shadow-emerald-600/10"
                        >
                          <Download size={13} />
                          <span>Export CSV Dataset</span>
                        </button>
                      </div>

                      {/* Projections Table Scrollable Container */}
                      <div className="overflow-x-auto border border-slate-200 dark:border-white/10 rounded-lg">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-[#080808] text-slate-400 dark:text-white/40 uppercase tracking-widest font-bold font-mono border-b border-slate-200 dark:border-white/10">
                              <th className="py-3 px-6 text-center">Month</th>
                              <th className="py-3 px-6">Predicted Date</th>
                              <th className="py-3 px-6 text-right">Cumulative Capital</th>
                              <th className="py-3 px-6 text-right">Accumulated Gain</th>
                              <th className="py-3 px-6 text-right">Forecasted Balance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                            {results.projections.slice(0, 100).map((proj) => (
                              <tr key={proj.month} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                                <td className="py-3 px-6 text-center text-slate-400 font-mono">{proj.month}</td>
                                <td className="py-3 px-6 text-slate-500 dark:text-white/60 font-sans">{proj.dateStr}</td>
                                <td className="py-3 px-6 text-right text-slate-500 dark:text-white/60 font-mono">
                                  {formatCurrency(proj.contributions, inputs.currency)}
                                </td>
                                <td className="py-3 px-6 text-right text-emerald-600 dark:text-emerald-400 font-mono">
                                  {formatCurrency(proj.profit, inputs.currency)}
                                </td>
                                <td className="py-3 px-6 text-right text-emerald-500 font-bold font-mono">
                                  {formatCurrency(proj.balance, inputs.currency)}
                                </td>
                              </tr>
                            ))}
                            {results.projections.length > 100 && (
                              <tr>
                                <td colSpan={5} className="py-4 text-center text-slate-400 dark:text-white/30 italic">
                                  Showing the first 100 compounding periods of {results.projections.length} periods. Click 'Export CSV Dataset' to save all periods!
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* VIEW: INFLATION COMPARING */}
                {activeTab === "inflation" && (
                  <div className="space-y-8 animate-fade-in">
                    
                    {/* Setup Card */}
                    <div className="bg-white dark:bg-[#0c0c0c] rounded-lg border border-slate-200 dark:border-white/10 p-6 lg:p-8 shadow-sm space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-serif italic text-slate-900 dark:text-white">
                            Inflation Comparison Configurator
                          </h3>
                          <p className="text-xs text-slate-400 dark:text-white/40 mt-1">
                            Set your base currency amount and annual inflation rate to calculate real purchasing power retrospectively and prospectively.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setInflationCompareAmount(inputs.targetAmount);
                            setInflationCompareRate(inputs.inflationRate || 3.0);
                          }}
                          className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest rounded-sm border border-amber-500/20 transition flex items-center gap-2 font-mono"
                        >
                          <RefreshCw size={12} />
                          <span>Sync with Main Goal</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {/* Amount Entry */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-white/40 tracking-widest">
                            Base Value to Compare ({inputs.currency})
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              value={inflationCompareAmount}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setInflationCompareAmount(isNaN(val) ? 0 : val);
                              }}
                              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm outline-none transition text-slate-900 dark:text-[#f5f5f5] font-mono"
                            />
                            <span className="absolute right-3.5 top-3 text-[11px] font-bold text-amber-500 font-mono">
                              {inputs.currency}
                            </span>
                          </div>
                        </div>

                        {/* Inflation Rate Entry */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-white/40 tracking-widest">
                            Annual Inflation Rate (%)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              max="100"
                              value={inflationCompareRate}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setInflationCompareRate(isNaN(val) ? 0 : val);
                              }}
                              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm outline-none transition text-slate-900 dark:text-[#f5f5f5] font-mono"
                            />
                            <span className="absolute right-3.5 top-3 text-[11px] font-bold text-amber-500 font-mono">
                              % / year
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dual Side-by-Side Panels */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      
                      {/* LEFT SIDE: PAST INFLATION COMPARISON */}
                      <div className="bg-white dark:bg-[#0c0c0c] rounded-lg border border-slate-200 dark:border-white/10 p-6 lg:p-8 shadow-sm flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300">
                              ⏪
                            </div>
                            <div>
                              <h4 className="text-base font-serif italic text-slate-900 dark:text-white">
                                Historical Equivalent (Past Value Ago)
                              </h4>
                              <p className="text-xs text-slate-400 dark:text-white/40">
                                See what today's {formatCurrency(inflationCompareAmount, inputs.currency)} was worth up to 100 years ago.
                              </p>
                            </div>
                          </div>

                          {/* 20 Preset Buttons (5 to 100 years ago) */}
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-white/40 tracking-widest">
                              Select Past Timeline (20 options)
                            </label>
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                              {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100].map((yr) => {
                                const isSelected = pastCompareYears === yr;
                                return (
                                  <button
                                    key={yr}
                                    type="button"
                                    onClick={() => setPastCompareYears(yr)}
                                    className={`py-2 text-[10px] font-mono font-bold rounded transition ${
                                      isSelected
                                        ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                                        : "bg-slate-50 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                                    }`}
                                  >
                                    {yr} Yrs Ago
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Manual entry / slider */}
                          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest text-[9px]">
                                Manual Past Year Entry
                              </span>
                              <span className="font-mono text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                                {pastCompareYears} Years Ago
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <input
                                type="range"
                                min="1"
                                max="150"
                                value={pastCompareYears}
                                onChange={(e) => setPastCompareYears(parseInt(e.target.value))}
                                className="flex-1 accent-amber-500 animate-none"
                              />
                              <input
                                type="number"
                                min="1"
                                max="200"
                                value={pastCompareYears}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  setPastCompareYears(isNaN(val) ? 1 : val);
                                }}
                                className="w-16 px-2 py-1 text-xs text-center font-mono font-bold bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-amber-500 outline-none text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Calculation outcomes panel */}
                        <div className="p-5 bg-slate-50 dark:bg-black/35 rounded-lg border border-slate-200/40 dark:border-white/5 space-y-4">
                          <div className="text-center py-2">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest block">
                              Historical Equivalent Cost
                            </span>
                            <div className="text-2xl lg:text-3xl font-serif italic text-amber-500 mt-1">
                              {formatCurrency(
                                inflationCompareAmount / Math.pow(1 + inflationCompareRate / 100, pastCompareYears),
                                inputs.currency
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400/80 mt-1 block">
                              equivalent purchasing power in the year {new Date().getFullYear() - pastCompareYears}
                            </span>
                          </div>

                          <div className="border-t border-slate-200/50 dark:border-white/5 pt-3 space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-sans">Cumulative Inflation Factor:</span>
                              <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                                {Math.pow(1 + inflationCompareRate / 100, pastCompareYears).toFixed(2)}x
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-sans">Past Purchasing Power Value:</span>
                              <span className="font-mono font-bold text-emerald-500">
                                +{((Math.pow(1 + inflationCompareRate / 100, pastCompareYears) - 1) * 100).toFixed(1)}% higher today
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed pt-2 text-justify border-t border-dashed border-slate-200/40 dark:border-white/5 font-sans">
                              💡 <strong>Past Comparison Insight:</strong> If you wanted to purchase goods that cost <strong>{formatCurrency(inflationCompareAmount, inputs.currency)}</strong> today, those exact same goods would have cost only <strong>{formatCurrency(inflationCompareAmount / Math.pow(1 + inflationCompareRate / 100, pastCompareYears), inputs.currency)}</strong> in the year {new Date().getFullYear() - pastCompareYears}, assuming an average constant annual inflation rate of <strong>{inflationCompareRate}%</strong>.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT SIDE: FUTURE INFLATION COMPARISON */}
                      <div className="bg-white dark:bg-[#0c0c0c] rounded-lg border border-slate-200 dark:border-white/10 p-6 lg:p-8 shadow-sm flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300">
                              ⏩
                            </div>
                            <div>
                              <h4 className="text-base font-serif italic text-slate-900 dark:text-white">
                                Future Horizon (Value Later)
                              </h4>
                              <p className="text-xs text-slate-400 dark:text-white/40">
                                See what today's {formatCurrency(inflationCompareAmount, inputs.currency)} is worth up to 100 years in the future.
                              </p>
                            </div>
                          </div>

                          {/* 20 Preset Buttons (5 to 100 years later) */}
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-white/40 tracking-widest">
                              Select Future Timeline (20 options)
                            </label>
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                              {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100].map((yr) => {
                                const isSelected = futureCompareYears === yr;
                                return (
                                  <button
                                    key={yr}
                                    type="button"
                                    onClick={() => setFutureCompareYears(yr)}
                                    className={`py-2 text-[10px] font-mono font-bold rounded transition ${
                                      isSelected
                                        ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                                        : "bg-slate-50 dark:bg-white/5 border border-slate-200/40 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                                    }`}
                                  >
                                    {yr} Yrs Later
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Manual entry / slider */}
                          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest text-[9px]">
                                Manual Future Year Entry
                              </span>
                              <span className="font-mono text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
                                {futureCompareYears} Years Later
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <input
                                type="range"
                                min="1"
                                max="150"
                                value={futureCompareYears}
                                onChange={(e) => setFutureCompareYears(parseInt(e.target.value))}
                                className="flex-1 accent-amber-500 animate-none"
                              />
                              <input
                                type="number"
                                min="1"
                                max="200"
                                value={futureCompareYears}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  setFutureCompareYears(isNaN(val) ? 1 : val);
                                }}
                                className="w-16 px-2 py-1 text-xs text-center font-mono font-bold bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded focus:border-amber-500 outline-none text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Calculation outcomes panel */}
                        <div className="p-5 bg-slate-50 dark:bg-black/35 rounded-lg border border-slate-200/40 dark:border-white/5 space-y-4">
                          <div className="text-center py-2">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest block">
                              Future Nominal Cost of Same Goods
                            </span>
                            <div className="text-2xl lg:text-3xl font-serif italic text-amber-500 mt-1">
                              {formatCurrency(
                                inflationCompareAmount * Math.pow(1 + inflationCompareRate / 100, futureCompareYears),
                                inputs.currency
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400/80 mt-1 block">
                              needed to buy the same value of goods in the year {new Date().getFullYear() + futureCompareYears}
                            </span>
                          </div>

                          <div className="border-t border-slate-200/50 dark:border-white/5 pt-3 space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-sans">Future Cash Purchasing Power:</span>
                              <span className="font-mono font-bold text-red-500">
                                {formatCurrency(
                                  inflationCompareAmount / Math.pow(1 + inflationCompareRate / 100, futureCompareYears),
                                  inputs.currency
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-sans">Total Purchasing Power Loss:</span>
                              <span className="font-mono font-bold text-red-500">
                                -{((1 - 1 / Math.pow(1 + inflationCompareRate / 100, futureCompareYears)) * 100).toFixed(1)}% devalued
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed pt-2 text-justify border-t border-dashed border-slate-200/40 dark:border-white/5 font-sans">
                              💡 <strong>Future Comparison Insight:</strong> Keeping <strong>{formatCurrency(inflationCompareAmount, inputs.currency)}</strong> as raw idle cash for {futureCompareYears} years will cause its real value to drop to <strong>{formatCurrency(inflationCompareAmount / Math.pow(1 + inflationCompareRate / 100, futureCompareYears), inputs.currency)}</strong>. Conversely, to purchase what costs <strong>{formatCurrency(inflationCompareAmount, inputs.currency)}</strong> today, you will need to spend <strong>{formatCurrency(inflationCompareAmount * Math.pow(1 + inflationCompareRate / 100, futureCompareYears), inputs.currency)}</strong> in the year {new Date().getFullYear() + futureCompareYears}.
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* VIEW 4: COMPARATIVE MATRIX */}
                {activeTab === "reports" && (
                  <div className="bg-white dark:bg-[#0c0c0c] rounded-lg border border-slate-200 dark:border-white/10 p-6 lg:p-8 shadow-sm space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-serif italic text-slate-900 dark:text-white">
                          Compounding Benchmarks
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-white/40 mt-1">
                          Select predefined return rate brackets or customize each individual rate directly in the table below to see how varying rates reach your target wealth goal.
                        </p>
                      </div>
                    </div>

                    {/* Bracket Preset Selector Buttons */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest block">
                        Select Return Rate Bracket (Preset)
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {rateBrackets.map((bracket) => {
                          const isActive = activeBracket === bracket.id;
                          return (
                            <button
                              key={bracket.id}
                              onClick={() => {
                                setComparisonRates(bracket.values);
                                setActiveBracket(bracket.id);
                              }}
                              className={`px-4 py-2 rounded-md text-xs font-semibold tracking-wider transition ${
                                isActive
                                  ? "bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/10"
                                  : "bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                              }`}
                            >
                              {bracket.label}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => {
                            setActiveBracket("custom");
                          }}
                          className={`px-4 py-2 rounded-md text-xs font-semibold tracking-wider transition border ${
                            activeBracket === "custom"
                              ? "border-emerald-500 text-emerald-500 bg-emerald-500/5 font-bold"
                              : "border-dashed border-slate-300 dark:border-white/10 text-slate-400 hover:text-slate-500"
                          }`}
                        >
                          Custom Matrix
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 dark:border-white/10 rounded-lg">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-[#080808] text-slate-400 dark:text-white/40 uppercase tracking-widest font-bold font-mono border-b border-slate-200 dark:border-white/10">
                            <th className="py-3 px-6">Varying Monthly Rate (Editable)</th>
                            <th className="py-3 px-6 text-center">Months Needed</th>
                            <th className="py-3 px-6 text-center">Duration Prediction</th>
                            <th className="py-3 px-6 text-right">Forecast Value reached</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                          {comparisonRates.map((rate, idx) => {
                            const compResults = calculateWealthProjection({
                              ...inputs,
                              monthlyRate: rate,
                            });
                            return (
                              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                                <td className="py-4 px-6 text-slate-800 dark:text-slate-200">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      max="100"
                                      value={rate}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        const nextRates = [...comparisonRates];
                                        nextRates[idx] = isNaN(val) ? 0 : val;
                                        setComparisonRates(nextRates);
                                        setActiveBracket("custom");
                                      }}
                                      className="w-20 px-2 py-1 text-xs font-mono font-bold text-center border border-slate-300 dark:border-white/20 bg-white dark:bg-black/50 text-emerald-600 dark:text-emerald-400 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                    <span className="text-slate-400 font-medium">% monthly rate</span>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-center font-mono">
                                  {compResults.monthsNeeded === 3600 ? "Unreachable" : compResults.monthsNeeded}
                                </td>
                                <td className="py-4 px-6 text-center text-slate-500 dark:text-white/60">
                                  {compResults.monthsNeeded === 3600
                                    ? "N/A"
                                    : `${compResults.yearsNeeded} Years, ${compResults.remainingMonths} Months`}
                                </td>
                                <td className="py-4 px-6 text-right text-emerald-500 font-bold font-mono">
                                  {formatCurrency(compResults.finalAmount, inputs.currency)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-5 bg-slate-50 dark:bg-white/[0.01] rounded border border-slate-200/50 dark:border-white/5">
                      <h4 className="text-sm font-serif italic text-slate-900 dark:text-white mb-2">
                        Benchmark Analysis Summary
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-white/50 leading-relaxed">
                        Compounding growth reacts strongly to small incremental differences in rates.
                        {(() => {
                          const sortedRates = [...comparisonRates].sort((a, b) => a - b);
                          const minRate = sortedRates[0] ?? 1.0;
                          const maxRate = sortedRates[sortedRates.length - 1] ?? 5.0;

                          const minResults = calculateWealthProjection({ ...inputs, monthlyRate: minRate });
                          const maxResults = calculateWealthProjection({ ...inputs, monthlyRate: maxRate });

                          return (
                            <span>
                              {" "}By selecting a higher compounding rate of <strong className="text-emerald-400 font-serif italic">{maxRate.toFixed(1)}%</strong>,
                              your predicted duration to target is <span className="font-mono text-emerald-400 font-semibold">{maxResults.monthsNeeded === 3600 ? "unreachable" : `${maxResults.monthsNeeded} months`}</span> compared
                              to <span className="font-mono text-slate-400 font-semibold">{minResults.monthsNeeded === 3600 ? "unreachable" : `${minResults.monthsNeeded} months`}</span> if
                              compounding rate is at <strong className="text-slate-400 font-serif italic">{minRate.toFixed(1)}%</strong>.
                              {minResults.monthsNeeded !== 3600 && maxResults.monthsNeeded !== 3600 && (
                                <span> A difference of <strong className="text-emerald-300 font-mono">{Math.abs(minResults.monthsNeeded - maxResults.monthsNeeded)} months</strong> (~{Math.abs(minResults.yearsNeeded - maxResults.yearsNeeded)} years) in your timeline!</span>
                              )}
                            </span>
                          );
                        })()}
                      </p>
                    </div>
                  </div>
                )}

                {/* VIEW 5: FAQS */}
                {activeTab === "faq" && (
                  <div className="bg-white dark:bg-[#0c0c0c] rounded-lg border border-slate-200 dark:border-white/10 p-6 lg:p-8 shadow-sm space-y-8">
                    <div>
                      <h3 className="text-lg font-serif italic text-slate-900 dark:text-white">
                        Investment Intelligence FAQs
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-white/40 mt-1">
                        Quick financial insights on compound rates and target planning.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {[
                        {
                          q: "What is a Monthly Contribution (SIP)?",
                          a: "Systematic Investment Plan (SIP) means contributing a fixed capital amount consistently on a monthly basis, which helps build disciplined habits and triggers monthly compounding returns.",
                        },
                        {
                          q: "How are compound interest returns calculated here?",
                          a: "At the end of each month, interest is calculated based on the previous month's ending balance (interest = balance * rate), added to the principal, and then your monthly contribution is deposited.",
                        },
                        {
                          q: "Is CAGR or absolute ROI more important?",
                          a: "CAGR represents the annualized rate of return, taking time into account, making it a better comparative metric across different portfolios over multiple years. ROI is the absolute multiplier.",
                        },
                        {
                          q: "Can I print this report for financial consultations?",
                          a: "Yes! Click 'Print PDF' at the top right to generate a pristine, print-optimized report containing all projection trajectories and targets.",
                        },
                      ].map((faq, i) => (
                        <div
                          key={i}
                          className="p-5 bg-slate-50 dark:bg-white/[0.01] border border-slate-200/50 dark:border-white/5 rounded"
                        >
                          <h4 className="text-sm font-serif italic text-slate-950 dark:text-[#f5f5f5] mb-2">
                            {faq.q}
                          </h4>
                          <p className="text-xs text-slate-400 dark:text-white/50 leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* VIEW 6: DEVELOPER PROFILE */}
                {activeTab === "developer" && (
                  <div className="bg-white dark:bg-[#0c0c0c] rounded-lg border border-slate-200 dark:border-white/10 p-6 lg:p-8 shadow-sm space-y-8">
                    <div className="text-center max-w-xl mx-auto space-y-4">
                      <div className="w-14 h-14 bg-emerald-500 rounded-sm mx-auto flex items-center justify-center text-black text-xl font-bold shadow-lg italic">
                        WP
                      </div>
                      <div>
                        <h3 className="text-lg font-serif italic text-slate-900 dark:text-white">
                          Ultimate Wealth Pro Dev Team
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-white/40 mt-1">
                          Crafting highly refined computational finance applications. Let's connect on any platforms below!
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                      {[
                        {
                          name: "WhatsApp",
                          label: "Direct Chat",
                          icon: <MessageSquare size={18} />,
                          link: "https://wa.me/",
                        },
                        {
                          name: "Telegram",
                          label: "Developer Channel",
                          icon: <Send size={18} />,
                          link: "https://t.me/ssb100million",
                        },
                        {
                          name: "LinkedIn",
                          label: "Professional Profile",
                          icon: <Linkedin size={18} />,
                          link: "https://www.linkedin.com/in/",
                        },
                        {
                          name: "Twitter (X)",
                          label: "Financial Updates",
                          icon: <Twitter size={18} />,
                          link: "https://twitter.com/ghoshrahul4455",
                        },
                        {
                          name: "Website",
                          label: "Personal Portfolio",
                          icon: <Globe size={18} />,
                          link: "https://yourwebsite.com",
                        },
                        {
                          name: "Contact Email",
                          label: "Direct Inquiry",
                          icon: <Mail size={18} />,
                          link: "mailto:ghoshrahul4455@gmail.com",
                        },
                      ].map((plat) => (
                        <a
                          key={plat.name}
                          href={plat.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-5 rounded border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01] flex items-center gap-4 hover:-translate-y-0.5 hover:border-emerald-500/30 transition-all duration-300"
                        >
                          <div className="p-2.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-emerald-500 shadow-sm">
                            {plat.icon}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-[#f5f5f5]">{plat.name}</p>
                            <p className="text-[10px] text-slate-400 dark:text-white/40">{plat.label}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* General Policy Disclaimer Card */}
            <footer className="p-5 bg-amber-500/5 dark:bg-amber-500/5 rounded border border-amber-500/20 flex gap-3 text-[11px] text-slate-500 dark:text-white/50 leading-relaxed font-sans">
              <FileWarning size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p>
                <strong>Investment Disclaimer:</strong> Wealth projections provided by Ultimate Wealth Calculator Pro are estimates modeled on compound interest formulations. Actual market investments fluctuate dynamically based on market performance, taxation, capital fees, and specific asset risks. Always perform professional financial consultations.
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
