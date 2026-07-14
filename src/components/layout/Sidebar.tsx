"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Route,
  PenSquare,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Settings,
  Navigation2,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/utils/supabase/client";

const HISTORY = [
  { id: 1, label: "Rastplatser nära E4 Jönköping" },
  { id: 2, label: "Bra mat på väg till Göteborg" },
  { id: 3, label: "Toaletter längs E18 Örebro" },
  { id: 4, label: "Parkering Stockholm norrut" },
];

type Props = {
  hasLocation: boolean;
  onNewChat: () => void;
};

export function Sidebar({ hasLocation, onNewChat }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useUser();

  const signOut = async () => {
    await createClient().auth.signOut();
  };

  const w = collapsed ? 64 : 256;

  return (
    <motion.aside
      animate={{ width: w }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      className="relative flex flex-col h-screen bg-zinc-900 shrink-0 overflow-hidden border-r border-zinc-800"
    >
      {/* ── Top: logo + toggle ───────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 pt-4 pb-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <Route className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="flex-1 font-semibold text-sm text-white whitespace-nowrap">
            Rasta Trafik
          </span>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? "Expandera" : "Fäll in"}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors shrink-0"
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Ny chatt ─────────────────────────────────────────────── */}
      <div className="px-3 pb-3">
        <button
          onClick={onNewChat}
          title="Ny chatt"
          className={`flex items-center gap-2 w-full h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors px-3 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <PenSquare className="w-4 h-4 text-zinc-300 shrink-0" />
          {!collapsed && (
            <span className="text-sm text-zinc-300 whitespace-nowrap">Ny chatt</span>
          )}
        </button>
      </div>

      <div className="border-t border-zinc-800 mx-3 mb-3" />

      {/* ── Historik ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 flex flex-col gap-0.5">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest px-2 pb-2">
            Senaste
          </p>
        )}
        {HISTORY.map((item) => (
          <button
            key={item.id}
            title={item.label}
            className={`flex items-center gap-2.5 w-full rounded-lg hover:bg-zinc-800 transition-colors px-2 py-2 text-left group ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <MessageSquare className="w-4 h-4 text-zinc-600 shrink-0 group-hover:text-zinc-400 transition-colors" />
            {!collapsed && (
              <span className="text-sm text-zinc-400 truncate group-hover:text-zinc-200 transition-colors">
                {item.label}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="border-t border-zinc-800 mx-3 mt-3" />

      {/* ── Botten: GPS + inställningar + profil ─────────────────── */}
      <div className="px-3 py-3 flex flex-col gap-1">
        {/* GPS-status */}
        <div
          title={hasLocation ? "GPS aktiv" : "GPS inaktiv"}
          className={`flex items-center gap-2 px-2 py-1.5 ${collapsed ? "justify-center" : ""}`}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
              hasLocation ? "bg-green-400" : "bg-zinc-600"
            }`}
          />
          {!collapsed && (
            <span className="text-xs text-zinc-500 whitespace-nowrap">
              {hasLocation ? "Sverige · GPS aktiv" : "GPS inaktiv"}
            </span>
          )}
        </div>

        {/* Inställningar */}
        <button
          title="Inställningar"
          className={`flex items-center gap-2.5 w-full rounded-lg hover:bg-zinc-800 transition-colors px-2 py-2 group ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Settings className="w-4 h-4 text-zinc-500 shrink-0 group-hover:text-zinc-300 transition-colors" />
          {!collapsed && (
            <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">
              Inställningar
            </span>
          )}
        </button>

        {/* Profil */}
        {user && (
          <button
            onClick={signOut}
            title={`Logga ut (${user.email})`}
            className={`flex items-center gap-2.5 w-full rounded-lg hover:bg-zinc-800 transition-colors px-2 py-2 group ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-xs font-bold text-white">
              {user.email?.[0].toUpperCase()}
            </div>
            {!collapsed && (
              <span className="text-sm text-zinc-300 truncate group-hover:text-white transition-colors">
                {user.email}
              </span>
            )}
          </button>
        )}
      </div>
    </motion.aside>
  );
}
