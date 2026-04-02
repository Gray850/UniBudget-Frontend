import React, { useContext } from "react";
import { ThemeContext } from "../App";

export default function ScenarioSlider({ label, min, max, step = 1, value, onChange, unit = "£" }) {
  const { isDark, theme } = useContext(ThemeContext);
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-gray-600"}`}>{label}</span>
        <span className={`text-sm font-bold tabular-nums ${isDark ? "text-white" : "text-gray-900"}`}>{unit}{value.toLocaleString()}</span>
      </div>

      <div className={`relative w-full h-2 rounded-full ${isDark ? "bg-slate-800" : "bg-gray-200"}`}>
        <div className={`absolute top-0 left-0 h-2 rounded-full ${theme.bg}`} style={{ width: `${percentage}%` }} />
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
        <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full ${theme.bg} border-2 ${isDark ? "border-gray-900" : "border-white"} shadow-lg pointer-events-none`} style={{ left: `calc(${percentage}% - 8px)` }} />
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-xs text-slate-500">{unit}{min.toLocaleString()}</span>
        <span className="text-xs text-slate-500">{unit}{max.toLocaleString()}</span>
      </div>
    </div>
  );
}
