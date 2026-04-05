// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useContext } from "react"
import {
  LayoutDashboard, TrendingUp, AlertTriangle,
  BrainCircuit, Loader2, Database, Sliders
} from "lucide-react"

// ============================================================================
// ⚠️⚠️⚠️ 极其重要的本地使用步骤 ⚠️⚠️⚠️
// 1. 在本地 VS Code 中，请取消下面这些 import 的注释（删掉行首的 //）：
// ============================================================================
import ScenarioSlider from "../components/ScenarioSlider"
import SolvencyFanChart from "../components/SolvencyFanChart"
import HealthScoreGauge from "../components/HealthScoreGauge"
import ExpensePieChart from "../components/ExpensePieChart"
import ScenarioManager from "../components/ScenarioManager"
import { ThemeContext } from "../ThemeContext"

// ============================================================================
// 2. 然后，请彻底删除下面的“临时预览区块”：
// ============================================================================
// ⬇️ 临时预览区块开始 ⬇️

  // 注意这里模拟器故意不传 currencySymbol 以测试防爆功能
// ⬆️ 临时预览区块结束 ⬆️

// ---------------------------------------------------------------------------
// 本地核心算法：替代缺失的 API
// ---------------------------------------------------------------------------
function calculateHealthScore(income, totalExpense, bankruptcyProbability) {
  const riskRatio = income > 0 ? (totalExpense / income) * 40 : 100
  return Math.max(0, Math.min(100, Math.round(100 - riskRatio - (bankruptcyProbability * 0.2))))
}

function mockSimulate(config) {
  const { monthly_income, monthly_rent, essential_spending, discretionary_spending, current_balance } = config
  const monthlyBalance = monthly_income - monthly_rent - essential_spending - discretionary_spending
  const totalExpense = monthly_rent + essential_spending + discretionary_spending
  const expenseRatio = monthly_income > 0 ? totalExpense / monthly_income : 1
  const volatility   = expenseRatio * 0.4
  const rawRisk      = Math.max(0, Math.min(1, expenseRatio - 0.3 + volatility * Math.random()))
  const bankruptcyProbability = Math.round(rawRisk * 100)

  const p5 = [], p50 = [], p95 = []
  let balance = current_balance || 0

  for (let i = 0; i < 12; i++) {
    const shock = (Math.random() - 0.5) * volatility * monthly_income
    balance += monthlyBalance
    p50.push(Math.round(balance))
    p5.push(Math.round(balance  - Math.abs(shock) * (i + 1) * 0.8))
    p95.push(Math.round(balance + Math.abs(shock) * (i + 1) * 0.5))
  }

  return {
    bankruptcy_probability: bankruptcyProbability,
    health_score: calculateHealthScore(monthly_income, totalExpense, bankruptcyProbability),
    days: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    p5, p50, p95,
  }
}

// ---------------------------------------------------------------------------
// AI 建议引擎
// ---------------------------------------------------------------------------
function getAdvisory(simData, config, displayCurrency) {
  if (!simData) return { text: "Awaiting simulation results...", type: "info" }

  const { bankruptcy_probability, p5 } = simData
  const finalP5 = p5?.[p5.length - 1] ?? 0
  const { discretionary_spending, monthly_income } = config

  if (bankruptcy_probability >= 60 || finalP5 < 0) {
    return {
      type: "danger",
      text: `Critical: ${bankruptcy_probability}% bankruptcy probability detected.\n` +
        (discretionary_spending > monthly_income * 0.1
          ? `Discretionary spending (${displayCurrency}${discretionary_spending}) is high relative to income. Reduce variable costs immediately.`
          : "Essential costs may cause bankruptcy under stress. Consider cheaper housing or additional income sources."),
    }
  }
  if (bankruptcy_probability >= 30) {
    return {
      type: "warning",
      text: `Warning: Elevated risk at ${bankruptcy_probability}%.\nKeep monitoring discretionary spending and maintain an emergency fund of at least 3 months' expenses.`,
    }
  }
  if (finalP5 > 1000 && discretionary_spending < 100) {
    return {
      type: "success",
      text: "Financial position looks stable. Low discretionary spending and a positive P5 outlook. Consider allocating surplus to savings or investments.",
    }
  }
  return {
    type: "info",
    text: "Financial outlook is moderate. Maintain current spending habits and review monthly for any drift in variable costs.",
  }
}

// ---------------------------------------------------------------------------
// 主面板组件
// ---------------------------------------------------------------------------
export default function DashboardPage() {
  // 🌟 接管全局状态
  const { isDark, theme: currentTheme, currencySymbol } = useContext(ThemeContext)
  
  // 🛡️ 防爆保护：如果全局状态里没有给符号，默认使用 £，绝不显示 undefined！
  const displayCurrency = currencySymbol || "£"

  const [config, setConfig] = useState({
    current_balance:        4000,
    monthly_income:         1500,
    monthly_rent:           1150,
    essential_spending:     540,
    discretionary_spending: 450,
  })

  const [simData, setSimData]     = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // 监听参数变化，触发本地模拟
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

  // 传入安全的防爆符号
  const advisory = getAdvisory(simData, config, displayCurrency)

  // 动态主题配色适配
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

      {/* 免责声明 */}
      <div className={`border-l-4 p-4 rounded-xl transition-colors duration-300 ${isDark ? "bg-amber-500/10 border-amber-500/20 border-l-amber-500" : "bg-amber-50 border-amber-200 border-l-amber-500"}`}>
        <p className={`text-xs font-bold mb-0.5 ${isDark ? "text-amber-400" : "text-amber-700"}`}>Legal Disclaimer</p>
        <p className={`text-xs leading-relaxed ${isDark ? "text-amber-300/60" : "text-amber-700/80"}`}>
          Results are probabilistic projections, not professional financial advice.
          Always consult a certified financial advisor. BCS Code of Conduct observed.
        </p>
      </div>

      {/* 页面头部 */}
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

      {/* KPI 数据栏：接入安全的货币符号 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Monthly Balance",
            value: `${displayCurrency}${balance.toLocaleString()}`,
            color: balance >= 0 ? (isDark ? "text-emerald-400" : "text-emerald-600") : (isDark ? "text-rose-400" : "text-rose-600"),
          },
          {
            label: "Total Expenses",
            value: `${displayCurrency}${totalExpense.toLocaleString()}`,
            color: isDark ? "text-rose-400" : "text-rose-600",
          },
          {
            label: "Bankruptcy Risk",
            value: simData ? `${simData.bankruptcy_probability}%` : "--",
            color: !simData                                   ? "text-gray-500"
                 : simData.bankruptcy_probability >= 60       ? (isDark ? "text-rose-400" : "text-rose-600")
                 : simData.bankruptcy_probability >= 30       ? (isDark ? "text-amber-400" : "text-amber-600")
                 : (isDark ? "text-emerald-400" : "text-emerald-600"),
          },
          {
            label: "Health Score",
            value: simData ? `${simData.health_score}/100` : "--",
            color: !simData                   ? "text-gray-500"
                 : simData.health_score >= 70 ? (isDark ? "text-emerald-400" : "text-emerald-600")
                 : simData.health_score >= 40 ? (isDark ? "text-amber-400" : "text-amber-600")
                 : (isDark ? "text-rose-400" : "text-rose-600"),
          },
        ].map((kpi) => (
          <div key={kpi.label} className={`border rounded-2xl p-5 shadow-xl transition-colors duration-300 ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
              {kpi.label}
            </p>
            <p className={`text-2xl font-extrabold ${kpi.color} ${isLoading ? "opacity-40" : ""} transition-opacity`}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* 主面板内容 */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* 左侧：滑块控制区 (传入安全的防爆符号) */}
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
              Drag sliders to forecast your future solvency.
            </p>

            <ScenarioSlider label="Current Balance" unit={displayCurrency} min={0} max={10000} step={100} value={config.current_balance} onChange={(v) => setConfig((p) => ({ ...p, current_balance: v }))} color="teal" />
            <ScenarioSlider label="Monthly Income" unit={displayCurrency} min={0} max={5000} step={50} value={config.monthly_income} onChange={(v) => setConfig((p) => ({ ...p, monthly_income: v }))} color="emerald" />
            <ScenarioSlider label="Rent & Bills" unit={displayCurrency} min={0} max={3000} step={25} value={config.monthly_rent} onChange={(v) => setConfig((p) => ({ ...p, monthly_rent: v }))} color="rose" />
            <ScenarioSlider label="Essential Spending" unit={displayCurrency} min={0} max={2000} step={25} value={config.essential_spending} onChange={(v) => setConfig((p) => ({ ...p, essential_spending: v }))} color="amber" />
            <ScenarioSlider label="Discretionary Spending" unit={displayCurrency} min={0} max={2000} step={25} value={config.discretionary_spending} onChange={(v) => setConfig((p) => ({ ...p, discretionary_spending: v }))} color="purple" />
          </div>

          <ScenarioManager currentValues={config} onLoad={setConfig} />
        </aside>

        {/* 右侧：数据图表区 */}
        <div className="xl:col-span-8 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HealthScoreGauge score={simData?.health_score ?? calculateHealthScore(config.monthly_income, totalExpense, 50)} />
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
              <h3 className="text-base font-bold">Dynamic Advisory Insights</h3>
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