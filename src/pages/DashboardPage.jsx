import React, { useState, useContext } from "react";
import { Activity, TrendingUp, Sliders, Wallet } from "lucide-react";
import { ThemeContext } from "../ThemeContext";

import ScenarioManager from "../component/ScenarioManager";
import ScenarioSlider from "../component/ScenarioSlider";
import HealthScoreGauge from "../component/HealthScoreGauge";
import ExpensePieChart from "../component/ExpensePieChart";
import SolvencyFanChart from "../component/SolvencyFanChart";

export default function DashboardPage() {
  const { isDark, theme } = useContext(ThemeContext);
  
  // --- 1. 新增：初始状态与月收入自定义 ---
  const [openingBalance, setOpeningBalance] = useState(2000);
  const [monthlyIncome, setMonthlyIncome] = useState(1500);
  
  // --- 2. 支出项：调高上限 ---
  const [rent, setRent] = useState(700);
  const [food, setFood] = useState(400);
  const [social, setSocial] = useState(200);

  // --- 3. 核心计算逻辑 ---
  const totalExpense = rent + food + social;
  const netMonthly = monthlyIncome - totalExpense;
  
  // 健康分逻辑：考虑存款缓冲
  const financialBuffer = monthlyIncome + (openingBalance / 12);
  const riskRatio = (totalExpense / financialBuffer) * 25;
  const score = Math.max(0, Math.min(100, Math.round(100 - riskRatio)));

  // 12个月预测逻辑：以 openingBalance 为起点
  const months = Array.from({ length: 12 }, (_, i) => `M${i + 1}`);
  const p50 = months.map((_, i) => {
    const monthIndex = i + 1;
    // 基础增长 + 模拟微小波动
    return openingBalance + (netMonthly * monthIndex) + (monthIndex * 50);
  });
  
  // 风险区间随时间扩散
  const p95 = p50.map((v, i) => v + (300 + i * 50));
  const p5 = p50.map((v, i) => v - (300 + i * 50));

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ZONE 1: Control Center */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-2 mb-2 px-1">
            <Sliders className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>Control Center</h2>
          </div>
          
          <ScenarioManager 
            currentValues={{ openingBalance, monthlyIncome, rent, food, social }} 
            onLoad={(v) => { 
              setOpeningBalance(v.openingBalance || 2000);
              setMonthlyIncome(v.monthlyIncome || 1500);
              setRent(v.rent); 
              setFood(v.food); 
              setSocial(v.social); 
            }} 
          />

          <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"} border rounded-2xl p-6 shadow-xl`}>
            <h3 className={`text-xs font-black uppercase tracking-widest mb-6 ${theme.text}`}>Base Settings</h3>
            <ScenarioSlider label="Opening Balance" min={0} max={10000} step={500} value={openingBalance} onChange={setOpeningBalance} unit="£" />
            <ScenarioSlider label="Monthly Income" min={500} max={5000} step={100} value={monthlyIncome} onChange={setMonthlyIncome} unit="£" />
            
            <div className={`my-6 border-t ${isDark ? "border-gray-800" : "border-gray-100"}`} />
            
            <h3 className={`text-xs font-black uppercase tracking-widest mb-6 ${theme.text}`}>Monthly Levers</h3>
            <ScenarioSlider label="Rent & Bills" min={0} max={3000} step={50} value={rent} onChange={setRent} />
            <ScenarioSlider label="Essential Food" min={0} max={1000} step={20} value={food} onChange={setFood} />
            <ScenarioSlider label="Discretionary" min={0} max={1000} step={10} value={social} onChange={setSocial} />
          </div>
        </div>

        {/* ZONES 2 & 3 */}
        <div className="lg:col-span-8 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4 px-1">
              <Activity className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
              <h2 className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>Health Overview</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HealthScoreGauge score={score} />
              <ExpensePieChart data={{ rent, food, transport: social }} />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4 px-1">
              <TrendingUp className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
              <h2 className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>12-Month Cash Flow Forecast</h2>
            </div>
            <SolvencyFanChart days={months} p5={p5} p50={p50} p95={p95} />
          </div>
        </div>
      </div>
    </div>
  );
}