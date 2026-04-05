import React from 'react';
import { Info } from 'lucide-react';

// 🌟 完美适配：白昼/黑夜双模 Tooltip
function Tooltip({ children, text }) {
  if (!text) return children; 
  return (
    <div className="group relative flex items-center cursor-help w-fit">
      {children}
      {/* 这里的 bg 会根据模式自动切换：白天是白底黑字，黑夜是深灰底白字 */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 text-[11px] 
        bg-white dark:bg-gray-800 
        text-gray-700 dark:text-gray-200 
        border border-gray-200 dark:border-gray-700 
        rounded-xl shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 text-center leading-relaxed">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white dark:border-t-gray-800"></div>
      </div>
    </div>
  );
}

const HealthScoreGauge = ({ score = 0 }) => {
  // 根据分数决定颜色
  const getStatus = (val) => {
    if (val >= 70) return { color: '#10b981', text: 'EXCELLENT' }; // 绿色
    if (val >= 40) return { color: '#f59e0b', text: 'STABLE' };    // 橙色
    return { color: '#f43f5e', text: 'AT RISK' };                 // 红色
  };
  const status = getStatus(score);

  return (
    /* 🌟 这里的 dark:bg-gray-900 让它在黑夜模式下变黑 */
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col items-center transition-colors duration-300">
      
      <div className="w-full mb-4 flex justify-center">
        <Tooltip text="50% based on financial runway, and 50% based on Monte Carlo risk.">
          <h3 className="text-xs font-bold flex items-center gap-1.5 text-gray-400 dark:text-gray-500 uppercase tracking-wider cursor-help">
            Financial Health Score <Info className="w-3.5 h-3.5 opacity-50" />
          </h3>
        </Tooltip>
      </div>

      <div className="relative flex items-center justify-center w-48 h-48">
        <svg className="w-full h-full transform -rotate-[225deg]" viewBox="0 0 100 100">
          {/* 背景圆环 */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" strokeDasharray="212 283" strokeLinecap="round" className="dark:stroke-gray-800" />
          {/* 进度圆环 */}
          <circle cx="50" cy="50" r="45" fill="none" stroke={status.color} strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (212 * (score / 100))} strokeLinecap="round" style={{ transition: 'all 0.8s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          {/* 🌟 核心分数：会变色，且在黑夜模式下依然亮眼 */}
          <span className="text-5xl font-black transition-colors duration-500" style={{ color: status.color }}>{score}</span>
          <span className="text-[10px] font-bold mt-1 tracking-[0.2em]" style={{ color: status.color }}>{status.text}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 mt-6 w-full pt-6 border-t border-gray-100 dark:border-gray-800">
        {['Liquidity', 'Spending', 'Safety'].map(i => (
          <div key={i} className="text-center">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{i}</p>
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Good</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default HealthScoreGauge;