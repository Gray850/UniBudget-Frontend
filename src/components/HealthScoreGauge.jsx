import React from 'react';
import { Info } from 'lucide-react';

// 🌟 升级版：高颜值 Tooltip（半透明 Indigo 质感）
function Tooltip({ children, text }) {
  if (!text) return children; 
  return (
    <div className="group relative flex items-center cursor-help w-fit">
      {children}
      {/* 这里的 bg 改成了深蓝色半透明，加了 backdrop-blur 磨砂效果 */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 text-[11px] text-indigo-50 bg-indigo-950/90 backdrop-blur-md border border-indigo-500/20 rounded-xl shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 text-center leading-relaxed">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-indigo-950/90"></div>
      </div>
    </div>
  );
}

const HealthScoreGauge = ({ score = 0 }) => {
  const getStatus = (val) => {
    if (val >= 70) return { color: '#10b981', text: 'EXCELLENT' };
    if (val >= 40) return { color: '#f59e0b', text: 'STABLE' };
    return { color: '#f43f5e', text: 'AT RISK' };
  };

  const status = getStatus(score);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col items-center">
      
      <div className="w-full mb-4 flex justify-center">
        <Tooltip text="Scored out of 100: 50% based on your cash flow and financial runway, and 50% based on the Monte Carlo simulated bankruptcy risk.">
          <h3 className="text-sm font-bold flex items-center gap-1.5 text-gray-400 uppercase tracking-wider cursor-help hover:text-indigo-500 transition-colors">
            Financial Health Score
            <Info className="w-4 h-4 opacity-50" />
          </h3>
        </Tooltip>
      </div>

      <div className="relative flex items-center justify-center w-48 h-48">
        <svg className="w-full h-full transform -rotate-[225deg]" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" strokeDasharray="212 283" strokeLinecap="round" className="dark:stroke-gray-800" />
          <circle cx="50" cy="50" r="45" fill="none" stroke={status.color} strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (212 * (score / 100))} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.5s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          {/* 🌟 这里的分数现在会根据健康度变色了！不再是黑乎乎的 */}
          <span className="text-5xl font-black transition-colors duration-500" style={{ color: status.color }}>
            {score}
          </span>
          <span className="text-xs font-bold mt-1 tracking-[0.2em]" style={{ color: status.color }}>{status.text}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 mt-6 w-full pt-6 border-t border-gray-100 dark:border-gray-800">
        {['Liquidity', 'Spending', 'Safety'].map((item) => (
          <div key={item} className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{item}</p>
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Good</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthScoreGauge;