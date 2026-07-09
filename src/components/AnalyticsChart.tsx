import React, { useState, useRef, useEffect } from "react";
import { MonthlyProjection } from "../types";
import { formatCurrency } from "../utils/helpers";

interface AnalyticsChartProps {
  projections: MonthlyProjection[];
  currency: string;
}

export default function AnalyticsChart({ projections, currency }: AnalyticsChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 320 });

  // Handle ResizeObserver to make the canvas fluid and responsive
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(width, 300),
          height: Math.max(height, 260),
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  if (!projections || projections.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-900/40 text-slate-400">
        No projection data available
      </div>
    );
  }

  // Downsample projections to max 50 points if too large, to keep SVG light and readable
  const maxPoints = 60;
  const step = Math.max(1, Math.floor(projections.length / maxPoints));
  const points: MonthlyProjection[] = [];
  for (let i = 0; i < projections.length; i += step) {
    points.push(projections[i]);
  }
  // Ensure the last element is always included
  if (projections.length > 1 && (projections.length - 1) % step !== 0) {
    points.push(projections[projections.length - 1]);
  }

  const padding = { top: 20, right: 20, bottom: 40, left: 75 };
  const graphWidth = dimensions.width - padding.left - padding.right;
  const graphHeight = dimensions.height - padding.top - padding.bottom;

  // Find max value for Y-axis scaling
  const maxBalance = Math.max(...points.map((p) => p.balance), 100);
  const minBalance = 0;
  const yRange = maxBalance - minBalance;

  // Coordinate conversion helpers
  const getX = (index: number) => {
    if (points.length <= 1) return padding.left;
    return padding.left + (index / (points.length - 1)) * graphWidth;
  };

  const getY = (val: number) => {
    return padding.top + graphHeight - ((val - minBalance) / yRange) * graphHeight;
  };

  // Generate SVG Path for Balance Line
  const balancePoints = points.map((p, idx) => `${getX(idx)},${getY(p.balance)}`);
  const balancePath = `M ${balancePoints.join(" L ")}`;

  // Determine if inflation is present and needs to be drawn
  const showInflationLine = points.some((p) => p.adjustedBalance !== undefined && p.adjustedBalance < p.balance - 1);

  // Generate SVG Path for Inflation-Adjusted Real Balance Line
  const realBalancePoints = points.map((p, idx) => `${getX(idx)},${getY(p.adjustedBalance ?? p.balance)}`);
  const realBalancePath = `M ${realBalancePoints.join(" L ")}`;

  // Generate Area Path (for gradient fill)
  const balanceAreaPath = points.length > 0
    ? `${balancePath} L ${getX(points.length - 1)},${padding.top + graphHeight} L ${getX(0)},${padding.top + graphHeight} Z`
    : "";

  // Generate Path for Contributions Line (straight-ish/stepped line)
  const contrPoints = points.map((p, idx) => `${getX(idx)},${getY(p.contributions)}`);
  const contrPath = `M ${contrPoints.join(" L ")}`;

  // Handle Mouse Hover Event on Graph
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - padding.left;

    if (x < 0 || x > graphWidth) {
      setHoverIndex(null);
      return;
    }

    const pct = x / graphWidth;
    const idx = Math.min(
      points.length - 1,
      Math.max(0, Math.round(pct * (points.length - 1)))
    );

    setHoverIndex(idx);
    setTooltipPos({
      x: getX(idx) + 12,
      y: Math.min(getY(points[idx].balance) - 20, dimensions.height - 120),
    });
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Generate Y-axis labels (5 levels)
  const yTicksCount = 5;
  const yTicks = Array.from({ length: yTicksCount }, (_, i) => {
    const val = minBalance + (yRange * i) / (yTicksCount - 1);
    return { val, y: getY(val) };
  });

  // Generate X-axis labels (5 levels maximum)
  const xTicksCount = Math.min(points.length, 5);
  const xTicksIndices = Array.from({ length: xTicksCount }, (_, i) =>
    Math.round((i * (points.length - 1)) / (xTicksCount - 1))
  );

  return (
    <div ref={containerRef} className="w-full h-[320px] relative select-none">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="overflow-visible cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid Lines - Horizontal */}
        {yTicks.map((tick, i) => (
          <g key={`y-grid-${i}`} className="opacity-10">
            <line
              x1={padding.left}
              y1={tick.y}
              x2={dimensions.width - padding.right}
              y2={tick.y}
              stroke="#ffffff"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            {/* Y Tick Label */}
            <text
              x={padding.left - 10}
              y={tick.y + 4}
              fill="#94a3b8"
              fontSize="11"
              className="font-mono"
              textAnchor="end"
            >
              {formatCurrency(tick.val, currency)}
            </text>
          </g>
        ))}

        {/* X Tick Labels */}
        {xTicksIndices.map((idx, i) => {
          const pt = points[idx];
          if (!pt) return null;
          return (
            <text
              key={`x-tick-${i}`}
              x={getX(idx)}
              y={dimensions.height - padding.bottom + 20}
              fill="#94a3b8"
              fontSize="11"
              className="font-sans"
              textAnchor="middle"
            >
              {pt.dateStr}
            </text>
          );
        })}

        {/* Shaded Area of Portfolio Growth */}
        <path d={balanceAreaPath} fill="url(#balanceGrad)" />

        {/* Contributions Line (Dashed Slate) */}
        <path
          d={contrPath}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeDasharray="5 5"
          className="opacity-40"
        />

        {/* Real Balance Line (Inflation-adjusted Purchasing Power - Amber) */}
        {showInflationLine && (
          <path
            d={realBalancePath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeDasharray="4 3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90"
          />
        )}

        {/* Portfolio Balance Line (Glowing Emerald) */}
        <path
          d={balancePath}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* Hover Highlight Marker */}
        {hoverIndex !== null && points[hoverIndex] && (
          <g>
            <line
              x1={getX(hoverIndex)}
              y1={padding.top}
              x2={getX(hoverIndex)}
              y2={dimensions.height - padding.bottom}
              stroke="#10b981"
              strokeWidth="1"
              className="opacity-40"
            />
            {/* Balance dot */}
            <circle
              cx={getX(hoverIndex)}
              cy={getY(points[hoverIndex].balance)}
              r="6"
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="2"
            />
            {/* Real balance dot */}
            {showInflationLine && (
              <circle
                cx={getX(hoverIndex)}
                cy={getY(points[hoverIndex].adjustedBalance ?? points[hoverIndex].balance)}
                r="5"
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth="2"
              />
            )}
            {/* Contribution dot */}
            <circle
              cx={getX(hoverIndex)}
              cy={getY(points[hoverIndex].contributions)}
              r="4.5"
              fill="#94a3b8"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          </g>
        )}
      </svg>

      {/* Interactive Tooltip Card overlay */}
      {hoverIndex !== null && points[hoverIndex] && (
        <div
          className="absolute z-20 bg-black/95 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-md pointer-events-none transition-all duration-75 text-xs text-white leading-relaxed font-sans"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
          }}
        >
          <p className="font-semibold text-emerald-400 mb-1.5 border-b border-white/5 pb-1 font-serif italic text-sm">
            {points[hoverIndex].dateStr} (Month {points[hoverIndex].month})
          </p>
          <div className="flex justify-between gap-6 mb-1 font-mono">
            <span className="text-white/60 font-sans">Portfolio Value:</span>
            <span className="font-semibold text-emerald-400">
              {formatCurrency(points[hoverIndex].balance, currency)}
            </span>
          </div>
          {showInflationLine && (
            <div className="flex justify-between gap-6 mb-1 font-mono">
              <span className="text-amber-400 font-sans">Purchasing Power (Real):</span>
              <span className="font-semibold text-amber-400">
                {formatCurrency(points[hoverIndex].adjustedBalance ?? points[hoverIndex].balance, currency)}
              </span>
            </div>
          )}
          <div className="flex justify-between gap-6 mb-1 font-mono">
            <span className="text-white/60 font-sans">Invested Capital:</span>
            <span className="font-medium text-slate-300">
              {formatCurrency(points[hoverIndex].contributions, currency)}
            </span>
          </div>
          <div className="flex justify-between gap-6 font-mono">
            <span className="text-white/60 font-sans">Compounded Gain:</span>
            <span className="font-medium text-emerald-300">
              {formatCurrency(points[hoverIndex].profit, currency)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
