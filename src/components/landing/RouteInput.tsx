"use client";

import { motion } from "framer-motion";
import { MapPin, X, Loader2, LocateFixed } from "lucide-react";

type Props = {
  fromText: string;
  toText: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onConfirm: () => void;
  onClear: () => void;
  onUseGps: () => void;
  isActive: boolean;
  isGeocoding: boolean;
  isGettingGps: boolean;
  error: string | null;
};

export function RouteInput({
  fromText, toText,
  onFromChange, onToChange,
  onConfirm, onClear, onUseGps,
  isActive, isGeocoding, isGettingGps, error,
}: Props) {
  if (isActive) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-2 text-xs text-green-700 bg-green-50 rounded-full px-4 h-10 border border-green-200 self-center"
      >
        <MapPin className="w-3 h-3 fill-green-600 shrink-0" />
        <span className="font-medium">{fromText} → {toText}</span>
        <button onClick={onClear} className="text-green-400 hover:text-green-700 transition-colors ml-1">
          <X className="w-3 h-3" />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <form
        onSubmit={(e) => { e.preventDefault(); onConfirm(); }}
        className="flex items-center gap-2 w-full"
      >
        {/* Från-fält — GPS-knapp är absolute så den inte påverkar flex-bredden */}
        <div className="relative h-10 flex-1 min-w-0 flex items-center bg-white border border-zinc-200 rounded-full px-3 focus-within:border-blue-400 transition-all">
          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={fromText}
            onChange={(e) => onFromChange(e.target.value)}
            placeholder="Från"
            autoComplete="off"
            className="flex-1 min-w-0 text-sm bg-transparent text-slate-800 placeholder-zinc-500 focus:outline-none pl-1.5 pr-7"
          />
          <button
            type="button"
            onClick={onUseGps}
            disabled={isGettingGps}
            title="Använd min position"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50 p-1 rounded-full"
          >
            {isGettingGps
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <LocateFixed className="w-4 h-4" />
            }
          </button>
        </div>

        {/* Till-fält */}
        <div className="h-10 flex-1 min-w-0 flex items-center gap-1.5 bg-white border border-zinc-200 rounded-full px-3 focus-within:border-blue-400 transition-all">
          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={toText}
            onChange={(e) => onToChange(e.target.value)}
            placeholder="Till"
            autoComplete="off"
            className="flex-1 min-w-0 text-sm bg-transparent text-slate-800 placeholder-zinc-500 focus:outline-none"
          />
        </div>

        {/* Sätt rutt — fast bredd, krymp aldrig */}
        <button
          type="submit"
          disabled={!fromText.trim() || !toText.trim() || isGeocoding}
          className="h-10 shrink-0 rounded-full bg-blue-600 text-white px-4 text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center"
        >
          {isGeocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sätt rutt"}
        </button>
      </form>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
