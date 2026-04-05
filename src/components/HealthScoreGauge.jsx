import React from 'react';
import { Info } from 'lucide-react';

// 🌟 专供大表盘使用的迷你 Tooltip 组件
function Tooltip({ children, text }) {
  if (!text) return children; 
  return (
    <div className="group relative flex items-center cursor-help w-fit">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 text-xs text-white bg-gray-800 dark:bg-gray-700 rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 text-center leading-relaxed font-normal">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800 dark:border-t-gray-700"></div>
      </div>
    </div>
  );
}

const HealthScoreGauge = ({ score = 0 }) => {
  const getStatus = (val) => {
    if (val >= 70) return { color: '#10b981', text: 'EXCELLENT', label: 'Good' };
    if (val >= 40) return { color: '#f59e0b', text: 'STABLE', label: 'Fair' };
    return { color: '#f43f5e', text: 'AT RISK', label: 'Critical' };
  };

  const status = getStatus(score);
  const strokeDasharray = 283; 
  const percentage = (score / 100) * 0.75; 

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col items-center">
      
      {/* 🌟 核心在这里！精准定位的小 i 图标和注释 */}
      <div className="w-full mb-4 flex justify-center">
        <Tooltip text="Scored out of 100: 50% based on your cash flow and financial runway, and 50% based on the Monte Carlo simulated bankruptcy risk.">
          <h3 className="text-sm font-bold flex items-center gap-1.5 text-gray-900 dark:text-white cursor-help">
            Financial Health Score
            <Info className="w-4 h-4 text-gray-400 hover:text-emerald-500 transition-colors" />
          </h3>
        </Tooltip>
      </div>

      <div className="relative flex items-center justify-center w-48 h-48">
        <svg className="w-full h-full transform -rotate-[225deg]" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            strokeDasharray="212 283"
            strokeLinecap="round"
            className="dark:stroke-gray-800"
          />
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke={status.color}
            strokeWidth="8"
            strokeDasharray="283"
            strokeDashoffset={283 - (212 * (score / 100))}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <span className="text-5xl font-black text-gray-900 dark:text-white">{score}</span>
          <span className="text-xs font-bold mt-1 tracking-[0.2em]" style={{ color: status.color }}>{status.text}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 mt-6 w-full pt-6 border-t border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Liquidity</p>
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Excellent</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Spending</p>
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Good</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Safety</p>
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Excellent</p>
        </div>
      </div>
    </div>
  );
};

export default HealthScoreGauge;