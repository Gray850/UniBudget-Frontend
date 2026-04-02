// src/pages/Settings.jsx
// User Settings and Compliance Centre
// Features: Account management, GDPR data controls, Notifications, and Interactive Theme Colors.

import React, { useState, useContext, createContext } from "react"
import {
  User, ShieldCheck, Bell, Palette,
  Trash2, Download, LogOut, ChevronRight, CheckCircle,
} from "lucide-react"

// ---------------------------------------------------------------------------
// 🌟 临时本地主题配置 (为了确保预览正常运行)
// 请在您本地的项目中，将下面这段替换为：
// import { ThemeContext, THEMES } from "../ThemeContext"
// ---------------------------------------------------------------------------
const THEMES = {
  indigo: { bg: "bg-indigo-500", text: "text-indigo-400", border: "border-indigo-500" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500" },
  rose: { bg: "bg-rose-500", text: "text-rose-400", border: "border-rose-500" }
};

const ThemeContext = createContext({
  isDark: true,
  setIsDark: () => {},
  themeKey: "indigo",
  setThemeKey: () => {},
  theme: THEMES.indigo
});
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function SettingsSection({ icon: Icon, title, description, children }) {
  // 接入主题，让图标颜色跟随主题变化
  const { theme } = useContext(ThemeContext)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-1">
        <Icon className={`w-4 h-4 ${theme.text}`} />
        <h3 className="font-bold text-base text-white">{title}</h3>
      </div>
      {description && (
        <p className="text-xs text-gray-500 mb-5 ml-7">{description}</p>
      )}
      <div className="ml-7 space-y-4">{children}</div>
    </div>
  )
}

function ToggleRow({ label, description, enabled, onChange }) {
  // 接入主题，让开关的激活颜色跟随主题变化
  const { theme } = useContext(ThemeContext)

  return (
    <div className="flex items-center justify-between gap-4 p-3 bg-gray-950 border border-gray-800 rounded-xl">
      <div>
        <p className="text-sm font-semibold text-gray-300">{label}</p>
        {description && (
          <p className="text-xs text-gray-600 mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ${
          enabled ? theme.bg : "bg-gray-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  )
}

function DangerButton({ icon: Icon, label, description, buttonLabel, onClick }) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-rose-950/10 border border-rose-900/30 rounded-xl">
      <div>
        <p className="text-sm font-semibold text-rose-400">{label}</p>
        {description && (
          <p className="text-xs text-rose-400/60 mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={onClick}
        className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-200 shrink-0"
      >
        <Icon className="w-3.5 h-3.5" />
        {buttonLabel}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Settings Page
// ---------------------------------------------------------------------------
export default function Settings() {
  // 👇 获取全局主题状态
  const { isDark, setIsDark, themeKey, setThemeKey, theme } = useContext(ThemeContext)

  const [displayName, setDisplayName] = useState("Owen Lin")
  const [email] = useState("sgylin22@liverpool.ac.uk")
  const [editingName, setEditingName] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)

  const [notifyBankruptcy, setNotifyBankruptcy] = useState(true)
  const [notifyWeekly, setNotifyWeekly]         = useState(false)

  const [currency, setCurrency] = useState("GBP")
  const [exportFlash, setExportFlash] = useState(false)
  const [deleteFlash, setDeleteFlash] = useState(false)

  const handleSaveName = () => {
    setEditingName(false)
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2000)
  }

  const handleExportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      user: { displayName, email },
      localLedger:    JSON.parse(localStorage.getItem("unibudget_transactions") || "[]"),
      localScenarios: JSON.parse(localStorage.getItem("unibudget_scenarios")    || "[]"),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = "unibudget_export.json"
    a.click()
    URL.revokeObjectURL(url)
    setExportFlash(true)
    setTimeout(() => setExportFlash(false), 2000)
  }

  const handleDeleteAccount = () => {
  if (window.confirm("This will permanently delete all your local data. Are you sure?")) {
    localStorage.clear()
    sessionStorage.clear()
    setDeleteFlash(true)
    setTimeout(() => window.location.href = "/login", 1500)
  }
}

  return (
    <main className="min-h-full bg-gray-950 max-w-3xl mx-auto px-6 py-8 space-y-6">

      {/* Page header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white">Settings</h2>
        <p className="text-gray-500 text-sm mt-1">
          Manage your workspace, privacy controls, and preferences.
        </p>
      </div>

      {/* 1. Appearance (🌟 主题与颜色控制区) */}
      <SettingsSection
        icon={Palette}
        title="Appearance"
        description="Customise how UniBudget Lab formats data and visual identity."
      >
        {/* Dark Mode Toggle */}
        <ToggleRow
          label="Dark Mode"
          description="Toggle between light and dark themes."
          enabled={isDark}
          onChange={setIsDark}
        />

        {/* Primary Accent Color Picker */}
        <div className="flex items-center justify-between p-3 bg-gray-950 border border-gray-800 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-gray-300">Primary Accent</p>
            <p className="text-xs text-gray-600 mt-0.5">Select your preferred colour theme.</p>
          </div>
          <div className="flex gap-2">
            {Object.keys(THEMES).map((key) => (
              <button
                key={key}
                onClick={() => setThemeKey(key)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${THEMES[key].bg} ${
                  themeKey === key ? "ring-2 ring-offset-2 ring-offset-gray-950 ring-gray-400" : "opacity-80"
                }`}
              >
                {themeKey === key && <CheckCircle className="w-4 h-4 text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Base Currency */}
        <div className="flex items-center justify-between p-3 bg-gray-950 border border-gray-800 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-gray-300">Base Currency</p>
            <p className="text-xs text-gray-600 mt-0.5">Affects ledger and Monte Carlo outputs.</p>
          </div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-500 transition-colors"
          >
            <option value="GBP">£ GBP — British Pound</option>
            <option value="EUR">€ EUR — Euro</option>
            <option value="USD">$ USD — US Dollar</option>
          </select>
        </div>
      </SettingsSection>

      {/* 2. Notifications */}
      <SettingsSection
        icon={Bell}
        title="Notifications"
        description="Configure how the Advisory Engine communicates with you."
      >
        <ToggleRow
          label="Bankruptcy Risk Alerts"
          description="Alert when 12-month bankruptcy probability exceeds 40%."
          enabled={notifyBankruptcy}
          onChange={setNotifyBankruptcy}
        />
        <ToggleRow
          label="Weekly Ledger Summary"
          description="Automated digest of your bookkeeping patterns."
          enabled={notifyWeekly}
          onChange={setNotifyWeekly}
        />
      </SettingsSection>

      {/* 3. Account */}
      <SettingsSection
        icon={User}
        title="Account"
        description="Your profile linked via OAuth 2.0."
      >
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Display Name</p>
          {editingName ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={`flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors ${theme.border} focus:border-2`}
              />
              <button
                onClick={handleSaveName}
                // 使用动态主题背景色
                className={`${theme.bg} hover:opacity-90 text-white rounded-xl px-5 py-2.5 text-sm font-bold transition-colors`}
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-gray-950 border border-gray-800 rounded-xl px-4 py-3">
              <p className="text-sm font-medium text-white">{displayName}</p>
              <button
                onClick={() => setEditingName(true)}
                className="text-xs font-bold text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
              >
                Edit <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
          {nameSaved && (
            <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Name updated.
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</p>
          <div className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 opacity-60">
            <p className="text-sm text-gray-400">{email}</p>
          </div>
          <p className="text-xs text-gray-700 mt-1">Managed by your OAuth provider.</p>
        </div>

        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </SettingsSection>

      {/* 4. Privacy & GDPR */}
      <SettingsSection
        icon={ShieldCheck}
        title="Privacy & GDPR Compliance"
        description="Your rights under UK GDPR. We collect only what is necessary."
      >
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-400 mb-2">Data we collect</p>
          {[
            "Name and email from your OAuth provider",
            "Financial scenarios you choose to save",
            "Transaction records you manually enter",
            "We never access real banking data",
            "We never sell your data to third parties",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-500">{item}</p>
            </div>
          ))}
        </div>

        <DangerButton
          icon={Download}
          label="Export My Data"
          description="GDPR Art. 20 — Right to Data Portability."
          buttonLabel="Export JSON"
          onClick={handleExportData}
        />
        {exportFlash && (
          <p className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Export downloaded.
          </p>
        )}

        <DangerButton
          icon={Trash2}
          label="Delete My Account"
          description="GDPR Art. 17 — Right to Erasure. Clears all local data and signs you out."
          buttonLabel="Delete Account"
          onClick={handleDeleteAccount}
        />
        {deleteFlash && (
          <p className="text-xs text-rose-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Data cleared. Redirecting to login...
          </p>
        )}

        <p className="text-xs text-gray-700 leading-relaxed border-t border-gray-800 pt-4">
          UniBudget Lab complies with UK GDPR and the BCS Code of Conduct.
          Results are probabilistic projections, not professional financial advice.
        </p>
      </SettingsSection>

      {/* 5. About */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-xs text-gray-600 space-y-1.5">
        <p className="font-bold text-gray-400 mb-3 text-sm">About UniBudget Lab</p>
        <p><span className="text-gray-500">Version:</span> 2.1.0</p>
        <p><span className="text-gray-500">Context:</span> COMP208 Group Project, University of Liverpool</p>
        <p><span className="text-gray-500">Stack:</span> React · Tailwind CSS · Chart.js · FastAPI · PostgreSQL</p>
        <div className="pt-3 mt-2 border-t border-gray-800">
          <p className="mb-1.5 text-gray-500 font-medium">Architectural inspirations:</p>
          <p>maybe-finance/maybe · firefly-iii/firefly-iii · actualbudget/actual · ghostfolio/ghostfolio</p>
        </div>
        <p className="pt-3 mt-2 border-t border-gray-800 text-gray-700 leading-relaxed">
          Disclaimer: Results are probabilistic projections, not professional financial advice.
          BCS Code of Conduct observed.
        </p>
      </div>

    </main>
  )
}
