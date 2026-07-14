"use client";

import { motion } from "framer-motion";
import { Route, Navigation2, RotateCcw, ArrowRight } from "lucide-react";

type Props = {
  hasLocation: boolean;
  onRequestLocation: () => void;
  onReset: () => void;
  routeFrom?: string;
  routeTo?: string;
};

export function AppHeader({ hasLocation, onRequestLocation, onReset, routeFrom, routeTo }: Props) {
  return (
    <motion.header
      className="bg-white/80 backdrop-blur-sm border-b border-zinc-100 px-4 py-3 flex items-center gap-3 shrink-0 sticky top-0 z-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-sm shrink-0">
        <Route className="w-4 h-4 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <h1 className="font-semibold text-zinc-900 text-sm leading-tight">Rasta Trafik</h1>
        {routeFrom && routeTo ? (
          <div className="flex items-center gap-1 mt-0.5 w-fit bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
            <span className="truncate max-w-[80px]">{routeFrom}</span>
            <ArrowRight className="w-3 h-3 shrink-0" />
            <span className="truncate max-w-[80px]">{routeTo}</span>
          </div>
        ) : (
          <p className="text-xs text-zinc-400">AI-guide för rastplatser</p>
        )}
      </div>

      <motion.button
        onClick={onRequestLocation}
        whileTap={{ scale: 0.95 }}
        className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
          hasLocation
            ? "bg-green-100 text-green-700 ring-1 ring-green-200"
            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
        }`}
      >
        <Navigation2
          className={`w-3 h-3 ${hasLocation ? "fill-green-600 text-green-700" : ""}`}
        />
        {hasLocation ? "GPS aktiv" : "Aktivera GPS"}
      </motion.button>

      <motion.button
        onClick={onReset}
        whileTap={{ scale: 0.95 }}
        title="Ny konversation"
        className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </motion.button>
    </motion.header>
  );
}
