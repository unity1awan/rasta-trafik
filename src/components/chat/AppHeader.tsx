"use client";

import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

type Props = {
  hasLocation: boolean;
  onReset: () => void;
};

export function AppHeader({ hasLocation, onReset }: Props) {
  return (
    <motion.header
      className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm shrink-0 sticky top-0 z-10"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
            hasLocation ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-600"
          }`}
        />
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {hasLocation ? "GPS aktiv" : "Ingen position"}
        </span>
      </div>

      <motion.button
        onClick={onReset}
        whileTap={{ scale: 0.9 }}
        title="Ny konversation"
        className="flex items-center justify-center w-7 h-7 rounded-full text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </motion.button>
    </motion.header>
  );
}
