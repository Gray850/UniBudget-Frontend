import React, { useContext } from "react";
import { Doughnut } from "react-chartjs-2";
import { ThemeContext } from "../ThemeContext";

export default function HealthScoreGauge({ score }) {
  const { isDark } = useContext(ThemeContext);
  
  // 核心逻辑：根据分数返回主标签和颜色
  const getRating = (s) => {
    if (s >= 85) return { label: "Excellent", color: "#10b981" };
    if (s >= 65) return { label: "Good", color: "#6366f1" };
    if (s >= 45) return { label: "Fair", color: "#f59e0b" };
    return { label: "At Risk", color: "#ef4444" };
  };

  const { label, color } = getRating(score);
  
  // 🌟 动态计算底部的三个维度评级
  const liquidityStatus = score > 80 ? "Excellent" : score > 50 ? "Good" : "Fair";
  const spendingStatus = score > 60 ? "Good" : score > 30 ? "Fair" : "Warning";
  const safetyStatus = score > 75 ? "Excellent" : score > 40 ? "Good" : "At Risk";

  const data = {
    datasets: [{
      data: [score, 100 - score],
      backgroundColor: [color, isDark ? "#1f2937" : "#e5e7eb"],
      borderWidth: 0,
      circumference: 270,
      rotation: 225,
    }],
  };

  return (
    <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"} border rounded-[2rem] p-6 shadow-xl flex flex-col justify-between transition-all duration-300`}>
      <h3 className={`font-bold text-sm mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Financial Health Score</h3>
      
      <div className="relative h-48 flex items-center justify-center mt-2">
        <Doughnut data={data} options={{ responsive: true, maintainAspectRatio: false, cutout: "82%", plugins: { tooltip: { enabled: false } } }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
          <span className={`text-5xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>{score}</span>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold mt-2" style={{ color }}>{label}</span>
        </div>
      </div>

      {/* 🌟 底部标签：现在直接显示评级词汇 */}
      <div className="mt-8 flex justify-center gap-4 px-2">
        {[
          { category: "Liquidity", status: liquidityStatus, color: "bg-emerald-500" },
          { category: "Spending", status: spendingStatus, color: "bg-indigo-500" },
          { category: "Safety", status: safetyStatus, color: "bg-amber-500" },
        ].map((item) => (
          <div key={item.category} className="flex flex-col items-center gap-1.5 min-w-[70px]">
            <div className={`w-2 h-2 rounded-full ${item.color}`} />
            <span className="text-[8px] text-gray-500 uppercase font-black tracking-tighter">{item.category}</span>
            <span className={`text-[10px] font-bold ${isDark ? "text-gray-200" : "text-gray-900"}`}>{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
