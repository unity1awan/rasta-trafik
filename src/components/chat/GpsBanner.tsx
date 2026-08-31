"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

type Props = {
  onActivate: () => void;
};

export function GpsBanner({ onActivate }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.25 }}
      className="flex justify-center px-4 pb-2"
    >
      <button
        onClick={onActivate}
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
  );
}
