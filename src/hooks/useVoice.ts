"use client";

import { useState, useRef, useCallback } from "react";

export type VoiceState = "idle" | "listening" | "speaking";

type SpeechRecognitionLike = { stop: () => void };

/**
 * Returnerar webbläsarens SpeechRecognition-konstruktor med webkit-fallback.
 * Typas som ett minimalt interface för att undvika `any` i resten av hooken.
 */
const getSpeechRecognition = (): (new () => SpeechRecognitionLike & {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: { [n: number]: { [n: number]: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
}) | null => {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null;
};

/**
 * Hanterar röstinteraktion via Web Speech API (STT) och SpeechSynthesis (TTS).
 *
 * `voiceActiveRef` sätts till true när användaren skickar via röst och återställs
 * när TTS är klar — detta styr om AI-svaret ska läsas upp automatiskt.
 */
export function useVoice(onTranscript: (text: string) => void) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voiceActiveRef = useRef(false);

  const isSupported = !!getSpeechRecognition();

  const startListening = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = "sv-SE";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      if (transcript) {
        voiceActiveRef.current = true;
        onTranscript(transcript);
      }
    };
    recognition.onend = () => setVoiceState("idle");
    recognition.onerror = () => setVoiceState("idle");

    recognitionRef.current = recognition;
    recognition.start();
    setVoiceState("listening");
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setVoiceState("idle");
  }, []);

  /**
   * Försöker tilldela en svensk röst direkt. Webbläsaren laddar röster asynkront
   * vid uppstart, så vi lyssnar på `voiceschanged` som fallback om listan är tom.
   */
  const speak = useCallback((text: string) => {
    if (typeof window === "undefined") return;
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "sv-SE";
    utterance.rate = 1.0;

    const assignSwedishVoice = () => {
      const sv = speechSynthesis.getVoices().find((v) => v.lang.startsWith("sv"));
      if (sv) utterance.voice = sv;
    };
    assignSwedishVoice();
    if (!speechSynthesis.getVoices().length) {
      speechSynthesis.addEventListener("voiceschanged", assignSwedishVoice, { once: true });
    }

    const resetState = () => { setVoiceState("idle"); voiceActiveRef.current = false; };
    utterance.onstart = () => setVoiceState("speaking");
    utterance.onend = resetState;
    utterance.onerror = resetState;

    setVoiceState("speaking");
    speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel();
    setVoiceState("idle");
    voiceActiveRef.current = false;
  }, []);

  /** Läser upp text enbart om senaste interaktion skedde via röst. */
  const speakIfVoiceActive = useCallback((text: string) => {
    if (voiceActiveRef.current) speak(text);
  }, [speak]);

  const toggle = useCallback(() => {
    if (voiceState === "listening") stopListening();
    else if (voiceState === "speaking") stopSpeaking();
    else startListening();
  }, [voiceState, startListening, stopListening, stopSpeaking]);

  return { voiceState, isSupported, toggle, speak, speakIfVoiceActive };
}
