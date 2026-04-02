import React, { useState, useContext } from "react";
import { Activity, TrendingUp, Sliders } from "lucide-react";
import { ThemeContext } from "../ThemeContext";

// 导入小组件
import ScenarioManager from "../components/ScenarioManager";
import ScenarioSlider from "../components/ScenarioSlider";
import HealthScoreGauge from "../components/HealthScoreGauge";
import ExpensePieChart from "../components/ExpensePieChart";
import SolvencyFanChart from "../components/SolvencyFanChart";

export default function DashboardPage() {
  const { isDark, theme } = useContext(ThemeContext);
  
  // --- 1. 核心输入值 (用户自定义本金与收入) ---
  const [openingBalance, setOpeningBalance] = useState(2000);
  const [monthlyIncome, setMonthlyIncome] = useState(1500);
  
  // --- 2. 支出项 (调高上限) ---
  const [rent, setRent] = useState(700);
  const [food, setFood] = useState(400);
  const [social, setSocial] = useState(200);

  // --- 3. 计算逻辑 ---
  const totalExpense = rent + food + social;
  const netMonthly = monthlyIncome - totalExpense;
  
  // 综合健康分公式：考虑了收入与存款的缓冲能力
  const monthlyBuffer = monthlyIncome + (openingBalance / 12);
  const riskRatio = (totalExpense / monthlyBuffer) * 25;
  const score = Math.max(0, Math.min(100, Math.round(100 - riskRatio)));

  // 12个月预测
  const months = Array.from({ length: 12 }, (_, i) => `M${i + 1}`);
  const p50 = months.map((_, i) => {
    const monthIndex = i + 1;
    return openingBalance + (netMonthly * monthIndex) + (monthIndex * 50);
  });
  const p95 = p50.map((v, i) => v + (300 + i * 50));
  const p5 = p50.map((v, i) => v - (300 + i * 50));

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ZONE 1: 控制中心 */}
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

          <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"} border rounded-3xl p-6 shadow-xl`}>
            {/* 🌟 核心修改：增加了明显的标题区分 */}
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 ${theme.text} opacity-80`}>
              Base Settings (User Inputs)
            </h3>
            <ScenarioSlider label="Opening Balance" min={0} max={20000} step={500} value={openingBalance} onChange={setOpeningBalance} unit="£" />
            <ScenarioSlider label="Monthly Income" min={500} max={10000} step={100} value={monthlyIncome} onChange={setMonthlyIncome} unit="£" />
            
            <div className={`my-8 border-t ${isDark ? "border-gray-800" : "border-gray-100"}`} />
            
            <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 ${theme.text} opacity-80`}>
              Variable Expenses
            </h3>
            <ScenarioSlider label="Rent & Bills" min={0} max={4000} step={50} value={rent} onChange={setRent} />
            <ScenarioSlider label="Essential Food" min={0} max={1500} step={20} value={food} onChange={setFood} />
            <ScenarioSlider label="Discretionary" min={0} max={1500} step={10} value={social} onChange={setSocial} />
          </div>
        </div>

        {/* ZONE 2 & 3: 数据分析区 */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HealthScoreGauge score={score} />
            <ExpensePieChart data={{ rent, food, transport: social }} />
          </div>

          <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"} border rounded-3xl p-8 shadow-xl`}>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className={`w-5 h-5 ${theme.text}`} />
              <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>12-Month Solvency Runway</h2>
            </div>
            <SolvencyFanChart days={months} p5={p5} p50={p50} p95={p95} />
          </div>
        </div>
      </div>
    </div>
  );
}