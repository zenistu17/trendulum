import * as React from "react";
import { useTheme } from "../../contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 bg-black/70 text-white dark:bg-white/80 dark:text-black rounded-full px-4 py-2 shadow-lg transition-colors duration-300"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
