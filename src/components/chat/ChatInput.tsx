"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Loader2 } from "lucide-react";

type Props = {
  onSend: (message: string) => void;
  disabled: boolean;
  bare?: boolean;
};

export function ChatInput({ onSend, disabled, bare = false }: Props) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
  };

  const formClass = bare
    ? "flex gap-2 w-full"
    : "bg-white/80 backdrop-blur-sm border-t border-zinc-100 px-4 py-3 flex gap-2 shrink-0";

  return (
    <form onSubmit={handleSubmit} className={formClass}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Fråga om rastplatser..."
        disabled={disabled}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="flex-1 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white disabled:opacity-50 transition-all"
      />
      <motion.button
        type="submit"
        disabled={!value.trim() || disabled}
        whileTap={{ scale: 0.9 }}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors shrink-0 shadow-sm"
      >
        {disabled ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ArrowUp className="w-4 h-4" />
        )}
      </motion.button>
    </form>
  );
}
