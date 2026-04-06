import React, { useContext } from "react";
import { Line } from "react-chartjs-2";
import { ThemeContext } from "../ThemeContext";

export default function SolvencyFanChart({ days, p5, p50, p95 }) {
  const { isDark, theme } = useContext(ThemeContext);
  if (!days || !p5 || !p50 || !p95) return null;

  const data = {
    labels: days,
    datasets: [
      { label: "P95 (Optimistic)", data: p95, borderColor: "transparent", backgroundColor: theme.hexLight, fill: "+2", tension: 0.4, pointRadius: 0 },
      { label: "P50 (Median)", data: p50, borderColor: theme.hex, backgroundColor: "transparent", fill: false, tension: 0.4, pointRadius: 4, pointBackgroundColor: theme.hex, borderWidth: 2 },
      { label: "P5 (Pessimistic)", data: p5, borderColor: "transparent", backgroundColor: theme.hexLight, fill: false, tension: 0.4, pointRadius: 0 },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: true, labels: { color: isDark ? "#9ca3af" : "#4b5563", boxWidth: 12, font: { size: 11 }, filter: (item) => item.text === "P50 (Median)" } },
      tooltip: { backgroundColor: isDark ? "#1f2937" : "#ffffff", titleColor: isDark ? "#f9fafb" : "#111827", bodyColor: isDark ? "#9ca3af" : "#4b5563", borderColor: isDark ? "#374151" : "#e5e7eb", borderWidth: 1, callbacks: { title: (ctx) => `Day ${ctx[0].label}`, label: (ctx) => ` ${ctx.dataset.label}: £${ctx.parsed.y.toLocaleString()}` } },
    },
    scales: {
      x: { grid: { color: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }, ticks: { color: "#6b7280", font: { size: 11 } } },
      y: { grid: { color: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }, ticks: { color: "#6b7280", font: { size: 11 }, callback: (value) => `£${value.toLocaleString()}` } },
    },
  };

  return (
    <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"} border rounded-2xl p-6 shadow-xl mt-4 transition-colors duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-bold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>12-Month Solvency Forecast</h3>
      </div>
      <p className="text-xs text-gray-500 mb-6 italic">* Shaded band represents the 90% confidence interval across 10,000 simulated scenarios.</p>
      <div className="h-64 relative">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
