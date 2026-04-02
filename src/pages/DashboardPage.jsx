import React, { useState, useContext } from "react";
import { Activity, TrendingUp, Sliders } from "lucide-react";
import { ThemeContext } from "../ThemeContext";

// 导入需要用到的小组件
import ScenarioManager from "../components/ScenarioManager";
import ScenarioSlider from "../components/ScenarioSlider";
import HealthScoreGauge from "../components/HealthScoreGauge";
import ExpensePieChart from "../components/ExpensePieChart";
import SolvencyFanChart from "../components/SolvencyFanChart";

export default function DashboardPage() {
  const { isDark } = useContext(ThemeContext);
  const [rent, setRent] = useState(600);
  const [food, setFood] = useState(300);
  const [social, setSocial] = useState(150);

  // 模拟核心算法逻辑
  const totalExpense = rent + food + social;
  const income = 1500;
  const bankruptcyProb = (totalExpense / income) * 20; 
  const score = Math.max(0, 100 - Math.round(bankruptcyProb));

  const days = Array.from({ length: 12 }, (_, i) => `M${i + 1}`);
  const p50 = days.map((_, i) => income - totalExpense + (i * 100));
  const p95 = p50.map(v => v + 300);
  const p5 = p50.map(v => v - 300);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 🔴 ZONE 1: Control Center */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-2 mb-2 px-1">
            <Sliders className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>Control Center</h2>
          </div>
          
          <ScenarioManager 
            currentValues={{ rent, food, social }} 
            onLoad={(v) => { setRent(v.rent); setFood(v.food); setSocial(v.social); }} 
          />
          <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"} border rounded-2xl p-6 shadow-xl transition-colors duration-300`}>
            <h3 className={`text-base font-bold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>Financial Levers</h3>
            <ScenarioSlider label="Monthly Rent" min={300} max={1200} step={50} value={rent} onChange={setRent} />
            <ScenarioSlider label="Essential Food" min={100} max={600} step={20} value={food} onChange={setFood} />
            <ScenarioSlider label="Discretionary" min={0} max={500} step={10} value={social} onChange={setSocial} />
          </div>
        </div>

        {/* 🔵 ZONES 2 & 3: Analytics & Forecasting */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* ZONE 2: Health Overview */}
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

          {/* ZONE 3: Long-term Projections */}
          <div>
            <div className="flex items-center gap-2 mb-4 px-1">
              <TrendingUp className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
              <h2 className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>Long-term Projections</h2>
            </div>
            <div className="-mt-4">
              <SolvencyFanChart days={days} p5={p5} p50={p50} p95={p95} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
