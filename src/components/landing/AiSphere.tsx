"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { VoiceState } from "@/hooks/useVoice";

// Blob-former per tillstånd
const IDLE_RADII = [
  "55% 45% 38% 62% / 58% 35% 65% 42%",
  "42% 58% 65% 35% / 38% 62% 35% 65%",
  "62% 38% 45% 55% / 50% 40% 60% 50%",
  "55% 45% 38% 62% / 58% 35% 65% 42%",
];

const LISTENING_RADII = [
  "50% 50% 50% 50% / 50% 50% 50% 50%",
  "55% 45% 52% 48% / 48% 55% 45% 52%",
  "48% 52% 48% 52% / 52% 48% 52% 48%",
  "50% 50% 50% 50% / 50% 50% 50% 50%",
];

const SPEAKING_RADII = [
  "60% 40% 30% 70% / 60% 30% 70% 40%",
  "30% 70% 70% 30% / 30% 70% 70% 30%",
  "70% 30% 60% 40% / 40% 60% 30% 70%",
  "45% 55% 40% 60% / 55% 45% 60% 40%",
  "60% 40% 30% 70% / 60% 30% 70% 40%",
];

const LOADING_RADII = [
  "60% 40% 30% 70% / 60% 30% 70% 40%",
  "30% 70% 70% 30% / 30% 30% 70% 70%",
  "40% 60% 50% 50% / 60% 40% 50% 50%",
  "70% 30% 40% 60% / 40% 60% 30% 70%",
  "60% 40% 30% 70% / 60% 30% 70% 40%",
];

type Props = {
  isLoading?: boolean;
  voiceState?: VoiceState;
  onClick?: () => void;
  isVoiceSupported?: boolean;
};

type SphereState = "idle" | "listening" | "speaking" | "loading";

function getSphereState(isLoading: boolean, voiceState: VoiceState): SphereState {
  if (isLoading) return "loading";
  if (voiceState === "listening") return "listening";
  if (voiceState === "speaking") return "speaking";
  return "idle";
}

const GRADIENTS: Record<SphereState, string> = {
  idle:      "radial-gradient(circle at 32% 28%, #93c5fd, #3b82f6 45%, #1d4ed8 75%, #1e3a8a)",
  listening: "radial-gradient(circle at 32% 28%, #fca5a5, #ef4444 45%, #dc2626 75%, #7f1d1d)",
  speaking:  "radial-gradient(circle at 32% 28%, #86efac, #22c55e 45%, #16a34a 75%, #14532d)",
  loading:   "radial-gradient(circle at 38% 32%, #312e81, #0f172a 55%, #020617 85%)",
};

const GLOW_COLORS: Record<SphereState, [string, string]> = {
  idle:      ["rgba(59,130,246,0.35)",  "rgba(29,78,216,0.15)"],
  listening: ["rgba(239,68,68,0.5)",    "rgba(220,38,38,0.2)"],
  speaking:  ["rgba(34,197,94,0.45)",   "rgba(22,163,74,0.2)"],
  loading:   ["rgba(99,102,241,0.5)",   "rgba(99,102,241,0.1)"],
};

export function AiSphere({
  isLoading = false,
  voiceState = "idle",
  onClick,
  isVoiceSupported = false,
}: Props) {
  const state = getSphereState(isLoading, voiceState);
  const radii =
    state === "listening" ? LISTENING_RADII
    : state === "speaking" ? SPEAKING_RADII
    : state === "loading" ? LOADING_RADII
    : IDLE_RADII;

  const morphDuration = state === "loading" ? 3 : state === "speaking" ? 2 : state === "listening" ? 2.5 : 8;
  const rotateDuration = state === "loading" ? 5 : state === "speaking" ? 4 : 20;
  const [glow1, glow2] = GLOW_COLORS[state];

  const isClickable = isVoiceSupported && !isLoading;

  return (
    <div className="relative flex flex-col items-center gap-4">
      <div
        className={`relative flex items-center justify-center w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 ${isClickable ? "cursor-pointer" : ""}`}
        onClick={isClickable ? onClick : undefined}
        role={isClickable ? "button" : undefined}
        aria-label={isClickable ? "Aktivera röstläge" : undefined}
      >
        {/* Concentric ripple — röd vid lyssning */}
        <AnimatePresence>
          {state === "listening" && (
            <>
              {[0, 0.5, 1].map((delay) => (
                <motion.div
                  key={delay}
                  className="absolute rounded-full border border-red-400/30"
                  initial={{ scale: 0.8, opacity: 0.7 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay }}
                  style={{ width: "60%", height: "60%" }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Speaking ripple — grön */}
        <AnimatePresence>
          {state === "speaking" && (
            <>
              {[0, 0.7].map((delay) => (
                <motion.div
                  key={delay}
                  className="absolute rounded-full border border-green-400/25"
                  initial={{ scale: 0.8, opacity: 0.6 }}
                  animate={{ scale: 1.9, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay }}
                  style={{ width: "65%", height: "65%" }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Ambient glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            scale: state === "loading" ? [1, 1.4, 1] : [1, 1.25, 1],
            opacity: state === "loading" ? [0.6, 0.08, 0.6] : [0.5, 0.12, 0.5],
          }}
          style={{
            background: `radial-gradient(circle, ${glow1} 0%, transparent 70%)`,
          }}
          transition={{
            duration: state === "loading" ? 2.5 : state === "listening" ? 1.2 : 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Rotation-wrapper */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: rotateDuration, repeat: Infinity, ease: "linear" }}
        >
          {/* Core blob */}
          <motion.div
            className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 overflow-hidden"
            initial={{ borderRadius: IDLE_RADII[0] }}
            animate={{
              borderRadius: radii,
              scale: [1, state === "loading" ? 1.06 : state === "listening" ? 1.04 : state === "speaking" ? 1.07 : 1.03, 1],
              boxShadow: [
                `0 0 30px ${glow1}, 0 0 60px ${glow2}`,
                `0 0 55px ${glow1}, 0 0 110px ${glow2}`,
                `0 0 30px ${glow1}, 0 0 60px ${glow2}`,
              ],
            }}
            transition={{
              borderRadius: { duration: morphDuration, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: state === "speaking" ? 1.2 : state === "loading" ? 2 : 3, repeat: Infinity, ease: "easeInOut" },
              boxShadow: { duration: state === "speaking" ? 1.5 : 3.5, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            {/* Gradient-lager — crossfade med opacity */}
            {(["idle", "listening", "speaking", "loading"] as SphereState[]).map((s) => (
              <motion.div
                key={s}
                className="absolute inset-0"
                style={{ background: GRADIENTS[s] }}
                animate={{ opacity: state === s ? 1 : 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            ))}

            {/* Pulsande innerglöd (aktiv/listening/speaking) */}
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  state === "listening"
                    ? "radial-gradient(circle at 50% 50%, rgba(252,165,165,0.45) 0%, transparent 60%)"
                    : state === "speaking"
                    ? "radial-gradient(circle at 50% 50%, rgba(134,239,172,0.4) 0%, transparent 60%)"
                    : "radial-gradient(circle at 50% 50%, rgba(129,140,248,0.35) 0%, transparent 60%)",
              }}
              animate={{
                opacity: state !== "idle" ? [0.4, 1, 0.4] : 0,
              }}
              transition={{ duration: state === "speaking" ? 1 : 1.8, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Shimmer */}
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)" }}
            />
            {/* Glint */}
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

        {/* Hover-ring när klickbar */}
        {isClickable && (
          <motion.div
            className="absolute inset-0 rounded-full ring-2 ring-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300"
          />
        )}
      </div>

      {/* "Tryck för att prata" — fade in/out i idle */}
      <AnimatePresence>
        {isVoiceSupported && state === "idle" && (
          <motion.p
            key="hint"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            exit={{ opacity: 0, y: 4 }}
            transition={{
              opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 0.3 },
            }}
            className="text-xs text-gray-400 dark:text-zinc-500 select-none pointer-events-none"
          >
            Tryck för att prata
          </motion.p>
        )}
        {state === "listening" && (
          <motion.p
            key="listening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-red-500 dark:text-red-400 font-medium select-none pointer-events-none"
          >
            Lyssnar... (klicka för att avbryta)
          </motion.p>
        )}
        {state === "speaking" && (
          <motion.p
            key="speaking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-green-600 dark:text-green-400 font-medium select-none pointer-events-none"
          >
            Svarar... (klicka för att avbryta)
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
