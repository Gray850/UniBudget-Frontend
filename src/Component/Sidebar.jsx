import React, { useContext } from "react";
import { LayoutDashboard, BookOpen, Settings, LogOut, Wallet, ChevronLeft, ChevronRight } from "lucide-react";
import { ThemeContext } from "../ThemeContext";

export default function Sidebar({ currentPath, setCurrentPath, isCollapsed, setIsCollapsed, onLogout }) {
  const { isDark, theme } = useContext(ThemeContext);
  
  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "bookkeeping", icon: BookOpen, label: "Bookkeeping" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className={`${isCollapsed ? "w-20" : "w-64"} min-h-screen ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} border-r flex flex-col sticky top-0 transition-all duration-300 ease-in-out z-50`}>
      <button onClick={() => setIsCollapsed(!isCollapsed)} className={`absolute -right-3 top-8 ${isDark ? "bg-gray-800 border-gray-700 text-gray-300 hover:text-white" : "bg-white border-gray-200 text-gray-600 hover:text-gray-900"} border rounded-full p-1.5 shadow-lg transition-transform hover:scale-110 z-50`}>
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={`px-6 py-6 border-b ${isDark ? "border-gray-800" : "border-gray-100"} flex items-center ${isCollapsed ? "justify-center px-0" : "gap-3"}`}>
        <Wallet className={`${theme.text} w-7 h-7 shrink-0`} />
        {!isCollapsed && (
          <span className={`text-xl font-black tracking-tight whitespace-nowrap ${isDark ? "text-white" : "text-gray-900"}`}>
            UniBudget <span className={theme.text}>Lab</span>
          </span>
        )}
      </div>

      <nav className="flex-1 px-3 py-6 space-y-2 overflow-hidden">
        {navItems.map(({ id, icon: Icon, label }) => {
          const isActive = currentPath === id;
          return (
            <button key={id} onClick={() => setCurrentPath(id)} className={`w-full flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-4"} py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? `${theme.lightBg} ${theme.text}` : `${isDark ? "text-gray-400 hover:bg-gray-800 hover:text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}`}>
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
            </button>
          );
        })}
      </nav>

      <div className={`p-4 border-t ${isDark ? "border-gray-800 bg-gray-900/50" : "border-gray-100 bg-gray-50/50"}`}>
        {!isCollapsed && <p className="text-[10px] text-gray-500 uppercase tracking-wider leading-relaxed mb-4 text-center">⚠️ Probabilistic projections only.</p>}
        <button onClick={onLogout} className={`flex items-center ${isCollapsed ? "justify-center" : "justify-center gap-2"} w-full py-2.5 rounded-lg text-sm font-medium ${isDark ? "text-gray-400 hover:bg-rose-500/10 hover:text-rose-400" : "text-gray-500 hover:bg-rose-50 hover:text-rose-500"} transition-colors`}>
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
