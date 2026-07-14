"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Route, Navigation2, RotateCcw, ArrowRight, UserCircle2, LogOut } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/utils/supabase/client";
import { AuthModal } from "@/components/auth/AuthModal";

type Props = {
  hasLocation: boolean;
  onRequestLocation: () => void;
  onReset: () => void;
  routeFrom?: string;
  routeTo?: string;
};

export function AppHeader({ hasLocation, onRequestLocation, onReset, routeFrom, routeTo }: Props) {
  const { user } = useUser();
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setShowUserMenu(false);
  };

  return (
    <>
      <motion.header
        className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 flex items-center gap-3 shrink-0 sticky top-0 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-sm shrink-0">
          <Route className="w-4 h-4 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-zinc-900 dark:text-white text-sm leading-tight">Rasta Trafik</h1>
          {routeFrom && routeTo ? (
            <div className="flex items-center gap-1 mt-0.5 w-fit bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
              <span className="truncate max-w-[80px]">{routeFrom}</span>
              <ArrowRight className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[80px]">{routeTo}</span>
            </div>
          ) : (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">AI-guide för rastplatser</p>
          )}
        </div>

        <motion.button
          onClick={onRequestLocation}
          whileTap={{ scale: 0.95 }}
          className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
            hasLocation
              ? "bg-green-100 text-green-700 ring-1 ring-green-200"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          }`}
        >
          <Navigation2 className={`w-3 h-3 ${hasLocation ? "fill-green-600 text-green-700" : ""}`} />
          {hasLocation ? "GPS aktiv" : "Aktivera GPS"}
        </motion.button>

        <motion.button
          onClick={onReset}
          whileTap={{ scale: 0.95 }}
          title="Ny konversation"
          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </motion.button>

        {/* Profilikon */}
        <div className="relative shrink-0">
          {user ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUserMenu((v) => !v)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
              title={user.email ?? "Profil"}
            >
              {user.email?.[0].toUpperCase()}
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAuth(true)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors"
              title="Logga in"
            >
              <UserCircle2 className="w-4 h-4" />
            </motion.button>
          )}

          {/* Inloggad — dropdown-meny */}
          {showUserMenu && user && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowUserMenu(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-10 z-30 w-52 bg-white rounded-xl shadow-lg border border-zinc-100 p-1"
              >
                <p className="text-xs text-zinc-400 px-3 py-2 truncate">{user.email}</p>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logga ut
                </button>
              </motion.div>
            </>
          )}
        </div>
      </motion.header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
