import { createContext } from "react";

export const ThemeContext = createContext();

export const THEMES = {
  indigo: { main: "indigo", bg: "bg-indigo-500", text: "text-indigo-500", border: "border-indigo-500", lightBg: "bg-indigo-500/10", hex: "rgba(99, 102, 241, 1)", hexLight: "rgba(99, 102, 241, 0.15)" },
  emerald: { main: "emerald", bg: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500", lightBg: "bg-emerald-500/10", hex: "rgba(16, 185, 129, 1)", hexLight: "rgba(16, 185, 129, 0.15)" },
  rose: { main: "rose", bg: "bg-rose-500", text: "text-rose-500", border: "border-rose-500", lightBg: "bg-rose-500/10", hex: "rgba(244, 63, 94, 1)", hexLight: "rgba(244, 63, 94, 0.15)" },
};
