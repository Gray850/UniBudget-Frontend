import { createContext } from "react";

// 定义所有的主题颜色配置
export const THEMES = {
  indigo: { main: "indigo", bg: "bg-indigo-600", text: "text-indigo-400", border: "border-indigo-500", lightBg: "bg-indigo-500/10", hex: "#4f46e5", hexLight: "rgba(79, 70, 229, 0.15)" },
  emerald: { main: "emerald", bg: "bg-emerald-600", text: "text-emerald-400", border: "border-emerald-500", lightBg: "bg-emerald-500/10", hex: "#059669", hexLight: "rgba(5, 150, 105, 0.15)" },
  rose: { main: "rose", bg: "bg-rose-600", text: "text-rose-400", border: "border-rose-500", lightBg: "bg-rose-500/10", hex: "#e11d48", hexLight: "rgba(225, 29, 72, 0.15)" },
};

// 创建并导出 Context
export const ThemeContext = createContext({
  isDark: true,
  setIsDark: () => {},
  themeKey: "indigo",
  setThemeKey: () => {},
  theme: THEMES.indigo
});