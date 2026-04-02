import React, { useState, useContext } from "react";
import { Activity, TrendingUp, Sliders, Settings2 } from "lucide-react";
import { ThemeContext } from "../ThemeContext";

import ScenarioManager from "../components/ScenarioManager";
import ScenarioSlider from "../components/ScenarioSlider";
import HealthScoreGauge from "../components/HealthScoreGauge";
import ExpensePieChart from "../components/ExpensePieChart";
import SolvencyFanChart from "../components/SolvencyFanChart";

// 🌟 核心升级：带有手动输入框的调节器组件
const ManualInputGroup = ({ label, value, onChange, min, max, isDark }) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          {label}
        </label>
        <div className={`flex items-center px-3 py-1.5 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200 shadow-sm"}`}>
          <span className="text-gray-500 text-xs mr-1 font-bold">£</span>
          {/* 用户可以在这里自由输入任意数字 */}
          <input 
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-20 bg-transparent text-right font-black text-sm outline-none border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={50}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
      />
    </div>
  );
};

export default function DashboardPage() {
  const { isDark, theme } = useContext(ThemeContext);
  
  // --- 用户原始输入 (初始本金 & 月收入) ---
  const [openingBalance, setOpeningBalance] = useState(4000);
  const [monthlyIncome, setMonthlyIncome] = useState(1500);
  
  // --- 可调节支出项 ---
  const [rent, setRent] = useState(1150);
  const [food, setFood] = useState(540);
  const [social, setSocial] = useState(450);

  // --- 财务计算逻辑 ---
  const totalExpense = rent + food + social;
  const netMonthly = monthlyIncome - totalExpense;
  const monthlyBuffer = monthlyIncome + (openingBalance / 12);
  const riskRatio = (totalExpense / monthlyBuffer) * 28;
  const score = Math.max(0, Math.min(100, Math.round(100 - riskRatio)));

  // 12个月预测图数据
  const months = Array.from({ length: 12 }, (_, i) => `M${i + 1}`);
  const p50 = months.map((_, i) => {
    const monthIndex = i + 1;
    // 起点为 Opening Balance，每月累加净余额
    return openingBalance + (netMonthly * monthIndex) + (monthIndex * 20);
  });
  const p95 = p50.map((v, i) => v + (500 + i * 80));
  const p5 = p50.map((v, i) => v - (500 + i * 80));

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 左侧：控制中心 */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-2 mb-2 px-1">
            <Sliders className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>Control Center</h2>
          </div>
          
          <ScenarioManager 
            currentValues={{ openingBalance, monthlyIncome, rent, food, social }} 
            onLoad={(v) => { 
              if(v.openingBalance !== undefined) setOpeningBalance(v.openingBalance);
              if(v.monthlyIncome !== undefined) setMonthlyIncome(v.monthlyIncome);
              setRent(v.rent); 
              setFood(v.food); 
              setSocial(v.social); 
            }} 
          />

          <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"} border rounded-[2rem] p-7 shadow-2xl`}>
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-8 ${theme.text} opacity-80 flex items-center gap-2`}>
              <Settings2 size={12} /> Global Inputs (Manual)
            </h3>
            
            {/* 🌟 支持手动输入的初始金额与收入 */}
            <ManualInputGroup 
              label="Opening Balance" 
              value={openingBalance} 
              onChange={setOpeningBalance} 
              min={0} max={100000} 
              isDark={isDark} 
            />
            
            <ManualInputGroup 
              label="Monthly Income" 
              value={monthlyIncome} 
              onChange={setMonthlyIncome} 
              min={0} max={20000} 
              isDark={isDark} 
            />
            
            <div className={`my-10 border-t border-dashed ${isDark ? "border-gray-800" : "border-gray-200"}`} />
            
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-8 ${theme.text} opacity-80`}>
              Variable Expenses
            </h3>
            <ScenarioSlider label="Rent & Bills" min={0} max={6000} step={50} value={rent} onChange={setRent} />
            <ScenarioSlider label="Essential Food" min={0} max={2500} step={20} value={food} onChange={setFood} />
            <ScenarioSlider label="Discretionary" min={0} max={2500} step={10} value={social} onChange={setSocial} />
          </div>
        </div>

        {/* 右侧：数据看板 */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HealthScoreGauge score={score} />
            <ExpensePieChart data={{ rent, food, transport: social }} />
          </div>

          <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"} border rounded-[2.5rem] p-8 shadow-2xl`}>
            <div className="flex items-center gap-3 mb-8">
              <div className={`p-2 rounded-2xl ${theme.lightBg}`}>
                <TrendingUp className={`w-6 h-6 ${theme.text}`} />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>12-Month Runway Forecast</h2>
                <p className="text-xs text-gray-500 font-medium mt-1">Stochastic simulation based on current opening balance</p>
              </div>
            </div>
            <SolvencyFanChart days={months} p5={p5} p50={p50} p95={p95} />
          </div>
        </div>
      </div>
    </div>
  );
}
