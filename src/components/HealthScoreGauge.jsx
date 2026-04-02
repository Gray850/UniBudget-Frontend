import React, { useContext } from "react";
import { Doughnut } from "react-chartjs-2";
/**
 * 修复模块解析错误：确保路径正确
 * 如果 ThemeContext.jsx 位于 src 根目录，且此文件位于 src/components/
 * 则相对路径 ../ThemeContext 是正确的。
 */
import { ThemeContext } from "../ThemeContext";

/**
 * HealthScoreGauge 组件
 * 根据传入的 score 展示圆环进度条，并动态显示财务健康等级
 */
export default function HealthScoreGauge({ score }) {
  const { isDark } = useContext(ThemeContext);
  
  // 核心逻辑：根据分数返回主标签和颜色
  const getRating = (s) => {
    if (s >= 85) return { label: "优秀", color: "#10b981" };
    if (s >= 65) return { label: "良好", color: "#6366f1" };
    if (s >= 45) return { label: "一般", color: "#f59e0b" };
    return { label: "风险", color: "#ef4444" };
  };

  const { label, color } = getRating(score);
  
  // 动态计算底部的三个维度评级 (显示评价等级)
  const liquidityStatus = score > 80 ? "优秀" : score > 50 ? "良好" : "一般";
  const spendingStatus = score > 60 ? "良好" : score > 30 ? "一般" : "需留意";
  const safetyStatus = score > 75 ? "优秀" : score > 40 ? "良好" : "风险";

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
      <h3 className={`font-bold text-sm mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        财务健康评分
      </h3>
      
      <div className="relative h-48 flex items-center justify-center mt-2">
        <Doughnut data={data} options={{ responsive: true, maintainAspectRatio: false, cutout: "82%", plugins: { tooltip: { enabled: false } } }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
          <span className={`text-5xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>{score}</span>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold mt-2" style={{ color }}>{label}</span>
        </div>
      </div>

      {/* 底部评价标签区 */}
      <div className="mt-8 flex justify-center gap-4 px-2">
        {[
          { category: "流动性", status: liquidityStatus, color: "bg-emerald-500" },
          { category: "支出", status: spendingStatus, color: "bg-indigo-500" },
          { category: "安全边际", status: safetyStatus, color: "bg-amber-500" },
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