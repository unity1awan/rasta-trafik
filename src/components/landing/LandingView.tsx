"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";
import { AiSphere } from "./AiSphere";
import { ChatInput } from "@/components/chat/ChatInput";

const SUGGESTIONS = [
  { emoji: "📍", label: "Hitta närmaste rastplats" },
  { emoji: "🛣️", label: "Rastplatser längs min rutt" },
  { emoji: "☕", label: "Rastplats med toalett/mat" },
];

type Props = {
  onSend: (message: string) => void;
  isLoading: boolean;
  hasLocation: boolean;
  onRequestLocation: () => void;
};

export function LandingView({ onSend, isLoading, hasLocation, onRequestLocation }: Props) {
  return (
    <motion.div
      className="flex flex-col h-full bg-white dark:bg-zinc-900 items-center"
      exit={{ opacity: 0, y: -30, transition: { duration: 0.25, ease: "easeIn" } }}
    >
      {/* Titel */}
      <motion.div
        className="flex flex-col items-center pt-10 sm:pt-14"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Rasta Trafik
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
          Din AI-vägassistent
        </p>
      </motion.div>

      {/* Sphere */}
      <motion.div
        className="flex-1 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
      >
        <AiSphere isLoading={isLoading} />
      </motion.div>

      {/* Chips + GPS + input */}
      <motion.div
        className="w-full max-w-2xl px-6 pb-10 sm:pb-14 flex flex-col gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
      >
        {/* Premium förslags-chips */}
        <div className="flex flex-wrap gap-2.5 justify-center">
          {SUGGESTIONS.map((s, i) => (
            <motion.button
              key={s.label}
              onClick={() => onSend(s.label)}
              disabled={isLoading}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.25 + i * 0.06, ease: "easeOut" }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-4 py-2 text-sm font-medium text-slate-700 dark:text-zinc-200 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
            </motion.button>
          ))}
        </div>

        {/* GPS-aktivering */}
        <AnimatePresence>
          {!hasLocation && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.25 }}
              className="flex justify-center"
            >
              <button
                onClick={onRequestLocation}
                className="flex items-center gap-2.5 px-5 py-2 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                </span>
                <MapPin className="w-3.5 h-3.5" />
                Aktivera GPS för bättre träffar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <ChatInput onSend={onSend} disabled={isLoading} bare />
      </motion.div>
    </motion.div>
  );
}
