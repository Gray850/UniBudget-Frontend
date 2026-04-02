import React, { useContext } from "react";
import { Moon, Sun, Palette, CheckCircle } from "lucide-react";
import { ThemeContext } from "../App";

export default function SettingsPage() {
  const { isDark, setIsDark, themeKey, setThemeKey, theme } = useContext(ThemeContext);

  // 由于我们要循环渲染主题颜色，所以在组件内重新定义一下颜色配置对象用于遍历
  const availableThemes = {
    indigo: { bg: "bg-indigo-500" },
    emerald: { bg: "bg-emerald-500" },
    rose: { bg: "bg-rose-500" }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Appearance Settings</h2>
      
      <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} border rounded-2xl p-6 shadow-sm transition-colors duration-300`}>
        {/* Theme Toggle */}
        <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className={`w-5 h-5 ${theme.text}`} /> : <Sun className={`w-5 h-5 ${theme.text}`} />}
            <div>
              <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Color Mode</p>
              <p className="text-sm text-gray-500">Switch between light and dark themes</p>
            </div>
          </div>
          <button 
            onClick={() => setIsDark(!isDark)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDark ? theme.bg : "bg-gray-300"}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDark ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>

        {/* Accent Color Picker */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Palette className={`w-5 h-5 ${theme.text}`} />
            <div>
              <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Primary Accent Color</p>
              <p className="text-sm text-gray-500">Personalize your dashboard's look</p>
            </div>
          </div>
          <div className="flex gap-3">
            {Object.keys(availableThemes).map((key) => (
              <button
                key={key}
                onClick={() => setThemeKey(key)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${availableThemes[key].bg} ${themeKey === key ? "ring-4 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900" : "opacity-80"}`}
              >
                {themeKey === key && <CheckCircle className="w-4 h-4 text-white" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
