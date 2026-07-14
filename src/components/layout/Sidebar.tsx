"use client";

import { useState } from "react";
import { Menu, Edit, Search, Clock, Settings, MessageSquare } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/utils/supabase/client";

const HISTORY = [
  "Rastplatser nära E4 Jönköping",
  "Bra mat på väg till Göteborg",
  "Toaletter längs E18 Örebro",
  "Parkering Stockholm norrut",
];

type Props = {
  hasLocation: boolean;
  onNewChat: () => void;
};

function SidebarItem({
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
    <button
      onClick={onClick}
      title={label}
      className={`flex items-center w-full gap-4 px-3 py-2 rounded-full hover:bg-white/10 transition-colors duration-150 ${
        isExpanded ? "justify-start" : "justify-center"
      }`}
    >
      <span className="shrink-0 text-[#c4c7c5]">{icon}</span>
      <span
        className={`text-sm text-[#c4c7c5] whitespace-nowrap overflow-hidden transition-all duration-300 ${
          isExpanded ? "max-w-[180px] opacity-100" : "max-w-0 opacity-0"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

export function Sidebar({ hasLocation, onNewChat }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { user } = useUser();

  const signOut = async () => {
    await createClient().auth.signOut();
  };

  const initial = user?.email?.[0].toUpperCase() ?? "A";

  return (
    <aside
      className={`relative flex flex-col h-screen bg-[#1e1f20] shrink-0 overflow-hidden transition-all duration-300 ${
        isExpanded ? "w-72" : "w-[68px]"
      }`}
    >
      {/* ── Toggle / Logga ───────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-3 pt-3 pb-2">
        <button
          onClick={() => setIsExpanded((v) => !v)}
          title="Öppna/stäng meny"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors shrink-0"
        >
          <Menu className="w-5 h-5 text-[#c4c7c5]" />
        </button>
        <span
          className={`font-medium text-white whitespace-nowrap overflow-hidden transition-all duration-300 ${
            isExpanded ? "max-w-[180px] opacity-100" : "max-w-0 opacity-0"
          }`}
        >
          Rasta Trafik
        </span>
      </div>

      {/* ── Ny chatt + Sök ───────────────────────────────────────── */}
      <div className="px-2 pb-2 flex flex-col gap-1">
        <SidebarItem
          icon={<Edit className="w-5 h-5" />}
          label="Ny chatt"
          isExpanded={isExpanded}
          onClick={onNewChat}
        />
        <SidebarItem
          icon={<Search className="w-5 h-5" />}
          label="Sök"
          isExpanded={isExpanded}
        />
      </div>

      {/* ── Senaste ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {isExpanded && (
          <p className="text-xs font-medium text-[#8e918f] uppercase tracking-widest px-3 py-2">
            Senaste
          </p>
        )}
        {isExpanded &&
          HISTORY.map((label) => (
            <button
              key={label}
              title={label}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-full hover:bg-white/10 transition-colors text-left group"
            >
              <MessageSquare className="w-4 h-4 text-[#8e918f] shrink-0 group-hover:text-[#c4c7c5] transition-colors" />
              <span className="text-sm text-[#c4c7c5] truncate">{label}</span>
            </button>
          ))}
      </div>

      {/* ── Botten ───────────────────────────────────────────────── */}
      <div className="px-2 pb-4 flex flex-col gap-1">
        <SidebarItem
          icon={<Clock className="w-5 h-5" />}
          label="Aktivitet"
          isExpanded={isExpanded}
        />
        <SidebarItem
          icon={<Settings className="w-5 h-5" />}
          label="Inställningar"
          isExpanded={isExpanded}
        />

        {/* Profil / Avatar */}
        <button
          onClick={signOut}
          title="Logga ut"
          className={`flex items-center w-full gap-3 px-3 py-2 rounded-full hover:bg-white/10 transition-colors duration-150 mt-1 ${
            isExpanded ? "justify-start" : "justify-center"
          }`}
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-[#4a4e6a] flex items-center justify-center shrink-0 text-sm font-semibold text-white">
            {initial}
          </div>

          {/* Namn + plats */}
          <div
            className={`flex flex-col text-left overflow-hidden transition-all duration-300 ${
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
      </div>
    </aside>
  );
}
