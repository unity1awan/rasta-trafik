"use client";

import { useState } from "react";
import {
  Route,
  Edit,
  Search,
  Clock,
  Settings,
  MessageSquare,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";

const HISTORY = [
  "Rastplatser nära E4 Jönköping",
  "Bra mat på väg till Göteborg",
  "Toaletter längs E18 Örebro",
  "Parkering Stockholm norrut",
];

/* ─── Tooltip-wrapper ─────────────────────────────────────────────────────── */
function Tip({ label, show }: { label: string; show: boolean }) {
  if (!show) return null;
  return (
    <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none whitespace-nowrap rounded-lg bg-zinc-800 px-2.5 py-1.5 text-xs text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150">
      {label}
    </span>
  );
}

/* ─── Generisk menyrad ────────────────────────────────────────────────────── */
function Item({
  icon,
  label,
  isExpanded,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isExpanded: boolean;
  onClick?: () => void;
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        title={isExpanded ? undefined : label}
        className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-full hover:bg-white/10 transition-colors duration-150 ${
          isExpanded ? "justify-start" : "justify-center"
        }`}
      >
        <span className="shrink-0 text-[#c4c7c5]">{icon}</span>
        <span
          className={`text-sm text-[#c4c7c5] whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? "max-w-[180px] opacity-100" : "max-w-0 opacity-0"
          }`}
        >
          {label}
        </span>
      </button>
      <Tip label={label} show={!isExpanded} />
    </div>
  );
}

/* ─── Sidebar ─────────────────────────────────────────────────────────────── */
type Props = {
  hasLocation: boolean;
  onNewChat: () => void;
};

export function Sidebar({ hasLocation, onNewChat }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { user } = useUser();

  const initial = user?.email?.[0].toUpperCase() ?? "A";

  return (
    // Ingen overflow-hidden på aside — krävs för att tooltips ska synas utanför
    <aside
      className={`flex flex-col h-screen bg-[#1e1f20] shrink-0 border-r border-white/5 transition-all duration-300 ease-in-out ${
        isExpanded ? "w-72" : "w-[68px]"
      }`}
    >
      {/* ── Toggle / Logga — klicka hela raden ──────────────────────────── */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className={`flex items-center gap-3 w-full px-3 pt-4 pb-3 hover:bg-white/10 transition-colors duration-150 ${
          isExpanded ? "justify-start" : "justify-center"
        }`}
        title={isExpanded ? "Fäll in" : "Expandera"}
      >
        <Route className="w-6 h-6 text-[#c4c7c5] shrink-0" />
        <span
          className={`font-semibold text-white whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? "max-w-[180px] opacity-100" : "max-w-0 opacity-0"
          }`}
        >
          Rasta Trafik
        </span>
      </button>

      {/* ── Ny chatt + Sök ──────────────────────────────────────────────── */}
      <div className="px-2 pb-2 flex flex-col gap-0.5">
        <Item
          icon={<Edit className="w-5 h-5" />}
          label="Ny chatt"
          isExpanded={isExpanded}
          onClick={onNewChat}
        />
        <Item
          icon={<Search className="w-5 h-5" />}
          label="Sök"
          isExpanded={isExpanded}
        />
      </div>

      {/* ── Senaste ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {isExpanded && (
          <p className="text-[10px] font-semibold text-[#8e918f] uppercase tracking-widest px-3 pb-2">
            Senaste
          </p>
        )}
        {isExpanded &&
          HISTORY.map((label) => (
            <button
              key={label}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-full hover:bg-white/10 transition-colors text-left group"
            >
              <MessageSquare className="w-4 h-4 text-[#8e918f] shrink-0 group-hover:text-[#c4c7c5] transition-colors" />
              <span className="text-sm text-[#c4c7c5] truncate">{label}</span>
            </button>
          ))}
      </div>

      {/* ── Botten ──────────────────────────────────────────────────────── */}
      <div className="px-2 pb-4 flex flex-col gap-0.5">
        <Item
          icon={<Clock className="w-5 h-5" />}
          label="Aktivitet"
          isExpanded={isExpanded}
        />
        <Item
          icon={<Settings className="w-5 h-5" />}
          label="Inställningar"
          isExpanded={isExpanded}
        />

        {/* Profil / Avatar */}
        <div className="relative group mt-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Profil klickad");
            }}
            className={`flex items-center w-full gap-3 px-3 py-2 rounded-full hover:bg-white/10 transition-colors duration-150 ${
              isExpanded ? "justify-start" : "justify-center"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-[#4a4e6a] flex items-center justify-center shrink-0 text-sm font-bold text-white">
              {initial}
            </div>
            <div
              className={`flex flex-col text-left overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              <span className="text-sm text-white font-medium whitespace-nowrap leading-tight">
                Awan
              </span>
              <span className="text-xs text-[#8e918f] whitespace-nowrap leading-tight">
                {hasLocation ? "Sverige · GPS aktiv" : "Sverige"}
              </span>
            </div>
          </button>
          <Tip label="Logga ut" show={!isExpanded} />
        </div>
      </div>
    </aside>
  );
}
