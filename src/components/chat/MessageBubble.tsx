"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUpRight, TriangleAlert } from "lucide-react";
import type { Message } from "@/types/Message";
import { GoogleMapsIcon } from "@/components/icons/GoogleMapsIcon";
import { TypingIndicator } from "./TypingIndicator";

function MapsCard({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 mt-3 w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:border-zinc-300 hover:shadow-md transition-all shadow-sm group"
    >
      <GoogleMapsIcon className="w-5 h-5 shrink-0" />
      <span className="flex-1 text-sm font-medium text-slate-800">Öppna i Google Maps</span>
      <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-colors shrink-0" />
    </a>
  );
}

function ExternalLink({ url, isUser }: { url: string; isUser: boolean }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`underline underline-offset-2 ${isUser ? "text-blue-100" : "text-blue-600"}`}
    >
      {url}
    </a>
  );
}

function parseContent(text: string, isUser: boolean) {
  const parts = text.split(/(https?:\/\/[^\s\n]+|\*\*[^*]+\*\*|\n)/g);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part === "\n") return <br key={i} />;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("http")) {
      return part.includes("google.com/maps") ? (
        <MapsCard key={i} url={part} />
      ) : (
        <ExternalLink key={i} url={part} isUser={isUser} />
      );
    }
    return <span key={i}>{part}</span>;
  });
}

const CHAR_DELAY_MS = 20;

function StreamingText({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  // For previous (non-streaming) messages, initialize shown immediately to avoid flash
  const [shown, setShown] = useState(() => (isStreaming ? "" : text));
  const posRef = useRef(isStreaming ? 0 : text.length);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!isStreaming) {
      setShown(text);
      posRef.current = text.length;
      return;
    }

    if (posRef.current >= text.length) return;

    const tick = () => {
      if (posRef.current >= text.length) return;
      posRef.current += 1;
      setShown(text.slice(0, posRef.current));
      if (posRef.current < text.length) {
        timerRef.current = setTimeout(tick, CHAR_DELAY_MS);
      }
    };

    timerRef.current = setTimeout(tick, CHAR_DELAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, isStreaming]);

  // TypingIndicator visas så länge vi streamar men ännu inte visat något tecken
  if (isStreaming && shown.length === 0) {
    return <TypingIndicator />;
  }

  return (
    <>
      {parseContent(shown, false)}
      {isStreaming && shown.length > 0 && (
        <span className="inline-block w-0.5 h-3.5 bg-zinc-400 ml-0.5 animate-pulse align-middle rounded-full" />
      )}
    </>
  );
}

type Props = {
  message: Message;
  isLast: boolean;
  isLoading: boolean;
};

export function MessageBubble({ message, isLast, isLoading }: Props) {
  const isUser = message.role === "user";
  const isAssistantLast = isLast && !isUser;

  if (message.isError) {
    return (
      <div className="flex justify-start">
        <div className="flex items-start gap-2 max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed bg-amber-50 border border-amber-200 text-amber-800 shadow-sm">
          <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-blue-600 text-white rounded-br-sm shadow-sm"
            : "bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-slate-800 dark:text-zinc-100 rounded-bl-sm shadow-sm"
        }`}
      >
        {isUser ? (
          parseContent(message.content, true)
        ) : (
          <StreamingText
            text={message.content}
            isStreaming={isLoading && isAssistantLast}
          />
        )}
      </div>
    </div>
  );
}
