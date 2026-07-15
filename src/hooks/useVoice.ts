"use client";

import { useState, useRef, useCallback } from "react";

export type VoiceState = "idle" | "listening" | "speaking";

export function useVoice(onTranscript: (text: string) => void) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  // Sätts till true när användaren skickade via röst — styr om AI-svaret läses upp
  const isVoiceActiveRef = useRef(false);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new SR() as any;
    recognition.lang = "sv-SE";
    recognition.continuous = false;
    recognition.interimResults = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      if (transcript) {
        isVoiceActiveRef.current = true;
        onTranscript(transcript);
      }
    };

    recognition.onend = () => setVoiceState("idle");
    recognition.onerror = () => setVoiceState("idle");

    recognitionRef.current = recognition;
    recognition.start();
    setVoiceState("listening");
  }, [isSupported, onTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setVoiceState("idle");
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined") return;
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "sv-SE";
    utterance.rate = 1.0;

    // Försök hitta svensk röst — kan vara asynkron i vissa webbläsare
    const assignVoice = () => {
      const sv = speechSynthesis.getVoices().find((v) => v.lang.startsWith("sv"));
      if (sv) utterance.voice = sv;
    };
    assignVoice();
    if (!speechSynthesis.getVoices().length) {
      speechSynthesis.addEventListener("voiceschanged", assignVoice, { once: true });
    }

    utterance.onstart = () => setVoiceState("speaking");
    utterance.onend = () => { setVoiceState("idle"); isVoiceActiveRef.current = false; };
    utterance.onerror = () => { setVoiceState("idle"); isVoiceActiveRef.current = false; };

    setVoiceState("speaking");
    speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel();
    setVoiceState("idle");
    isVoiceActiveRef.current = false;
  }, [isVoiceActiveRef]);

  const toggle = useCallback(() => {
    if (voiceState === "listening") stopListening();
    else if (voiceState === "speaking") stopSpeaking();
    else startListening();
  }, [voiceState, startListening, stopListening, stopSpeaking]);

  return { voiceState, isSupported, isVoiceActiveRef, toggle, speak };
}
