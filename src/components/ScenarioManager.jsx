import React, { useState, useContext } from "react";
import { Save, FolderOpen, Download, CheckCircle, ChevronUp, ChevronDown } from "lucide-react";
import { ThemeContext } from "../ThemeContext";

export default function ScenarioManager({ currentValues, onLoad }) {
  const { isDark, theme } = useContext(ThemeContext);
  const [scenarios, setScenarios] = useState([]);
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    const newScenario = {
      id: Date.now(),
      name: name.trim(),
      savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      values: { ...currentValues },
    };
    setScenarios([newScenario, ...scenarios]);
    setName("");
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  return (
    <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"} border rounded-2xl p-6 shadow-xl transition-colors duration-300`}>
      <h3 className={`text-base font-bold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-gray-900"}`}>
        <Save className={`w-5 h-5 ${theme.text}`} /> Scenario Archive
      </h3>

      <div className="flex gap-3 mb-3">
        <input type="text" placeholder='"Name this scenario, e.g. "Worst Case" 'value={name} onChange={(e) => setName(e.target.value)} className={`flex-1 ${isDark ? "bg-gray-950 border-gray-800 text-white placeholder-gray-600" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"} border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-${theme.main}-500 transition-colors shadow-inner`} />
        <button onClick={handleSave} className={`${theme.bg} hover:opacity-90 text-white rounded-xl px-4 py-2.5 text-sm font-bold transition-colors shadow-lg flex items-center gap-2`}>
          <Save className="w-4 h-4" /> Save
        </button>
      </div>

      <div className="min-h-[24px] mb-4">
        {savedFlash && (
          <p className={`text-xs font-medium ${theme.text} flex items-center gap-1.5 animate-bounce`}><CheckCircle className="w-3.5 h-3.5" /> Snapshot saved!</p>
        )}
      </div>

      {scenarios.length > 0 && (
        <div className={`border-t ${isDark ? "border-gray-800" : "border-gray-100"} pt-4`}>
          <button onClick={() => setIsOpen(!isOpen)} className={`flex items-center justify-between w-full text-xs font-semibold ${isDark ? "bg-gray-950 border-gray-800 text-gray-400 hover:text-white" : "bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-900"} border px-4 py-2 rounded-lg transition-colors mb-3`}>
            <div className="flex items-center gap-2">
              <FolderOpen className={`w-4 h-4 ${theme.text}`} />
              {isOpen ? "Hide Archive" : "View Archive"} ({scenarios.length})
            </div>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isOpen && (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {scenarios.map((s) => (
                <div key={s.id} className={`flex items-center justify-between ${isDark ? "bg-gray-950 border-gray-800 hover:bg-gray-800/50" : "bg-gray-50 border-gray-200 hover:bg-gray-100"} border rounded-xl px-4 py-3 transition-colors`}>
                  <div>
                    <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{s.name}</p>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-medium">{s.savedAt}</p>
                  </div>
                  <button onClick={() => { onLoad(s.values); setIsOpen(false); }} className={`text-${theme.main}-500 bg-${theme.main}-500/10 hover:bg-${theme.main}-500 hover:text-white p-2 rounded-lg transition-colors`}><Download className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
