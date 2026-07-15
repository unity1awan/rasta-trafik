"use client";

import { motion } from "framer-motion";
import { AiSphere } from "./AiSphere";
import { ChatInput } from "@/components/chat/ChatInput";

const SUGGESTIONS = [
  "Närmaste rastplats",
  "Rastplatser längs E4",
  "Rastplatser längs E6",
  "Rastplatser i Norrland",
];

type Props = {
  onSend: (message: string) => void;
  isLoading: boolean;
};

export function LandingView({ onSend, isLoading }: Props) {
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
        <p className="text-sm text-slate-500 dark:text-zinc-300 font-medium mt-0.5">
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

      {/* Chips + input */}
      <motion.div
        className="w-full max-w-2xl px-6 pb-10 sm:pb-14 flex flex-col gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
      >
        <div className="flex flex-wrap gap-2 justify-center">
          {SUGGESTIONS.map((s) => (
            <motion.button
              key={s}
              onClick={() => onSend(s)}
              disabled={isLoading}
              whileTap={{ scale: 0.95 }}
              className="rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-sm disabled:opacity-40 transition-all duration-150"
            >
              {s}
            </motion.button>
          ))}
        </div>

        <ChatInput onSend={onSend} disabled={isLoading} bare />
      </motion.div>
    </motion.div>
  );
}
