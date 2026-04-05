import React, { useContext } from 'react';
import { Info } from 'lucide-react';
// 🌟 引入你的全局主题大脑！
import { ThemeContext } from '../ThemeContext'; 

// 🌟 Tooltip 也接收 isDark 变量
function Tooltip({ children, text, isDark }) {
  if (!text) return children; 
  return (
    <div className="group relative flex items-center cursor-help w-fit">
      {children}
      <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 text-[11px] rounded-xl shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 text-center leading-relaxed border ${
        isDark ? "bg-gray-800 text-gray-200 border-gray-700" : "bg-white text-gray-700 border-gray-200"
      }`}>
        {text}
        <div className={`absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent ${
          isDark ? "border-t-gray-800" : "border-t-white"
        }`}></div>
      </div>
    </div>
  );
}

const HealthScoreGauge = ({ score = 0 }) => {
  // 🌟 从全局获取当前的白天/黑夜状态！
  const { isDark } = useContext(ThemeContext);

  const getStatus = (val) => {
    if (val >= 70) return { color: '#10b981', text: 'EXCELLENT' };
    if (val >= 40) return { color: '#f59e0b', text: 'STABLE' };
    return { color: '#f43f5e', text: 'AT RISK' };
  };
  const status = getStatus(score);

  return (
    // 🌟 彻底抛弃 dark: 前缀，使用 JS 绝对控制！
    <div className={`border rounded-2xl p-6 shadow-sm flex flex-col items-center transition-colors duration-300 ${
      isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
    }`}>
      
      <div className="w-full mb-4 flex justify-center">
        <Tooltip text="50% based on financial runway, and 50% based on Monte Carlo risk." isDark={isDark}>
          <h3 className={`text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider cursor-help ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}>
            Financial Health Score <Info className="w-3.5 h-3.5 opacity-50" />
          </h3>
        </Tooltip>
      </div>

      <div className="relative flex items-center justify-center w-48 h-48">
        <svg className="w-full h-full transform -rotate-[225deg]" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" 
            stroke={isDark ? "#1f2937" : "#f3f4f6"} 
            strokeWidth="8" strokeDasharray="212 283" strokeLinecap="round" 
          />
          <circle cx="50" cy="50" r="45" fill="none" stroke={status.color} strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (212 * (score / 100))} strokeLinecap="round" style={{ transition: 'all 0.8s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <span className="text-5xl font-black transition-colors duration-500" style={{ color: status.color }}>{score}</span>
          <span className="text-[10px] font-bold mt-1 tracking-[0.2em]" style={{ color: status.color }}>{status.text}</span>
        </div>
      </div>

      <div className={`grid grid-cols-3 gap-8 mt-6 w-full pt-6 border-t ${
        isDark ? "border-gray-800" : "border-gray-100"
      }`}>
        {['Liquidity', 'Spending', 'Safety'].map(i => (
          <div key={i} className="text-center">
            <p className={`text-[10px] font-bold uppercase ${isDark ? "text-gray-500" : "text-gray-400"}`}>{i}</p>
            <p className={`text-xs font-bold ${isDark ? "text-gray-300" : "text-gray-700"}`}>Good</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthScoreGauge;