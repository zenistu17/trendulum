import * as React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-50 flex items-center justify-center w-20 h-8 bg-white dark:bg-[#232336] border border-gray-300 dark:border-[#232336] rounded-xl shadow-lg transition-colors duration-300 focus:outline-none"
      aria-label="Toggle theme"
      style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}
    >
      <div className="relative w-full h-full flex items-center justify-center px-1 gap-1">
        <span className="flex-none flex items-center justify-center w-6 h-6">
          <Sun className={`transition-all duration-300 ${theme === 'light' ? 'text-yellow-500' : 'text-gray-400 opacity-60'}`} size={18} />
        </span>
        <span className="flex-none h-5 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
        <span className="flex-none flex items-center justify-center w-6 h-6">
          <Moon className={`transition-all duration-300 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-400 opacity-60'}`} size={18} />
        </span>
      </div>
    </button>
  );
}
