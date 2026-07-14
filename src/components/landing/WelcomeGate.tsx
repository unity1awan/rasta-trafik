"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AiSphere } from "./AiSphere";
import { AuthModal } from "@/components/auth/AuthModal";

type Props = {
  onGuest: () => void;
};

export function WelcomeGate({ onGuest }: Props) {
  const [authTab, setAuthTab] = useState<"login" | "register" | null>(null);

  return (
    <>
      <motion.div
        className="flex flex-col h-screen bg-white items-center"
        exit={{ opacity: 0, y: -20, transition: { duration: 0.25, ease: "easeIn" } }}
      >
        {/* Logo */}
        <motion.div
          className="flex flex-col items-center pt-10 sm:pt-12"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Rasta Trafik</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Din AI-vägassistent</p>
        </motion.div>

        {/* Sphere */}
        <motion.div
          className="flex-1 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
        >
          <AiSphere isLoading={false} />
        </motion.div>

        {/* Meny */}
        <motion.div
          className="w-full max-w-xs px-6 pb-14 sm:pb-16 flex flex-col gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25, ease: "easeOut" }}
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setAuthTab("login")}
            className="w-full h-12 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            Logga in
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setAuthTab("register")}
            className="w-full h-12 rounded-full border border-blue-200 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            Registrera dig
          </motion.button>

          <button
            onClick={onGuest}
            className="w-full h-10 text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            Fortsätt som gäst
          </button>
        </motion.div>
      </motion.div>

      {authTab && (
        <AuthModal initialTab={authTab} onClose={() => setAuthTab(null)} />
      )}
    </>
  );
}
