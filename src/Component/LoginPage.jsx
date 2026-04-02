import React, { useContext } from "react";
import { Wallet, User, Lock } from "lucide-react";
import { ThemeContext } from "../App";

export default function LoginPage({ onLogin }) {
  const { isDark, theme } = useContext(ThemeContext);

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? "bg-[#0b0f19]" : "bg-gray-50"}`}>
      <div className={`${isDark ? "bg-gray-900 border-gray-800 shadow-2xl" : "bg-white border-gray-200 shadow-xl"} border w-full max-w-md rounded-3xl p-8 transform transition-all`}>
        
        <div className="flex justify-center mb-6">
          <div className={`${theme.lightBg} p-4 rounded-full`}>
            <Wallet className={`w-10 h-10 ${theme.text}`} />
          </div>
        </div>

        <h2 className={`text-2xl font-black text-center tracking-tight mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
          UniBudget <span className={theme.text}>Lab</span>
        </h2>
        <p className="text-center text-gray-500 text-sm mb-8">Sign in to your decision support dashboard</p>

        <div className="space-y-4 mb-8">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Student ID or Email" className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-colors border ${isDark ? "bg-gray-950 border-gray-800 text-white focus:border-gray-600" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-gray-400"}`} />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="password" placeholder="Password" className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-colors border ${isDark ? "bg-gray-950 border-gray-800 text-white focus:border-gray-600" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-gray-400"}`} />
          </div>
        </div>

        <button onClick={onLogin} className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] ${theme.bg}`}>
          Secure Access
        </button>

        <p className="text-center text-xs text-gray-500 mt-6 uppercase tracking-wider font-semibold">
          COMP208 Group Project
        </p>
      </div>
    </div>
  );
}
