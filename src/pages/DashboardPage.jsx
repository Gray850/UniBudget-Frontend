// src/pages/DashboardPage.jsx
import { useState, useEffect, useContext, createContext } from "react"
import {
  LayoutDashboard, TrendingUp, AlertTriangle,
  BrainCircuit, Loader2, Database,
} from "lucide-react"

// ============================================================================
// ⚠️⚠️⚠️ 极其重要的本地使用步骤 ⚠️⚠️⚠️
// 1. 在本地 VS Code 中，请取消下面这些 import 的注释（删掉行首的 //）：
// ============================================================================
import ScenarioSlider from "../components/ScenarioSlider"
import SolvencyFanChart from "../components/SolvencyFanChart"
import HealthScoreGauge, { calculateHealthScore } from "../components/HealthScoreGauge"
import ExpensePieChart from "../components/ExpensePieChart"
import ScenarioManager from "../components/ScenarioManager"
import useDebounce from "../hooks/useDebounce"
import { loadTransactions, aggregateToSliderValues } from "../data/transactionStore"
import api from "../data/api"
import { ThemeContext } from "../ThemeContext"

// ============================================================================
// 2. 然后，请彻底删除下面的“临时预览区块”：
// ============================================================================
// ⬇️ 临时预览区块开始 ⬇️
// ⬆️ 临时预览区块结束 ⬆️

// ---------------------------------------------------------------------------
// Mock Monte Carlo fallback
// ---------------------------------------------------------------------------
function mockSimulate(config) {
  const {
    monthly_income,
    monthly_rent,
    essential_spending,
    discretionary_spending,
    current_balance,
  } = config

  const monthlyBalance =
    monthly_income - monthly_rent - essential_spending - discretionary_spending
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
    p5,
    p50,
    p95,
  }
}

// ---------------------------------------------------------------------------
// Advisory engine
// ---------------------------------------------------------------------------
function getAdvisory(simData, config, currencySymbol) {
  if (!simData) return { text: "Awaiting simulation results...", type: "info" }

  const { bankruptcy_probability, p5 } = simData
  const finalP5 = p5?.[p5.length - 1] ?? 0
  const { discretionary_spending, monthly_income } = config

  if (bankruptcy_probability >= 60 || finalP5 < 0) {
    return {
      type: "danger",
      text:
        `Critical: ${bankruptcy_probability}% bankruptcy probability detected.\n` +
        (discretionary_spending > monthly_income * 0.1
          ? `Discretionary spending (${currencySymbol}${discretionary_spending}) is high relative to income. Reduce variable costs immediately.`
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
// Main Dashboard Component
// ---------------------------------------------------------------------------
export default function DashboardPage() {
  // 🌟 从全局 Context 获取状态
  const { isDark, theme: currentTheme, currencySymbol } = useContext(ThemeContext)

  const [config, setConfig] = useState(() => {
    const txs = loadTransactions()
    const totals = aggregateToSliderValues(txs)
    return {
      current_balance:        0,
      monthly_income:         totals.income,
      monthly_rent:           totals.rent,
      essential_spending:     totals.food,
      discretionary_spending: totals.transport,
    }
  })

  // Re-sync slider baselines when returning from Bookkeeping page
  useEffect(() => {
    const handleFocus = () => {
      const txs = loadTransactions()
      const totals = aggregateToSliderValues(txs)
      setConfig((prev) => ({
        ...prev,
        current_balance:        0,
        monthly_income:         totals.income,
        monthly_rent:           totals.rent,
        essential_spending:     totals.food,
        discretionary_spending: totals.transport,
      }))
    }
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  const [simData, setSimData]         = useState(null)
  const [isLoading, setIsLoading]     = useState(false)
  const [isBackendOnline, setBackend] = useState(true)

  const debouncedConfig = useDebounce(config, 500)

  useEffect(() => {
    const run = async () => {
      setIsLoading(true)
      try {
        const payload = {
          initialBalance: debouncedConfig.current_balance + debouncedConfig.monthly_income,
          daysToSimulate: 30,
          expenses: [
            {
              id: "rent", name: "Rent", type: "fixed",
              amount: debouncedConfig.monthly_rent,
              frequency: "monthly", dayOfCharge: 1,
              min: 0, max: 0, probabilityPerDay: 0,
            },
            {
              id: "essential", name: "Essential Spending", type: "variable",
              min: (debouncedConfig.essential_spending * 0.8) / 30,
              max: (debouncedConfig.essential_spending * 1.2) / 30,
              frequency: "daily",
              amount: 0, dayOfCharge: 1, probabilityPerDay: 0,
            },
            {
              id: "discretionary", name: "Discretionary Spending", type: "sporadic",
              min: 0,
              max: debouncedConfig.discretionary_spending * 0.3,
              probabilityPerDay: 0.4,
              amount: 0, dayOfCharge: 1, frequency: "daily",
            },
          ],
        }

        const res = await api.post("/simulate", payload)
        const d   = res.data
        const raw = d.chart_data ?? {}

        const sample = (arr) => {
          if (!arr || arr.length === 0) return Array(12).fill(0)
          return Array.from({ length: 12 }, (_, i) => {
            const idx = Math.min(Math.floor((i / 12) * arr.length), arr.length - 1)
            return arr[idx] ?? 0
          })
        }

        const totalExpenseMonthly =
          debouncedConfig.monthly_rent +
          debouncedConfig.essential_spending +
          debouncedConfig.discretionary_spending

        const healthScore = calculateHealthScore(
          debouncedConfig.monthly_income,
          totalExpenseMonthly,
          d.bankruptcy_probability ?? 0
        )

        setSimData({
          bankruptcy_probability: d.bankruptcy_probability ?? 0,
          health_score:           healthScore,
          days: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
          p5:  sample(raw.p5),
          p50: sample(raw.p50),
          p95: sample(raw.p95),
        })
        setBackend(true)

      } catch {
        setBackend(false)
        setSimData(mockSimulate(debouncedConfig))
      } finally {
        setIsLoading(false)
      }
    }
    run()
  }, [debouncedConfig])

  const totalExpense = config.monthly_rent + config.essential_spending + config.discretionary_spending
  const balance      = config.monthly_income - totalExpense

  const advisory = getAdvisory(simData, config, currencySymbol)

  const advisoryStyles = {
    danger:  isDark ? "bg-rose-500/10 border-rose-500/30 text-rose-300" : "bg-rose-50 border-rose-200 text-rose-700",
    warning: isDark ? "bg-amber-500/10 border-amber-500/30 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-700",
    success: isDark ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-700",
    info:    isDark ? `${currentTheme?.lightBg} border-${currentTheme?.main}-500/30 ${currentTheme?.text}` : `bg-${currentTheme?.main}-50 border-${currentTheme?.main}-200 text-${currentTheme?.main}-700`,
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

      {/* BCS legal disclaimer */}
      <div className={`border-l-4 p-4 rounded-xl transition-colors duration-300 ${isDark ? "bg-amber-500/10 border-amber-500/20 border-l-amber-500" : "bg-amber-50 border-amber-200 border-l-amber-500"}`}>
        <p className={`text-xs font-bold mb-0.5 ${isDark ? "text-amber-400" : "text-amber-700"}`}>Legal Disclaimer</p>
        <p className={`text-xs leading-relaxed ${isDark ? "text-amber-300/60" : "text-amber-700/80"}`}>
          Results are probabilistic projections, not professional financial advice.
          Always consult a certified financial advisor. BCS Code of Conduct observed.
        </p>
      </div>

      {/* Page header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl border transition-colors duration-300 ${isDark ? `${currentTheme?.lightBg} border-${currentTheme?.main}-500/30` : `bg-${currentTheme?.main}-100 border-${currentTheme?.main}-200`}`}>
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
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-colors duration-300 ${
            isBackendOnline
              ? (isDark ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-100 border-emerald-200 text-emerald-700")
              : (isDark ? "bg-gray-800 border-gray-700 text-gray-500" : "bg-gray-200 border-gray-300 text-gray-600")
          }`}>
            <Database className="w-3 h-3" />
            {isBackendOnline ? "Live Engine" : "Mock Mode"}
          </span>

          {isLoading && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors duration-300 ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} ${currentTheme?.text || 'text-indigo-500'}`}>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-medium">Simulating 10,000 scenarios...</span>
            </div>
          )}
        </div>
      </header>

      {/* KPI summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Monthly Balance",
            value: `${currencySymbol}${balance.toLocaleString()}`,
            color: balance >= 0 ? (isDark ? "text-emerald-400" : "text-emerald-600") : (isDark ? "text-rose-400" : "text-rose-600"),
          },
          {
            label: "Total Expenses",
            value: `${currencySymbol}${totalExpense.toLocaleString()}`,
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
          <div
            key={kpi.label}
            className={`border rounded-2xl p-5 shadow-xl transition-colors duration-300 ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
          >
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
              {kpi.label}
            </p>
            <p className={`text-2xl font-extrabold ${kpi.color} ${isLoading ? "opacity-40" : ""} transition-opacity`}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Left column: controls */}
        <aside className="xl:col-span-4 space-y-6">

          {/* Scenario Builder */}
          <div className={`border rounded-2xl p-6 shadow-xl transition-colors duration-300 ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold">Scenario Builder</h2>
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md border transition-colors duration-300 ${isDark ? `${currentTheme?.lightBg} border-${currentTheme?.main}-500/20` : `bg-${currentTheme?.main}-100 border-${currentTheme?.main}-200`} ${currentTheme?.text || 'text-indigo-400'}`}>
                <Database className="w-3 h-3" />
                Ledger Synced
              </span>
            </div>
            <p className={`text-xs mb-6 ${isDark ? "text-gray-600" : "text-gray-500"}`}>
              Baseline from Bookkeeping. Drag to forecast.
            </p>

            <ScenarioSlider
              label="Current Balance" unit={currencySymbol}
              min={0} max={10000} step={100}
              value={config.current_balance}
              onChange={(v) => setConfig((p) => ({ ...p, current_balance: v }))}
              color="teal"
            />
            <ScenarioSlider
              label="Monthly Income" unit={currencySymbol}
              min={0} max={5000} step={50}
              value={config.monthly_income}
              onChange={(v) => setConfig((p) => ({ ...p, monthly_income: v }))}
              color="emerald"
            />
            <ScenarioSlider
              label="Rent" unit={currencySymbol}
              min={0} max={3000} step={25}
              value={config.monthly_rent}
              onChange={(v) => setConfig((p) => ({ ...p, monthly_rent: v }))}
              color="rose"
            />
            <ScenarioSlider
              label="Essential Spending" unit={currencySymbol}
              min={0} max={2000} step={25}
              value={config.essential_spending}
              onChange={(v) => setConfig((p) => ({ ...p, essential_spending: v }))}
              color="amber"
            />
            <ScenarioSlider
              label="Discretionary Spending" unit={currencySymbol}
              min={0} max={2000} step={25}
              value={config.discretionary_spending}
              onChange={(v) => setConfig((p) => ({ ...p, discretionary_spending: v }))}
              color="purple"
            />
          </div>

          {/* Scenario save / load manager */}
          <ScenarioManager
            currentValues={config}
            onLoad={setConfig}
          />

        </aside>

        {/* Right column: visualisations */}
        <div className="xl:col-span-8 space-y-6">

          {/* Health Score + Expense Pie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HealthScoreGauge
              score={
                simData?.health_score ??
                calculateHealthScore(config.monthly_income, totalExpense, 50)
              }
            />
            <ExpensePieChart
              data={{
                rent:      config.monthly_rent,
                food:      config.essential_spending,
                transport: config.discretionary_spending,
              }}
            />
          </div>

          {/* Solvency Fan Chart */}
          <div className="relative">
            {isLoading && !simData && (
              <div className={`absolute inset-0 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3 rounded-2xl ${isDark ? "bg-gray-900/80" : "bg-white/80"}`}>
                <Loader2 className={`w-8 h-8 animate-spin ${currentTheme?.text || 'text-indigo-500'}`} />
                <p className={`text-sm font-semibold ${currentTheme?.text || 'text-indigo-500'}`}>
                  Running Monte Carlo Simulations...
                </p>
              </div>
            )}

            <div className={`transition-opacity duration-300 ${isLoading ? "opacity-30" : "opacity-100"}`}>
              {simData ? (
                <SolvencyFanChart
                  days={simData.days}
                  p5={simData.p5}
                  p50={simData.p50}
                  p95={simData.p95}
                />
              ) : (
                <div className={`border rounded-2xl p-6 h-80 flex items-center justify-center text-sm italic shadow-xl transition-colors duration-300 ${isDark ? "bg-gray-900 border-gray-800 text-gray-600" : "bg-white border-gray-200 text-gray-400"}`}>
                  Adjust sliders to see projection...
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Advisory Insights */}
          <div className={`border rounded-2xl p-6 shadow-xl transition-colors duration-300 ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
            <div className="flex items-center gap-3 mb-4">
              <BrainCircuit className={`w-5 h-5 ${currentTheme?.text || 'text-indigo-500'}`} />
              <h3 className="text-base font-bold">Dynamic Advisory Insights</h3>
            </div>

            <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm leading-relaxed transition-colors duration-300 ${advisoryStyles[advisory.type]}`}>
              {advisoryIcons[advisory.type]}
              <div>
                <p className="font-bold text-xs uppercase tracking-wider mb-1 opacity-70">
                  {advisoryLabels[advisory.type]}
                </p>
                <p className="whitespace-pre-line">{advisory.text}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}