import React, { useContext } from "react";
import { Doughnut } from "react-chartjs-2";
import { ThemeContext } from "../ThemeContext";

export default function HealthScoreGauge({ score }) {
  const { isDark } = useContext(ThemeContext);
  
  const getScoreLabel = (s) => {
    if (s >= 80) return { label: "Excellent", color: "#10b981" };
    if (s >= 60) return { label: "Good", color: "#6366f1" };
    if (s >= 40) return { label: "Fair", color: "#f59e0b" };
    return { label: "At Risk", color: "#ef4444" };
  };

  const { label, color } = getScoreLabel(score);
  const remainder = 100 - score;

  const data = {
    datasets: [{
      data: [score, remainder],
      backgroundColor: [color, isDark ? "#1f2937" : "#e5e7eb"],
      borderWidth: 0,
      circumference: 270,
      rotation: 225,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "80%",
    plugins: { tooltip: { enabled: false }, legend: { display: false } },
  };

  return (
    <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"} border rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-colors duration-300`}>
      <h3 className={`font-bold text-sm mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Financial Health Score</h3>
      <div className="relative h-40 flex items-center justify-center mt-2">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
          <span className={`text-4xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>{score}</span>
          <span className="text-[10px] uppercase tracking-widest font-bold mt-1" style={{ color }}>{label}</span>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 px-2">
        {[
          { label: "Savings", color: "bg-emerald-500" },
          { label: "Expenses", color: "bg-indigo-500" },
          { label: "Solvency", color: "bg-amber-500" },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${item.color}`} />
            <span className="text-[10px] text-gray-500 uppercase font-semibold">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
