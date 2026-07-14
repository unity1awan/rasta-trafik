"use client";

import { useEffect, useState } from "react";
import { X, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Undviker hydration-mismatch — next-themes löser temat client-side
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-5 border border-gray-100 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white text-base">Inställningar</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dark mode */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <Moon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-200">Mörkt läge</span>
          </div>

          {/* Toggle switch */}
          {mounted && (
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                isDark ? "bg-blue-600" : "bg-gray-200"
              }`}
              role="switch"
              aria-checked={isDark}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  isDark ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
