// src/pages/SettingsPage.jsx
import React, { useState, useContext, createContext } from "react";
import {
  User, ShieldCheck, Bell, Palette,
  Trash2, Download, LogOut, ChevronRight, CheckCircle, Moon, Sun
} from "lucide-react";

// ============================================================================
// ⚠️⚠️⚠️ 极其重要的本地使用步骤 ⚠️⚠️⚠️
// 为了实现你要求的“全站联动变色”，当你把这段代码粘贴到你的 VS Code 后，请执行以下两步：
// 
// 1. 删掉下面这行代码前面的双斜杠 (//)，让它恢复成正常的引入：
// // import { ThemeContext, THEMES } from "../ThemeContext";
//
// 2. 删掉下面这个专门为了在线预览不报错而写的“临时区块”（第 19 行到第 28 行）。
// ============================================================================

// ⬇️ 临时区块开始 (在本地 VS Code 中请将这段完全删除) ⬇️
const THEMES = {
  indigo: { bg: "bg-indigo-600", text: "text-indigo-500", border: "border-indigo-500", ring: "ring-indigo-500" },
  emerald: { bg: "bg-emerald-600", text: "text-emerald-500", border: "border-emerald-500", ring: "ring-emerald-500" },
  rose: { bg: "bg-rose-600", text: "text-rose-500", border: "border-rose-500", ring: "ring-rose-500" },
};
const ThemeContext = createContext({
  isDark: true, setIsDark: () => {}, themeKey: "indigo", setThemeKey: () => {}, theme: THEMES.indigo
});
// ⬆️ 临时区块结束 ⬆️

// ---------------------------------------------------------------------------
// 子组件 (支持主题与暗黑模式传入)
// ---------------------------------------------------------------------------
function SettingsSection({ icon: Icon, title, description, children, theme, isDark }) {
  return (
    <div className={`border rounded-2xl p-6 shadow-xl transition-colors ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
      <div className="flex items-center gap-3 mb-1">
        <Icon className={`w-4 h-4 ${theme?.text || 'text-indigo-500'}`} />
        <h3 className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h3>
      </div>
      {description && (
        <p className="text-xs text-gray-500 mb-5 ml-7">{description}</p>
      )}
      <div className="ml-7 space-y-4">{children}</div>
    </div>
  );
}

function ToggleRow({ label, description, enabled, onChange, theme, isDark }) {
  return (
    <div className={`flex items-center justify-between gap-4 p-3 border rounded-xl transition-colors ${isDark ? "bg-gray-950 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
      <div>
        <p className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>{label}</p>
        {description && (
          <p className={`text-xs mt-0.5 ${isDark ? "text-gray-600" : "text-gray-500"}`}>{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ${
          enabled ? (theme?.bg || "bg-indigo-600") : (isDark ? "bg-gray-700" : "bg-gray-300")
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function DangerButton({ icon: Icon, label, description, buttonLabel, onClick, isDark }) {
  return (
    <div className={`flex items-center justify-between gap-4 p-4 border rounded-xl transition-colors ${isDark ? "bg-rose-950/10 border-rose-900/30" : "bg-rose-50 border-rose-200"}`}>
      <div>
        <p className={`text-sm font-semibold ${isDark ? "text-rose-400" : "text-rose-600"}`}>{label}</p>
        {description && (
          <p className={`text-xs mt-0.5 ${isDark ? "text-rose-400/60" : "text-rose-500"}`}>{description}</p>
        )}
      </div>
      <button
        onClick={onClick}
        className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all duration-200 shrink-0 ${isDark ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white" : "bg-white border-rose-200 text-rose-600 hover:bg-rose-500 hover:text-white shadow-sm"}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {buttonLabel}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 主设置页面组件
// ---------------------------------------------------------------------------
export default function SettingsPage() {
  const { isDark, setIsDark, themeKey, setThemeKey, theme: currentTheme } = useContext(ThemeContext);

  const [displayName, setDisplayName] = useState("Owen Lin");
  const [email] = useState("sgylin22@liverpool.ac.uk");
  const [editingName, setEditingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const [notifyBankruptcy, setNotifyBankruptcy] = useState(true);
  const [notifyWeekly, setNotifyWeekly]         = useState(false);

  const [currency, setCurrency] = useState("GBP");
  const [exportFlash, setExportFlash] = useState(false);
  const [deleteFlash, setDeleteFlash] = useState(false);

  const handleSaveName = () => {
    setEditingName(false);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  const handleExportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      user: { displayName, email },
      localLedger:    JSON.parse(localStorage.getItem("unibudget_transactions") || "[]"),
      localScenarios: JSON.parse(localStorage.getItem("unibudget_scenarios")    || "[]"),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "unibudget_export.json";
    a.click();
    URL.revokeObjectURL(url);
    setExportFlash(true);
    setTimeout(() => setExportFlash(false), 2000);
  };

  const handleDeleteAccount = () => {
    if (window.confirm("This will permanently delete all your local data. Are you sure?")) {
      localStorage.clear();
      sessionStorage.clear();
      setDeleteFlash(true);
      setTimeout(() => window.location.href = "/login", 1500);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-gray-950" : "bg-gray-50"}`}>
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        <div>
          <h2 className={`text-3xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>Settings</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage your workspace, privacy controls, and preferences.
          </p>
        </div>

        {/* 1. 外观设置 */}
        <SettingsSection
          icon={Palette}
          title="Appearance"
          description="Customise how UniBudget Lab formats data and visual identity."
          theme={currentTheme}
          isDark={isDark}
        >
          <ToggleRow
            label="Dark Mode"
            description="Toggle between light and dark themes."
            enabled={isDark}
            onChange={setIsDark}
            theme={currentTheme}
            isDark={isDark}
          />
          
          <div className={`flex items-center justify-between p-3 border rounded-xl transition-colors ${isDark ? "bg-gray-950 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
            <div>
              <p className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>Primary Accent</p>
              <p className={`text-xs mt-0.5 ${isDark ? "text-gray-600" : "text-gray-500"}`}>Select your preferred colour theme.</p>
            </div>
            <div className="flex gap-2">
              {THEMES && Object.keys(THEMES).map((key) => (
                <button
                  key={key}
                  onClick={() => setThemeKey(key)} 
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${THEMES[key].bg} ${
                    themeKey === key ? `ring-2 ring-offset-2 ${isDark ? "ring-offset-gray-950" : "ring-offset-gray-50"} ${THEMES[key].ring || 'ring-gray-400'}` : "opacity-80"
                  }`}
                >
                  {themeKey === key && <CheckCircle className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className={`flex items-center justify-between p-3 border rounded-xl transition-colors ${isDark ? "bg-gray-950 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
            <div>
              <p className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>Base Currency</p>
              <p className={`text-xs mt-0.5 ${isDark ? "text-gray-600" : "text-gray-500"}`}>Affects ledger and Monte Carlo outputs.</p>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={`border rounded-xl px-3 py-2 text-sm focus:outline-none transition-colors ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"}`}
            >
              <option value="GBP">£ GBP — British Pound</option>
              <option value="EUR">€ EUR — Euro</option>
              <option value="USD">$ USD — US Dollar</option>
            </select>
          </div>
        </SettingsSection>

        {/* 2. 通知设置 */}
        <SettingsSection icon={Bell} title="Notifications" theme={currentTheme} isDark={isDark}>
          <ToggleRow label="Bankruptcy Risk Alerts" enabled={notifyBankruptcy} onChange={setNotifyBankruptcy} theme={currentTheme} isDark={isDark} />
          <ToggleRow label="Weekly Ledger Summary" enabled={notifyWeekly} onChange={setNotifyWeekly} theme={currentTheme} isDark={isDark} />
        </SettingsSection>

        {/* 3. 账户管理 */}
        <SettingsSection icon={User} title="Account" theme={currentTheme} isDark={isDark}>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Display Name</p>
            {editingName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={`flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors ${currentTheme?.border || 'border-indigo-500'} focus:border-2 ${isDark ? "bg-gray-950 border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900 shadow-sm"}`}
                />
                <button
                  onClick={handleSaveName}
                  className={`${currentTheme?.bg || 'bg-indigo-600'} hover:brightness-110 text-white rounded-xl px-5 py-2.5 text-sm font-bold transition-colors`}
                >
                  Save
                </button>
              </div>
            ) : (
              <div className={`flex items-center justify-between border rounded-xl px-4 py-3 transition-colors ${isDark ? "bg-gray-950 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
                <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{displayName}</p>
                <button onClick={() => setEditingName(true)} className="text-xs font-bold text-gray-500 hover:text-gray-400 flex items-center gap-1 transition-colors">
                  Edit <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
            {nameSaved && <p className={`text-xs ${currentTheme?.text || 'text-indigo-500'} mt-1.5 flex items-center gap-1`}><CheckCircle className="w-3 h-3" /> Name updated.</p>}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</p>
            <div className={`border rounded-xl px-4 py-3 opacity-60 transition-colors ${isDark ? "bg-gray-950 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{email}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">Managed by your OAuth provider.</p>
          </div>
          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-400 transition-colors">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </SettingsSection>

        {/* 4. 隐私与 GDPR */}
        <SettingsSection icon={ShieldCheck} title="Privacy & GDPR" theme={currentTheme} isDark={isDark}>
          <DangerButton icon={Download} label="Export Data" buttonLabel="Export JSON" onClick={handleExportData} isDark={isDark} />
          <DangerButton icon={Trash2} label="Delete Account" buttonLabel="Delete" onClick={handleDeleteAccount} isDark={isDark} />
        </SettingsSection>

      </main>
    </div>
  );
}