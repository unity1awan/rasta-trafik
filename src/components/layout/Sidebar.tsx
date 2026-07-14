"use client";

import { useState } from "react";
import {
  Route,
  Edit,
  Search,
  Clock,
  Settings,
  MessageSquare,
  LogOut,
  UserCircle,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/utils/supabase/client";

const HISTORY = [
  "Rastplatser nära E4 Jönköping",
  "Bra mat på väg till Göteborg",
  "Toaletter längs E18 Örebro",
  "Parkering Stockholm norrut",
];

/* ─── Tooltip ─────────────────────────────────────────────────────────────── */
function Tip({ label, show }: { label: string; show: boolean }) {
  if (!show) return null;
  return (
    <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none whitespace-nowrap rounded-lg bg-zinc-800 px-2.5 py-1.5 text-xs text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150">
      {label}
    </span>
  );
}

/* ─── Menyrad ─────────────────────────────────────────────────────────────── */
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

/* ─── Profilmeny ──────────────────────────────────────────────────────────── */
function ProfileMenu({
  email,
  initial,
  onClose,
}: {
  email: string;
  initial: string;
  onClose: () => void;
}) {
  const signOut = async () => {
    await createClient().auth.signOut();
  };

  return (
    <>
      {/* Backdrop — klick utanför stänger menyn */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div className="absolute bottom-full left-0 mb-2 z-50 w-64 rounded-2xl bg-[#2a2b2e] border border-white/10 shadow-2xl overflow-hidden">
        {/* Profil-header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-[#4a4e6a] flex items-center justify-center shrink-0 text-base font-bold text-white">
            {initial}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-white leading-tight">Awan</span>
            <span className="text-xs text-[#8e918f] truncate leading-tight">{email}</span>
          </div>
        </div>

        {/* Menyalternativ */}
        <div className="p-2">
          <button
            onClick={() => { onClose(); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-left"
          >
            <UserCircle className="w-4 h-4 text-[#8e918f] shrink-0" />
            <span className="text-sm text-[#c4c7c5]">Min profil</span>
          </button>

          <button
            onClick={() => { onClose(); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-left"
          >
            <Settings className="w-4 h-4 text-[#8e918f] shrink-0" />
            <span className="text-sm text-[#c4c7c5]">Inställningar</span>
          </button>

          <div className="border-t border-white/10 my-1.5" />

          <button
            onClick={signOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors text-left group"
          >
            <LogOut className="w-4 h-4 text-[#8e918f] shrink-0 group-hover:text-red-400 transition-colors" />
            <span className="text-sm text-[#c4c7c5] group-hover:text-red-400 transition-colors">
              Logga ut
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Sidebar ─────────────────────────────────────────────────────────────── */
type Props = {
  hasLocation: boolean;
  onNewChat: () => void;
};

export function Sidebar({ hasLocation, onNewChat }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user } = useUser();

  const initial = user?.email?.[0].toUpperCase() ?? "A";
  const email = user?.email ?? "";

  return (
    <aside
      className={`relative flex flex-col h-screen bg-[#1e1f20] shrink-0 border-r border-white/5 transition-all duration-300 ease-in-out ${
        isExpanded ? "w-72" : "w-[68px]"
      }`}
    >
      {/* ── Toggle / Logga ──────────────────────────────────────────────── */}
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
              e.stopPropagation();
              setProfileOpen((v) => !v);
            }}
            className={`flex items-center w-full gap-3 px-3 py-2 rounded-full hover:bg-white/10 transition-colors duration-150 ${
              isExpanded ? "justify-start" : "justify-center"
            } ${profileOpen ? "bg-white/10" : ""}`}
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
          <Tip label="Profil" show={!isExpanded && !profileOpen} />

          {/* Profilmeny */}
          {profileOpen && (
            <ProfileMenu
              email={email}
              initial={initial}
              onClose={() => setProfileOpen(false)}
            />
          )}
        </div>
      </div>
    </aside>
  );
}
