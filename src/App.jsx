import React, { useState, useEffect, createContext } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from "chart.js";

// ============================================================================
// ⚠️⚠️⚠️ 极其重要的本地使用步骤 ⚠️⚠️⚠️
// 1. 在本地 VS Code 中，请取消下面这些 import 的注释（删掉行首的 //）：
// ============================================================================
import LoginPage from "./components/LoginPage";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import { ThemeContext, THEMES } from "./ThemeContext";

// ============================================================================
// 2. 然后，请彻底删除下面的“临时预览区块”：
// ============================================================================
// ⬇️ 临时预览区块开始 ⬇️
// ⬆️ 临时预览区块结束 ⬆️

// 注册 Chart.js 插件
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [themeKey, setThemeKey] = useState("indigo");
  const [currentPath, setCurrentPath] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 🌟 1. 新增：在这里定义全局货币状态，并设置符号字典
  const [currency, setCurrency] = useState("GBP");
  const currencySymbols = { 
    GBP: "£", 
    EUR: "€", 
    USD: "$" 
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    // 🌟 2. 关键修复：把 currency, setCurrency 和 currencySymbol 塞进 Provider 提供给全站
    <ThemeContext.Provider value={{ 
      isDark, 
      setIsDark, 
      themeKey, 
      setThemeKey, 
      theme: THEMES[themeKey] || THEMES.indigo,
      currency,
      setCurrency,
      currencySymbol: currencySymbols[currency]
    }}>
      {!isLoggedIn ? (
        <LoginPage onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <div className={`min-h-screen flex font-sans transition-colors duration-300 ${isDark ? "bg-[#0b0f19] text-white dark" : "bg-gray-50 text-gray-900"}`}>
          <Sidebar 
            currentPath={currentPath} 
            setCurrentPath={setCurrentPath} 
            isCollapsed={isSidebarCollapsed} 
            setIsCollapsed={setIsSidebarCollapsed} 
            onLogout={() => setIsLoggedIn(false)} 
          />
          <div className="flex-1 overflow-auto h-screen relative">
            <header className={`sticky top-0 z-10 px-8 py-6 backdrop-blur-md border-b ${isDark ? "border-gray-800/50 bg-[#0b0f19]/80" : "border-gray-200 bg-gray-50/80"}`}>
              <h1 className="text-2xl font-bold capitalize">{currentPath}</h1>
            </header>
            <main className="p-8 pb-20">
              {currentPath === "dashboard" && <DashboardPage />}
              {currentPath === "bookkeeping" && (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-500 rounded-xl">
                  <p className="text-gray-500">Bookkeeping Module Placeholder</p>
                </div>
              )}
              {currentPath === "settings" && <SettingsPage />}
            </main>
          </div>
        </div>
      )}
    </ThemeContext.Provider>
  );
}