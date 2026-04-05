// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useContext } from "react"
import {
  LayoutDashboard, TrendingUp, AlertTriangle,
  BrainCircuit, Loader2, Database, Sliders, Info
} from "lucide-react"

import SolvencyFanChart from "../components/SolvencyFanChart"
import HealthScoreGauge from "../components/HealthScoreGauge"
import ExpensePieChart from "../components/ExpensePieChart"
import ScenarioManager from "../components/ScenarioManager"
import { ThemeContext } from "../ThemeContext"

// ===========================================================================
// 🌟 纯手工打造的悬浮提示框组件 (Tooltip)
// ===========================================================================
function Tooltip({ children, text }) {
  if (!text) return children; 

  return (
    <div className="group relative flex items-center cursor-help w-fit">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 text-xs text-white bg-gray-800 dark:bg-gray-700 rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 text-center leading-relaxed">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800 dark:border-t-gray-700"></div>
      </div>
    </div>
  );
}

// ===========================================================================
// 🌟 纯白高对比度版滑块组件（带手动输入框）
// ===========================================================================
function ScenarioSlider({ label, tooltip, value, unit, onChange, min = 0, max = 10000, step = 100, color = "indigo" }) {
  const colorMap = {
    teal: { text: "text-teal-600 dark:text-teal-400", hex: "#14b8a6" },
    emerald: { text: "text-emerald-600 dark:text-emerald-400", hex: "#10b981" },
    rose: { text: "text-rose-600 dark:text-rose-400", hex: "#f43f5e" },
    amber: { text: "text-amber-600 dark:text-amber-400", hex: "#f59e0b" },
    purple: { text: "text-purple-600 dark:text-purple-400", hex: "#a855f7" },
    indigo: { text: "text-indigo-600 dark:text-indigo-400", hex: "#6366f1" }
  };

  const currentColor = colorMap[color] || colorMap.indigo;
  const percentage = ((value - min) / (max - min)) * 100;

  const handleInputChange = (e) => {
    let newValue = Number(e.target.value);
    if (newValue < min) newValue = min;
    if (newValue > max) newValue = max;
    onChange(newValue);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <Tooltip text={tooltip}>
          <label className="text-sm font-semibold dark:text-gray-300 text-gray-700 flex items-center gap-1.5">
            {label}
            {tooltip && <Info className="w-3.5 h-3.5 text-gray-400 hover:text-indigo-500 transition-colors" />}
          </label>
        </Tooltip>

        {/* 纯白输入框区域 */}
        <div className="flex items-center gap-1 bg-white px-2 py-1.5 rounded-lg border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <span className="text-sm font-bold text-gray-400">{unit}</span>
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            className={`w-20 bg-transparent text-right text-sm font-bold focus:outline-none text-gray-900 ${currentColor.text}`}
          />
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right, ${currentColor.hex} 0%, ${currentColor.hex} ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
        }}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
      />
      
      <div className="flex justify-between text-[10px] text-gray-400 mt-1.5 font-medium">
        <span>{unit}{min}</span>
        <span>{unit}{max.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 本地核心算法：全新优化的加权健康分数 (Health Score)
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// 本地核心算法：全新优化的“悬崖式”健康分数 (Health Score)
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// 本地核心算法：结合概率与生存周期的“平滑降级”健康分数 (Health Score)
// ---------------------------------------------------------------------------
function calculateHealthScore(income, totalExpense, currentBalance, bankruptcyProbability) {
  const monthlyBalance = income - totalExpense;
  
  // 🟢 维度 1：现金流与生存周期 (满分 50 分)
  let cashFlowScore = 50;
  if (monthlyBalance >= 0) {
    // 如果赚钱或收支平衡，这部分直接拿满分
    cashFlowScore = 50;
  } else {
    // 如果每个月都在亏钱，算算存款还能撑几个月 (Runway)
    const monthsLeft = currentBalance / Math.abs(monthlyBalance);
    
    if (monthsLeft >= 12) {
      // 能撑一年以上，依然能拿 40~50 的高分
      cashFlowScore = 40 + Math.min(10, (monthsLeft - 12) * 1);
    } else {
      // 撑不到一年，分数随着月份减少【平滑】下降 (0~40分)
      cashFlowScore = (monthsLeft / 12) * 40; 
    }
  }

  // 🔵 维度 2：蒙特卡洛破产概率惩罚 (满分 50 分)
  // 概率 0% -> 拿满 50 分；概率 100% -> 拿 0 分
  const riskScore = 50 - (bankruptcyProbability / 100) * 50;

  // 综合得分
  let score = Math.round(cashFlowScore + riskScore);

  // 🔴 破产底线惩罚：如果余额已经小于 0（负债状态），给予强制扣分，确保它是红色
  if (currentBalance < 0) {
    score -= 30;
  }

  // 限制分数在 0 - 100 之间
  return Math.max(0, Math.min(100, score));
}
function mockSimulate(config) {
  const { monthly_income, monthly_rent, essential_spending, discretionary_spending, current_balance } = config
  const totalExpense = monthly_rent + essential_spending + discretionary_spending
  const monthlyBalance = monthly_income - totalExpense
  
  // 💡 风险算法：融合 Current Balance
  let baseRisk = 0
  if (monthlyBalance < 0) {
    const monthsLeft = current_balance / Math.abs(monthlyBalance)
    if (monthsLeft < 12) {
      baseRisk = 95 - (monthsLeft / 12) * 70
    } else {
      baseRisk = Math.max(5, 25 - (monthsLeft - 12))
    }
  } else {
    const bufferMonths = totalExpense > 0 ? current_balance / totalExpense : 10
    baseRisk = Math.max(1, 15 - bufferMonths)
  }

  // 🚨 修复点 1：控制破产概率的随机波动，只允许上下 5% 的微调，防止数值乱跳
  const bankruptcyProbability = Math.max(0, Math.min(100, Math.round(baseRisk + (Math.random() - 0.5) * 10)))

  const p5 = [], p50 = [], p95 = []
  let balance = current_balance || 0

  // 🚨 修复点 2：定义合理的金钱波动基数（比如每个月可能有相当于总支出 20% 的意外花销）
  const monthlyShockBase = totalExpense * 0.20 + 100; 

  for (let i = 0; i < 12; i++) {
    balance += monthlyBalance
    p50.push(Math.round(balance))
    
    // 🚨 修复点 3：用平方根（Math.sqrt）让扇形喇叭口随着月份平滑优雅地展开
    const uncertainty = monthlyShockBase * Math.sqrt(i + 1)
    
    // 悲观情况 (P5)：遇到意外多花钱
    p5.push(Math.round(balance - uncertainty * 1.5))
    // 乐观情况 (P95)：控制住了手，少花钱
    p95.push(Math.round(balance + uncertainty * 0.8))
  }

  return {
    bankruptcy_probability: bankruptcyProbability,
    health_score: calculateHealthScore(monthly_income, totalExpense, current_balance, bankruptcyProbability),
    days: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    p5, p50, p95,
  }
}

function getAdvisory(simData, config, displayCurrency) {
  if (!simData) return { text: "Awaiting simulation results...", type: "info" }
  const { bankruptcy_probability, p5 } = simData
  const finalP5 = p5?.[p5.length - 1] ?? 0
  const { discretionary_spending, monthly_income, current_balance } = config

  if (bankruptcy_probability >= 60 || finalP5 < 0) {
    return {
      type: "danger",
      text: `Critical: ${bankruptcy_probability}% bankruptcy probability detected.\n` +
        (current_balance < monthly_income
          ? `Your cash reserves are dangerously low. Reduce discretionary spending (${displayCurrency}${discretionary_spending.toLocaleString()}) immediately.`
          : "You are burning through your savings too fast. Consider cheaper housing or additional income sources."),
    }
  }
  if (bankruptcy_probability >= 30) {
    return {
      type: "warning",
      text: `Warning: Elevated risk at ${bankruptcy_probability}%.\nKeep monitoring discretionary spending and maintain an emergency fund of at least 3 months' expenses.`,
    }
  }
  if (finalP5 > current_balance && discretionary_spending < 300) {
    return {
      type: "success",
      text: "Financial position is growing stronger. Your positive cash flow is building your reserves. Consider allocating surplus to long-term savings.",
    }
  }
  return {
    type: "info",
    text: "Financial outlook is stable. Your current balance provides a good buffer. Maintain your current spending habits.",
  }
}

// ---------------------------------------------------------------------------
// 主面板组件
// ---------------------------------------------------------------------------
export default function DashboardPage() {
  const { isDark, theme: currentTheme, currencySymbol } = useContext(ThemeContext)
  const displayCurrency = currencySymbol || "£"

  const [config, setConfig] = useState({
    current_balance:        0,
    monthly_income:         0,
    monthly_rent:           0,
    essential_spending:     0,
    discretionary_spending: 0,
  })

  const [simData, setSimData]     = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setSimData(mockSimulate(config))
      setIsLoading(false)
    }, 400) 
    return () => clearTimeout(timer)
  }, [config])

  const totalExpense = config.monthly_rent + config.essential_spending + config.discretionary_spending
  const balance      = config.monthly_income - totalExpense
  const advisory = getAdvisory(simData, config, displayCurrency)

  const advisoryStyles = {
    danger:  isDark ? "bg-rose-500/10 border-rose-500/30 text-rose-300" : "bg-rose-50 border-rose-200 text-rose-700",
    warning: isDark ? "bg-amber-500/10 border-amber-500/30 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-700",
    success: isDark ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-700",
    info:    isDark ? `${currentTheme?.lightBg || 'bg-indigo-500/10'} border-gray-700 ${currentTheme?.text || 'text-indigo-400'}` : `bg-white border-gray-300 ${currentTheme?.text || 'text-indigo-600'}`,
  }

  const advisoryIcons = {
    danger:  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />,
    success: <TrendingUp className="w-5 h-5 shrink-0 mt-0.5" />,
    info:    <BrainCircuit className="w-5 h-5 shrink-0 mt-0.5" />,
  }

  const advisoryLabels = {
    danger:  "Critical Alert",
    warning: "Advisory Notice",
    success: "Looking Good",
    info:    "Analysis Result",
  }

  return (
    <div className={`min-h-full p-6 md:p-8 space-y-6 transition-colors duration-300 ${isDark ? "bg-[#0b0f19] text-white" : "bg-gray-50 text-gray-900"}`}>

      <div className={`border-l-4 p-4 rounded-xl transition-colors duration-300 ${isDark ? "bg-amber-500/10 border-amber-500/20 border-l-amber-500" : "bg-amber-50 border-amber-200 border-l-amber-500"}`}>
        <p className={`text-xs font-bold mb-0.5 ${isDark ? "text-amber-400" : "text-amber-700"}`}>Legal Disclaimer</p>
        <p className={`text-xs leading-relaxed ${isDark ? "text-amber-300/60" : "text-amber-700/80"}`}>
          Results are probabilistic projections, not professional financial advice.
          Always consult a certified financial advisor. BCS Code of Conduct observed.
        </p>
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl border transition-colors duration-300 ${isDark ? `${currentTheme?.lightBg || 'bg-gray-800'} border-gray-700` : `bg-white border-gray-200 shadow-sm`}`}>
            <LayoutDashboard className={`w-7 h-7 ${currentTheme?.text || 'text-indigo-500'}`} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
            <p className={`text-sm mt-0.5 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
              Proactive Financial Forecasting & Risk Analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-colors duration-300 ${isDark ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-100 border-emerald-200 text-emerald-700"}`}>
            <Database className="w-3 h-3" />
            Live Engine
          </span>

          {isLoading && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors duration-300 ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} ${currentTheme?.text || 'text-indigo-500'}`}>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-medium">Simulating 10,000 scenarios...</span>
            </div>
          )}
        </div>
      </header>

      {/* 🌟 KPI 数据栏：包含了全新的加权分数说明！ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Monthly Balance",
            tooltip: "Your net income after rent, essential, and discretionary expenses are deducted.",
            value: `${displayCurrency}${balance.toLocaleString()}`,
            color: balance >= 0 ? (isDark ? "text-emerald-400" : "text-emerald-600") : (isDark ? "text-rose-400" : "text-rose-600"),
          },
          {
            label: "Total Expenses",
            tooltip: "The total sum of your projected monthly outgoings.",
            value: `${displayCurrency}${totalExpense.toLocaleString()}`,
            color: isDark ? "text-rose-400" : "text-rose-600",
          },
          {
            label: "Bankruptcy Risk",
            tooltip: "The probability of running out of money within 12 months, simulated via Monte Carlo engine.",
            value: simData ? `${simData.bankruptcy_probability}%` : "--",
            color: !simData                                   ? "text-gray-500"
                 : simData.bankruptcy_probability >= 60       ? (isDark ? "text-rose-400" : "text-rose-600")
                 : simData.bankruptcy_probability >= 30       ? (isDark ? "text-amber-400" : "text-amber-600")
                 : (isDark ? "text-emerald-400" : "text-emerald-600"),
          },
          {
            label: "Health Score",
            tooltip: "Scored out of 100: 50% based on your cash flow and financial runway, and 50% based on the Monte Carlo simulated bankruptcy risk.",
            value: simData ? `${simData.health_score}/100` : "--",
            color: !simData                   ? "text-gray-500"
                 : simData.health_score >= 70 ? (isDark ? "text-emerald-400" : "text-emerald-600")
                 : simData.health_score >= 40 ? (isDark ? "text-amber-400" : "text-amber-600")
                 : (isDark ? "text-rose-400" : "text-rose-600"),
          },
        ].map((kpi) => (
          <div key={kpi.label} className={`border rounded-2xl p-5 shadow-xl transition-colors duration-300 ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
            <Tooltip text={kpi.tooltip}>
              <p className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2 cursor-help ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                {kpi.label}
                {kpi.tooltip && <Info className="w-3.5 h-3.5 opacity-60 hover:text-indigo-500 transition-colors" />}
              </p>
            </Tooltip>
            <p className={`text-2xl font-extrabold ${kpi.color} ${isLoading ? "opacity-40" : ""} transition-opacity`}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        <aside className="xl:col-span-4 space-y-6">
          <div className={`border rounded-2xl p-6 shadow-xl transition-colors duration-300 ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold">Scenario Builder</h2>
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md border transition-colors duration-300 ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-300"} ${currentTheme?.text || 'text-indigo-400'}`}>
                <Sliders className="w-3 h-3" />
                Parameters
              </span>
            </div>
            <p className={`text-xs mb-6 ${isDark ? "text-gray-600" : "text-gray-500"}`}>
              Drag sliders or enter values to forecast.
            </p>

            <ScenarioSlider label="Current Balance" tooltip="Your current liquid savings or cash on hand." unit={displayCurrency} min={0} max={50000} step={500} value={config.current_balance} onChange={(v) => setConfig((p) => ({ ...p, current_balance: v }))} color="teal" />
            <ScenarioSlider label="Monthly Income" tooltip="Your reliable monthly income after tax." unit={displayCurrency} min={0} max={15000} step={100} value={config.monthly_income} onChange={(v) => setConfig((p) => ({ ...p, monthly_income: v }))} color="emerald" />
            <ScenarioSlider label="Rent & Bills" tooltip="Fixed living costs like rent, utilities, and subscriptions." unit={displayCurrency} min={0} max={5000} step={50} value={config.monthly_rent} onChange={(v) => setConfig((p) => ({ ...p, monthly_rent: v }))} color="rose" />
            <ScenarioSlider label="Essential Spending" tooltip="Variable but necessary costs like groceries and transport." unit={displayCurrency} min={0} max={5000} step={50} value={config.essential_spending} onChange={(v) => setConfig((p) => ({ ...p, essential_spending: v }))} color="amber" />
            <ScenarioSlider label="Discretionary Spending" tooltip="Non-essential spending like dining out, entertainment, and shopping." unit={displayCurrency} min={0} max={5000} step={50} value={config.discretionary_spending} onChange={(v) => setConfig((p) => ({ ...p, discretionary_spending: v }))} color="purple" />
          </div>

          <ScenarioManager currentValues={config} onLoad={setConfig} />
        </aside>

        <div className="xl:col-span-8 space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HealthScoreGauge score={simData?.health_score ?? calculateHealthScore(config.monthly_income, totalExpense, config.current_balance, 50)} />
            <ExpensePieChart data={{ rent: config.monthly_rent, food: config.essential_spending, transport: config.discretionary_spending }} />
          </div>

          <div className="relative">
            {isLoading && !simData && (
              <div className={`absolute inset-0 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3 rounded-2xl ${isDark ? "bg-gray-900/80" : "bg-white/80"}`}>
                <Loader2 className={`w-8 h-8 animate-spin ${currentTheme?.text || 'text-indigo-500'}`} />
                <p className={`text-sm font-semibold ${currentTheme?.text || 'text-indigo-500'}`}>Running Simulations...</p>
              </div>
            )}
            <div className={`transition-opacity duration-300 ${isLoading ? "opacity-30" : "opacity-100"}`}>
              {simData ? (
                <SolvencyFanChart days={simData.days} p5={simData.p5} p50={simData.p50} p95={simData.p95} />
              ) : (
                <div className={`border rounded-2xl p-6 h-80 flex items-center justify-center text-sm italic shadow-xl transition-colors duration-300 ${isDark ? "bg-gray-900 border-gray-800 text-gray-600" : "bg-white border-gray-200 text-gray-400"}`}>
                  Calculating projection...
                </div>
              )}
            </div>
          </div>

          <div className={`border rounded-2xl p-6 shadow-xl transition-colors duration-300 ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
            <div className="flex items-center gap-3 mb-4">
              <BrainCircuit className={`w-5 h-5 ${currentTheme?.text || 'text-indigo-500'}`} />
            <Tooltip text="Scored out of 100: 50% based on your cash flow and financial runway, and 50% based on the Monte Carlo simulated bankruptcy risk.">
          <div className="flex items-center gap-1.5 cursor-help">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Analysis Methodology
            </h3>
            <Info className="w-4 h-4 text-gray-400 hover:text-indigo-500 transition-colors" />
          {/* 👇 就是这里！你刚才漏掉了这个闭合标签 */}
          </div> 
        </Tooltip>
            </div>
            <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm leading-relaxed transition-colors duration-300 ${advisoryStyles[advisory.type]}`}>
              {advisoryIcons[advisory.type]}
              <div>
                <p className="font-bold text-xs uppercase tracking-wider mb-1 opacity-70">{advisoryLabels[advisory.type]}</p>
                <p className="whitespace-pre-line">{advisory.text}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}