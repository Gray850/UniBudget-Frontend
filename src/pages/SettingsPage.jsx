import React, { useState, useContext, createContext } from "react";
import {
  User, ShieldCheck, Palette,
  Trash2, Download, LogOut, ChevronRight, CheckCircle, Coins
} from "lucide-react";

// ============================================================================
// ⚠️⚠️⚠️ 极其重要的本地使用步骤 ⚠️⚠️⚠️
// 为了实现您要求的“全站联动变色与货币同步”，并在当前预览环境中不报错，请执行以下步骤：
//
// 1. 在您的本地代码中，请取消下面这行的注释（去掉行首的 // ），引入您真正的全局配置：
import { ThemeContext, THEMES } from "../ThemeContext";
//
// 2. 然后，请删除下面的两个“临时预览区块”。
// 3. 将 `export function SettingsPage` 改回 `export default function SettingsPage`
// ============================================================================

// ⬇️ 临时预览区块一：模拟主题数据 (在本地 VS Code 中请将这段完全删除) ⬇️
// ⬆️ 临时预览区块一结束 ⬆️

// ---------------------------------------------------------------------------
// 子组件 (已升级：全面支持白天/黑夜模式和全局主题色)

function SettingsSection({ icon: Icon, title, description, children, theme, isDark }) {
  return (
    <div className={`border rounded-2xl p-6 shadow-xl transition-colors duration-300 ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
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
    <div className={`flex items-center justify-between gap-4 p-3 border rounded-xl transition-colors duration-300 ${isDark ? "bg-gray-950 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
      <div>
        <p className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>{label}</p>
        {description && (
          <p className={`text-xs mt-0.5 ${isDark ? "text-gray-600" : "text-gray-500"}`}>{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 ${
          enabled ? (theme?.bg || "bg-indigo-600") : (isDark ? "bg-gray-700" : "bg-gray-300")
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function DangerButton({ icon: Icon, label, description, buttonLabel, onClick, isDark }) {
  return (
    <div className={`flex items-center justify-between gap-4 p-4 border rounded-xl transition-colors duration-300 ${isDark ? "bg-rose-950/10 border-rose-900/30" : "bg-rose-50 border-rose-200"}`}>
      <div>
        <p className={`text-sm font-semibold ${isDark ? "text-rose-400" : "text-rose-600"}`}>{label}</p>
        {description && (
          <p className={`text-xs mt-0.5 ${isDark ? "text-rose-400/60" : "text-rose-500"}`}>{description}</p>
        )}
      </div>
      <button
        onClick={onClick}
        className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all duration-200 shrink-0 ${
          isDark 
            ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white" 
            : "bg-white border-rose-200 text-rose-600 hover:bg-rose-500 hover:text-white shadow-sm"
        }`}
      >
        <Icon className="w-3.5 h-3.5" />
        {buttonLabel}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 主设置页面组件 (⚠️ 本地使用时，请将这里改为 export default function SettingsPage)
// ---------------------------------------------------------------------------
export default function SettingsPage() {
  // 🌟 魔法在这里：从全局接管 isDark, theme, currency 等状态
  const { 
    isDark, setIsDark, 
    themeKey, setThemeKey, 
    theme: currentTheme, 
    currency, setCurrency 
  } = useContext(ThemeContext);

  const [displayName, setDisplayName] = useState("Owen Lin");
  const [email] = useState("sgylin22@liverpool.ac.uk");
  const [editingName, setEditingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

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
    <div className={`min-h-full transition-colors duration-300 ${isDark ? "bg-[#0b0f19]" : "bg-gray-50"}`}>
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* 页面头部 */}
        <div>
          <h2 className={`text-3xl font-extrabold ${isDark ? "text-white" : "text-gray-900"}`}>Settings</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage your workspace, privacy controls, and preferences.
          </p>
        </div>

        {/* 1. 外观设置 (包含全站联动的 黑夜模式、主题色、货币) */}
        <SettingsSection
          icon={Palette}
          title="Appearance"
          description="Customise how UniBudget Lab formats data and visual identity."
          theme={currentTheme}
          isDark={isDark}
        >
          {/* 白天/黑夜模式切换器 */}
          <ToggleRow
            label="Dark Mode"
            description="Toggle between light and dark themes."
            enabled={isDark}
            onChange={setIsDark}
            theme={currentTheme}
            isDark={isDark}
          />
          
          {/* 主题颜色选择器 */}
          <div className={`flex items-center justify-between p-3 border rounded-xl transition-colors duration-300 ${isDark ? "bg-gray-950 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
            <div>
              <p className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>Accent Color</p>
              <p className={`text-xs mt-0.5 ${isDark ? "text-gray-600" : "text-gray-500"}`}>Select your preferred colour theme.</p>
            </div>
            <div className="flex gap-2">
              {THEMES && Object.keys(THEMES).map((key) => (
                <button
                  key={key}
                  onClick={() => setThemeKey(key)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${THEMES[key].bg} ${
                    themeKey === key ? `ring-2 ring-offset-2 ${isDark ? "ring-offset-gray-950" : "ring-offset-gray-50"} ${THEMES[key].border || 'ring-gray-400'}` : "opacity-80"
                  }`}
                >
                  {themeKey === key && <CheckCircle className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* 货币选择器 */}
          <div className={`flex items-center justify-between p-3 border rounded-xl transition-colors duration-300 ${isDark ? "bg-gray-950 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
            <div>
              <p className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>Base Currency</p>
              <p className={`text-xs mt-0.5 ${isDark ? "text-gray-600" : "text-gray-500"}`}>Affects ledger and Monte Carlo outputs.</p>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={`border rounded-xl px-3 py-2 text-sm focus:outline-none transition-colors duration-300 ${
                isDark 
                  ? "bg-gray-800 border-gray-700 text-white" 
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="GBP">£ GBP — British Pound</option>
              <option value="EUR">€ EUR — Euro</option>
              <option value="USD">$ USD — US Dollar</option>
            </select>
          </div>
        </SettingsSection>

        {/* 2. 账户管理 */}
        <SettingsSection
          icon={User}
          title="Account"
          description="Your profile linked via OAuth 2.0."
          theme={currentTheme}
          isDark={isDark}
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Display Name</p>
            {editingName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={`flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors duration-300 ${currentTheme?.border || 'border-indigo-500'} focus:border-2 ${
                    isDark ? "bg-gray-950 border-gray-800 text-white" : "bg-white border-gray-300 text-gray-900 shadow-sm"
                  }`}
                />
                <button
                  onClick={handleSaveName}
                  className={`${currentTheme?.bg || 'bg-indigo-600'} hover:brightness-110 text-white rounded-xl px-5 py-2.5 text-sm font-bold transition-colors`}
                >
                  Save
                </button>
              </div>
            ) : (
              <div className={`flex items-center justify-between border rounded-xl px-4 py-3 transition-colors duration-300 ${isDark ? "bg-gray-950 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
                <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{displayName}</p>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-xs font-bold text-gray-500 hover:text-gray-400 flex items-center gap-1 transition-colors"
                >
                  Edit <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
            {nameSaved && (
              <p className={`text-xs ${currentTheme?.text || 'text-indigo-500'} mt-1.5 flex items-center gap-1`}>
                <CheckCircle className="w-3 h-3" /> Name updated.
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</p>
            <div className={`border rounded-xl px-4 py-3 opacity-60 transition-colors duration-300 ${isDark ? "bg-gray-950 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{email}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">Managed by your OAuth provider.</p>
          </div>

          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-400 transition-colors">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </SettingsSection>

        {/* 3. 隐私与 GDPR */}
        <SettingsSection
          icon={ShieldCheck}
          title="Privacy & GDPR Compliance"
          description="Your rights under UK GDPR. We collect only what is necessary."
          theme={currentTheme}
          isDark={isDark}
        >
          <div className={`border rounded-xl p-4 space-y-2 transition-colors duration-300 ${isDark ? "bg-gray-950 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
            <p className={`text-xs font-semibold mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Data we collect</p>
            {[
              "Name and email from your OAuth provider",
              "Financial scenarios you choose to save",
              "Transaction records you manually enter",
              "We never access real banking data",
              "We never sell your data to third parties",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <ShieldCheck className={`w-3.5 h-3.5 ${currentTheme?.text || 'text-emerald-500'} mt-0.5 shrink-0`} />
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
            isDark={isDark}
          />
          {exportFlash && (
            <p className={`text-xs ${currentTheme?.text || 'text-emerald-400'} flex items-center gap-1`}>
              <CheckCircle className="w-3 h-3" /> Export downloaded.
            </p>
          )}

          <DangerButton
            icon={Trash2}
            label="Delete My Account"
            description="GDPR Art. 17 — Right to Erasure. Clears all local data and signs you out."
            buttonLabel="Delete Account"
            onClick={handleDeleteAccount}
            isDark={isDark}
          />
          {deleteFlash && (
            <p className="text-xs text-rose-500 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Data cleared. Redirecting to login...
            </p>
          )}

          <p className={`text-xs leading-relaxed border-t pt-4 ${isDark ? "border-gray-800 text-gray-700" : "border-gray-200 text-gray-500"}`}>
            UniBudget Lab complies with UK GDPR and the BCS Code of Conduct.
            Results are probabilistic projections, not professional financial advice.
          </p>
        </SettingsSection>
        {/* 4. 关于项目 */}
        <div className={`border rounded-2xl p-6 text-xs space-y-1.5 transition-colors duration-300 ${isDark ? "bg-gray-900 border-gray-800 text-gray-600" : "bg-white border-gray-200 text-gray-500"}`}>
          <p className={`font-bold mb-3 text-sm ${isDark ? "text-gray-400" : "text-gray-700"}`}>About UniBudget Lab</p>
          <p><span className={isDark ? "text-gray-500" : "text-gray-400"}>Version:</span> 2.1.0</p>
          <p><span className={isDark ? "text-gray-500" : "text-gray-400"}>Context:</span> COMP208 Group Project, University of Liverpool</p>
          <p><span className={isDark ? "text-gray-500" : "text-gray-400"}>Stack:</span> React · Tailwind CSS · Chart.js · FastAPI · PostgreSQL</p>
          <div className={`pt-3 mt-2 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <p className={`mb-1.5 font-medium ${isDark ? "text-gray-500" : "text-gray-600"}`}>Architectural inspirations:</p>
            <p>maybe-finance/maybe · firefly-iii/firefly-iii · actualbudget/actual · ghostfolio/ghostfolio</p>
          </div>
          <p className={`pt-3 mt-2 border-t leading-relaxed ${isDark ? "border-gray-800 text-gray-700" : "border-gray-200 text-gray-500"}`}>
            Disclaimer: Results are probabilistic projections, not professional financial advice.
            BCS Code of Conduct observed.
          </p>
        </div>

      </main>
    </div>
  );
}
// ⬇️ 临时预览区块二：让预览环境有数据环境 (在本地 VS Code 中请将这段完全删除) ⬇️
// ⬆️ 临时预览区块二结束 ⬆️