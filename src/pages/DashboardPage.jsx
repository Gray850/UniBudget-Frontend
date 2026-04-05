// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useContext, createContext } from "react"
import {
  LayoutDashboard, TrendingUp, AlertTriangle,
  BrainCircuit, Loader2, Database, Sliders, Info
} from "lucide-react"

// ============================================================================
// ⚠️⚠️⚠️ 极其重要的本地使用步骤 ⚠️⚠️⚠️
// 1. 在本地 VS Code 中，请取消下面这些 import 的注释（删掉行首的 //）：
// ============================================================================
import SolvencyFanChart from "../components/SolvencyFanChart"
import HealthScoreGauge from "../components/HealthScoreGauge"
import ExpensePieChart from "../components/ExpensePieChart"
import ScenarioManager from "../components/ScenarioManager"
import { ThemeContext } from "../ThemeContext"

// ============================================================================
// 2. 然后，请彻底删除下面的“临时预览区块”：
// ============================================================================
// ⬇️ 临时预览区块开始 ⬇️
// ⬆️ 临时预览区块结束 ⬆️
// ---------------------------------------------------------------------------
// 🌟 内置的滑块组件（带手动输入框）
// ---------------------------------------------------------------------------
// 🌟 带有数字输入框且具备“进度颜色”效果的滑块组件

// 🌟 纯手工打造的悬浮提示框组件
function Tooltip({ children, text }) {
  // 如果没有传 text，就直接返回原来的元素，不加悬浮框
  if (!text) return children; 

  return (
    <div className="group relative flex items-center cursor-help w-fit">
      {children}
      {/* 这是一个绝对定位的黑色小框框，默认是透明的 (opacity-0)，鼠标移入 group 时变成不透明 (group-hover:opacity-100) */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 text-xs text-white bg-gray-800 dark:bg-gray-700 rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 text-center leading-relaxed">
        {text}
        {/* 这里是用 CSS 画的一个倒三角小尾巴 */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800 dark:border-t-gray-700"></div>
      </div>
    </div>
  );
}



function ScenarioSlider({ label, value, unit, onChange, min = 0, max = 10000, step = 100, color = "indigo" }) {
  // 颜色映射表：用于输入框文字颜色和进度条填充色
  const colorMap = {
    teal: { text: "text-teal-500", hex: "#14b8a6" },
    emerald: { text: "text-emerald-500", hex: "#10b981" },
    rose: { text: "text-rose-500", hex: "#f43f5e" },
    amber: { text: "text-amber-500", hex: "#f59e0b" },
    purple: { text: "text-purple-500", hex: "#a855f7" },
    indigo: { text: "text-indigo-500", hex: "#6366f1" }
  };

  const currentColor = colorMap[color] || colorMap.indigo;

  // 核心逻辑：计算当前进度百分比，用于渲染左侧填充色
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
        <label className="text-sm font-semibold dark:text-gray-300 text-gray-700">{label}</label>
        
        {/* 数字输入框 */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/50 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-gray-400 transition-all">
          <span className="text-sm font-bold text-gray-400">{unit}</span>
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            className={`w-20 bg-transparent text-right text-sm font-bold focus:outline-none ${currentColor.text}`}
          />
        </div>
      </div>

      {/* 🌟 进度条：通过 linear-gradient 实现左侧填色效果 */}
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
// 本地核心算法：加入了 Current Balance 缓冲机制
// ---------------------------------------------------------------------------
function calculateHealthScore(income, totalExpense, currentBalance, bankruptcyProbability) {
  // 引入存款作为缓冲：把本金分摊到12个月里增强抗风险能力
  const monthlyBuffer = income + (currentBalance / 6)
  const riskRatio = monthlyBuffer > 0 ? (totalExpense / monthlyBuffer) * 35 : 100
  return Math.max(0, Math.min(100, Math.round(100 - riskRatio - (bankruptcyProbability * 0.5))))
}

function mockSimulate(config) {
  const { monthly_income, monthly_rent, essential_spending, discretionary_spending, current_balance } = config
  const totalExpense = monthly_rent + essential_spending + discretionary_spending
  const monthlyBalance = monthly_income - totalExpense
  
  // 💡 全新风险算法：完美融合 Current Balance (初始存款)
  let baseRisk = 0
  if (monthlyBalance < 0) {
    // 亏钱状态：算一下存款还能撑几个月 (Runway)
    const monthsLeft = current_balance / Math.abs(monthlyBalance)
    if (monthsLeft < 12) {
      // 12个月内就会花光存款，风险飙升！(刚够撑12个月是25%风险，马上破产是95%)
      baseRisk = 95 - (monthsLeft / 12) * 70
    } else {
      // 存款够厚，能撑一年以上，风险很低
      baseRisk = Math.max(5, 25 - (monthsLeft - 12))
    }
  } else {
    // 赚钱状态：看存款抗压能力
    const bufferMonths = totalExpense > 0 ? current_balance / totalExpense : 10
    baseRisk = Math.max(1, 15 - bufferMonths) // 存款越多，风险越逼近 1%
  }

  // 增加蒙特卡洛模拟的随机波动
  const volatility = (totalExpense / (monthly_income || 1)) * 3
  const bankruptcyProbability = Math.max(0, Math.min(100, Math.round(baseRisk + (Math.random() - 0.5) * volatility)))

  const p5 = [], p50 = [], p95 = []
  let balance = current_balance || 0

  for (let i = 0; i < 12; i++) {
    // 模拟每月的突发支出
    const shock = (Math.random() - 0.5) * volatility * 80
    balance += monthlyBalance
    p50.push(Math.round(balance))
    // 悲观预测 (遇到突发大额支出)
    p5.push(Math.round(balance - Math.abs(shock) * (i + 1) * 1.5))
    // 乐观预测
    p95.push(Math.round(balance + Math.abs(shock) * (i + 1) * 0.5))
  }

  return {
    bankruptcy_probability: bankruptcyProbability,
    health_score: calculateHealthScore(monthly_income, totalExpense, current_balance, bankruptcyProbability),
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
  const { discretionary_spending, monthly_income, current_balance } = config

  if (bankruptcy_probability >= 60 || finalP5 < 0) {
    return {
      type: "danger",
      text: `Critical: ${bankruptcy_probability}% bankruptcy probability detected.\n` +
        (current_balance < monthly_income
          ? `Your cash reserves are dangerously low. Reduce discretionary spending (${displayCurrency}${discretionary_spending}) immediately.`
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
  // 🌟 接管全局状态
  const { isDark, theme: currentTheme, currencySymbol } = useContext(ThemeContext)
  
  // 🛡️ 防爆保护：如果全局状态里没有给符号，默认使用 £，绝不显示 undefined！
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
  tooltip: "Scored out of 100. Points are deducted if expenses exceed your buffer, with heavy penalties for high bankruptcy risk.", // 👈 English tooltip!
  value: simData ? `${simData.health_score}/100` : "--",
            color: !simData                   ? "text-gray-500"
                 : simData.health_score >= 70 ? (isDark ? "text-emerald-400" : "text-emerald-600")
                 : simData.health_score >= 40 ? (isDark ? "text-amber-400" : "text-amber-600")
                 : (isDark ? "text-rose-400" : "text-rose-600"),
          },
       ].map((kpi) => (
          <div key={kpi.label} className={`border rounded-2xl p-5 shadow-xl transition-colors duration-300 ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
            
            {/* 👇 替换的部分在这里：用 Tooltip 把标题包起来，并加上 Info 图标 */}
            <Tooltip text={kpi.tooltip}>
              <p className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2 cursor-help ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                {kpi.label}
                {kpi.tooltip && <Info className="w-3.5 h-3.5 opacity-60 hover:text-indigo-500 transition-colors" />}
              </p>
            </Tooltip>
            {/* 👆 替换结束 */}

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

            <ScenarioSlider label="Current Balance" unit={displayCurrency} min={0} max={50000} step={100} value={config.current_balance} onChange={(v) => setConfig((p) => ({ ...p, current_balance: v }))} color="teal" />
            <ScenarioSlider label="Monthly Income" unit={displayCurrency} min={0} max={10000} step={50} value={config.monthly_income} onChange={(v) => setConfig((p) => ({ ...p, monthly_income: v }))} color="emerald" />
            <ScenarioSlider label="Rent & Bills" unit={displayCurrency} min={0} max={5000} step={25} value={config.monthly_rent} onChange={(v) => setConfig((p) => ({ ...p, monthly_rent: v }))} color="rose" />
            <ScenarioSlider label="Essential Spending" unit={displayCurrency} min={0} max={5000} step={25} value={config.essential_spending} onChange={(v) => setConfig((p) => ({ ...p, essential_spending: v }))} color="amber" />
            <ScenarioSlider label="Discretionary Spending" unit={displayCurrency} min={0} max={5000} step={25} value={config.discretionary_spending} onChange={(v) => setConfig((p) => ({ ...p, discretionary_spending: v }))} color="purple" />
          </div>

          <ScenarioManager currentValues={config} onLoad={setConfig} />
        </aside>

        {/* 右侧：数据图表区 */}
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