import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from "chart.js";

// 导入拆分后的页面和组件
import LoginPage from "./components/LoginPage";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";

// 🌟 导入分离出的 Context
import { ThemeContext, THEMES } from "./ThemeContext";

// 注册 Chart.js 插件
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [themeKey, setThemeKey] = useState("indigo");
  const [currentPath, setCurrentPath] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, themeKey, setThemeKey, theme: THEMES[themeKey] }}>
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
