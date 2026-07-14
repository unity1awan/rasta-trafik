"use client";

import { motion } from "framer-motion";
import { AiSphere } from "./AiSphere";
import { RouteInput } from "./RouteInput";
import { ChatInput } from "@/components/chat/ChatInput";

const SUGGESTIONS = [
  "Närmaste rastplats",
  "Rastplatser längs E4",
  "Rastplatser längs E6",
  "Rastplatser i Norrland",
];

type RouteProps = {
  fromText: string;
  toText: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onConfirm: () => void;
  onClear: () => void;
  onUseGps: () => void;
  isActive: boolean;
  isGeocoding: boolean;
  isGettingGps: boolean;
  error: string | null;
};

type Props = {
  onSend: (message: string) => void;
  isLoading: boolean;
  route: RouteProps;
};

export function LandingView({ onSend, isLoading, route }: Props) {
  return (
    <motion.div
      className="flex flex-col h-screen bg-white dark:bg-zinc-900 items-center"
      exit={{ opacity: 0, y: -30, transition: { duration: 0.25, ease: "easeIn" } }}
    >
      {/* Header — text only, centrerad */}
      <motion.div
        className="flex flex-col items-center pt-10 sm:pt-12"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Rasta Trafik</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-300 font-medium mt-0.5">Din AI-vägassistent</p>
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

      {/* Bottom: rutt-kort + chatinput */}
      <motion.div
        className="w-full max-w-2xl px-8 pb-10 sm:pb-14 flex flex-col gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
      >
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col gap-5">
          <RouteInput {...route} />

          <div className="flex flex-wrap gap-2 justify-center">
            {SUGGESTIONS.map((suggestion) => (
              <motion.button
                key={suggestion}
                onClick={() => onSend(suggestion)}
                disabled={isLoading}
                whileTap={{ scale: 0.95 }}
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:border-zinc-300 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-40 transition-all duration-150"
              >
                {suggestion}
              </motion.button>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-4">
            <ChatInput onSend={onSend} disabled={isLoading} bare />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
