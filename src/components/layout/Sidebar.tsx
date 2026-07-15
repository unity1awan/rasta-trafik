"use client";

import { useState } from "react";
import { Route, Edit, Settings, MessageSquare } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/utils/supabase/client";
import { SettingsModal } from "@/components/ui/SettingsModal";
import type { Conversation } from "@/types/Conversation";

/* ─── Tooltip ─────────────────────────────────────────────────────────────── */
function Tip({ label, show }: { label: string; show: boolean }) {
  if (!show) return null;
  return (
    <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none whitespace-nowrap rounded-lg bg-gray-900 dark:bg-zinc-700 px-2.5 py-1.5 text-xs text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150">
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
        className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-150 ${
          isExpanded ? "justify-start" : "justify-center"
        }`}
      >
        <span className="shrink-0 text-gray-600 dark:text-[#c4c7c5]">{icon}</span>
        <span
          className={`text-sm text-gray-700 dark:text-[#c4c7c5] whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
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
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
};

export function Sidebar({
  hasLocation,
  onNewChat,
  conversations,
  activeConversationId,
  onSelectConversation,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { user } = useUser();

  const initial = user?.email?.[0].toUpperCase() ?? "A";

  const signOut = async () => {
    await createClient().auth.signOut();
  };

  return (
    <>
      <aside
        className={`flex flex-col h-screen bg-white dark:bg-[#1e1f20] border-r border-gray-200 dark:border-white/5 shrink-0 transition-all duration-300 ease-in-out ${
          isExpanded ? "w-64" : "w-[68px]"
        }`}
      >
        {/* ── Toggle / Logga ────────────────────────────────────────────── */}
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className={`flex items-center gap-3 w-full px-3 pt-5 pb-4 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-150 ${
            isExpanded ? "justify-start" : "justify-center"
          }`}
          title={isExpanded ? "Fäll in" : "Expandera"}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-sm shrink-0">
            <Route className="w-4 h-4 text-white" />
          </div>
          <span
            className={`font-semibold text-gray-900 dark:text-white whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? "max-w-[180px] opacity-100" : "max-w-0 opacity-0"
            }`}
          >
            Rasta Trafik
          </span>
        </button>

        {/* ── Ny chatt ──────────────────────────────────────────────────── */}
        <div className="px-2 pb-2">
          <Item
            icon={<Edit className="w-5 h-5" />}
            label="Ny chatt"
            isExpanded={isExpanded}
            onClick={onNewChat}
          />
        </div>

        {/* ── Senaste ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {isExpanded && conversations.length > 0 && (
            <p className="text-[10px] font-semibold text-gray-400 dark:text-[#8e918f] uppercase tracking-widest px-3 py-2">
              Senaste
            </p>
          )}
          {isExpanded &&
            conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all duration-200 text-left group ${
                    isActive
                      ? "bg-gray-100 dark:bg-white/10"
                      : "hover:bg-gray-100 dark:hover:bg-white/10"
                  }`}
                >
                  <MessageSquare
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? "text-gray-700 dark:text-[#c4c7c5]"
                        : "text-gray-400 dark:text-[#8e918f] group-hover:text-gray-600 dark:group-hover:text-[#c4c7c5]"
                    }`}
                  />
                  <span
                    className={`text-sm truncate transition-colors ${
                      isActive
                        ? "text-gray-900 dark:text-white font-medium"
                        : "text-gray-600 dark:text-[#c4c7c5] group-hover:text-gray-900 dark:group-hover:text-white"
                    }`}
                  >
                    {conv.title}
                  </span>
                </button>
              );
            })}
        </div>

        {/* ── Botten: Inställningar + Profil ────────────────────────────── */}
        <div className="px-2 pb-5 flex flex-col gap-0.5">
          <Item
            icon={<Settings className="w-5 h-5" />}
            label="Inställningar"
            isExpanded={isExpanded}
            onClick={() => setSettingsOpen(true)}
          />

          {isExpanded && (
            <div className="flex items-center gap-2 px-3 py-1.5">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  hasLocation ? "bg-green-500" : "bg-gray-300 dark:bg-zinc-600"
                }`}
              />
              <span className="text-xs text-gray-400 dark:text-[#8e918f]">
                {hasLocation ? "Sverige · GPS aktiv" : "GPS inaktiv"}
              </span>
            </div>
          )}

          <div className="relative group">
            <button
              onClick={(e) => {
                e.stopPropagation();
                signOut();
              }}
              title="Logga ut"
              className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150 group ${
                isExpanded ? "justify-start" : "justify-center"
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-xs font-bold text-white">
                {initial}
              </div>
              <div
                className={`flex flex-col text-left overflow-hidden transition-all duration-300 ease-in-out ${
                  isExpanded ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0"
                }`}
              >
                <span className="text-sm text-gray-800 dark:text-white font-medium whitespace-nowrap leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {user?.email?.split("@")[0] ?? "Användare"}
                </span>
                <span className="text-xs text-gray-400 dark:text-[#8e918f] whitespace-nowrap leading-tight">
                  Logga ut
                </span>
              </div>
            </button>
            <Tip label="Logga ut" show={!isExpanded} />
          </div>
        </div>
      </aside>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </>
  );
}
