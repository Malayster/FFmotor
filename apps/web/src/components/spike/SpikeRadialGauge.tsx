import React from "react";
import { Gauge, AlertTriangle, CheckCircle2 } from "lucide-react";

interface SpikeRadialGaugeProps {
  label?: string;
  value: number; // 0 to 100
  displayValue?: string;
  subLabel?: string;
  target?: string | number;
  variant?: "red" | "white" | "emerald";
  size?: number;
  title?: string;
  subtitle?: string;
  unit?: string;
  color?: string;
}

export const SpikeRadialGauge: React.FC<SpikeRadialGaugeProps> = ({
  label,
  value,
  displayValue,
  subLabel,
  target,
  variant = "red",
  size = 120,
}) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  const colorMap = {
    red: { stroke: "#dc2626", glow: "rgba(220, 38, 38, 0.4)", text: "text-red-500", badge: "bg-red-600 text-white" },
    white: { stroke: "#ffffff", glow: "rgba(255, 255, 255, 0.4)", text: "", badge: "bg-white text-black font-black" },
    emerald: { stroke: "#10b981", glow: "rgba(16, 185, 129, 0.4)", text: "text-emerald-400", badge: "bg-zinc-950 text-white font-black" },
  };

  const currentTheme = colorMap[variant];

  return (
    <div className="spike-card p-4 flex items-center justify-between gap-4 group hover:border-red-600 transition-all duration-300">
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">
          {label}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black font-mono">{displayValue}</span>
          {target && <span className="text-xs text-zinc-500">/ {target}</span>}
        </div>
        {subLabel && <p className="text-[10px] text-zinc-400 mt-0.5">{subLabel}</p>}
      </div>

      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#27272a"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={currentTheme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: "stroke-dashoffset 0.8s ease-in-out",
              filter: `drop-shadow(0 0 6px ${currentTheme.glow})`,
            }}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-base font-black font-mono leading-none ${currentTheme.text}`}>
            {value}%
          </span>
          <span className="text-[8px] font-mono text-zinc-500 uppercase mt-0.5">SLA</span>
        </div>
      </div>
    </div>
  );
};

