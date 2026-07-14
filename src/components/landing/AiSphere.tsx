"use client";

import { motion } from "framer-motion";

type Props = { isLoading?: boolean };

// Idle: subtil, långsam morph — blobben är alltid levande
const IDLE_RADII = [
  "55% 45% 38% 62% / 58% 35% 65% 42%",
  "42% 58% 65% 35% / 38% 62% 35% 65%",
  "62% 38% 45% 55% / 50% 40% 60% 50%",
  "55% 45% 38% 62% / 58% 35% 65% 42%",
];

// Aktiv: dramatisk, snabb morph när AI:n tänker/streamar
const ACTIVE_RADII = [
  "60% 40% 30% 70% / 60% 30% 70% 40%",
  "30% 70% 70% 30% / 30% 30% 70% 70%",
  "40% 60% 50% 50% / 60% 40% 50% 50%",
  "70% 30% 40% 60% / 40% 60% 30% 70%",
  "60% 40% 30% 70% / 60% 30% 70% 40%",
];

export function AiSphere({ isLoading = false }: Props) {
  const radii = isLoading ? ACTIVE_RADII : IDLE_RADII;
  const morphDuration = isLoading ? 3 : 8;
  const rotateDuration = isLoading ? 5 : 20;

  return (
    <div className="relative flex items-center justify-center w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56">

      {/* Ambient glow — alltid cirkulär */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.6, 0.08, 0.6],
        }}
        style={{
          background: isLoading
            ? "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)",
        }}
        transition={{ duration: isLoading ? 2.5 : 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Rotation-wrapper */}
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: rotateDuration, repeat: Infinity, ease: "linear" }}
      >
        {/* Core blob — INGEN rounded-full, overflow-hidden klipper till animerad form */}
        <motion.div
          className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 overflow-hidden"
          initial={{ borderRadius: IDLE_RADII[0] }}
          animate={{
            borderRadius: radii,
            scale: [1, isLoading ? 1.06 : 1.03, 1],
            boxShadow: isLoading
              ? [
                  "0 0 50px rgba(99,102,241,0.5), 0 0 100px rgba(15,23,42,0.8)",
                  "0 0 90px rgba(99,102,241,0.7), 0 0 180px rgba(15,23,42,1)",
                  "0 0 50px rgba(99,102,241,0.5), 0 0 100px rgba(15,23,42,0.8)",
                ]
              : [
                  "0 0 30px rgba(59,130,246,0.35), 0 0 60px rgba(29,78,216,0.15)",
                  "0 0 48px rgba(59,130,246,0.55), 0 0 95px rgba(29,78,216,0.25)",
                  "0 0 30px rgba(59,130,246,0.35), 0 0 60px rgba(29,78,216,0.15)",
                ],
          }}
          transition={{
            borderRadius: { duration: morphDuration, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: isLoading ? 2 : 3, repeat: Infinity, ease: "easeInOut" },
            boxShadow: { duration: isLoading ? 2 : 3.5, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          {/* Idle: ljusblå gradient */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(circle at 32% 28%, #93c5fd, #3b82f6 45%, #1d4ed8 75%, #1e3a8a)",
            }}
            animate={{ opacity: isLoading ? 0 : 1 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          />

          {/* Aktiv: djup slate-900 / indigo-950 */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(circle at 38% 32%, #312e81, #0f172a 55%, #020617 85%)",
            }}
            animate={{ opacity: isLoading ? 1 : 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          />

          {/* Pulsande innerglöd (aktiv) */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(129,140,248,0.35) 0%, transparent 60%)",
            }}
            animate={{ opacity: isLoading ? [0.4, 1, 0.4] : 0 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Shimmer — statisk ljusreflex */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)" }}
          />

          {/* Glint — statisk ytrefleks */}
          <div
            className="absolute rounded-full"
            style={{
              width: "34%", height: "34%",
              background: "radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 70%)",
              top: "12%", left: "14%",
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
