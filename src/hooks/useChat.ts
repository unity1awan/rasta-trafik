"use client";

import { useState, useRef, useEffect } from "react";
import type { Message } from "@/types/Message";
import type { RouteCoordinates } from "./useRoute";

type Coordinates = { lat: number; lng: number } | null;

const WELCOME: Message = {
  role: "assistant",
  content:
    "Hej! Jag är Rasta — din AI-guide till rastplatser längs svenska vägar. Fråga mig om närmaste rastplats, sök längs en specifik väg eller planera stopp längs din resa.",
};

export function useChat(location: Coordinates, route: RouteCoordinates | null = null) {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [isLoading, setIsLoading] = useState(false);

  // Ref så att sendMessage alltid läser senaste location även vid stale closures
  const locationRef = useRef(location);
  useEffect(() => { locationRef.current = location; }, [location]);

  const routeRef = useRef(route);
  useEffect(() => { routeRef.current = route; }, [route]);

  const sendMessage = async (query: string) => {
    if (!query.trim() || isLoading) return;

    const loc = locationRef.current;
    const rt = routeRef.current;
    const history: Message[] = [...messages, { role: "user", content: query }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          userLat: loc?.lat,
          userLng: loc?.lng,
          fromLat: rt?.fromLat,
          fromLng: rt?.fromLng,
          toLat: rt?.toLat,
          toLng: rt?.toLng,
        }),
      });

      if (!response.ok || !response.body) throw new Error("server_error");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value);
        setMessages([...history, { role: "assistant", content: accumulated }]);
      }
    } catch (err) {
      const isNetworkError = err instanceof TypeError && err.message === "Failed to fetch";
      setMessages([
        ...history,
        {
          role: "assistant",
          isError: true,
          content: isNetworkError
            ? "Ingen internetanslutning. Kontrollera nätverket och försök igen."
            : "Något gick fel. Försök igen om en liten stund.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([WELCOME]);
    setIsLoading(false);
  };

  const loadConversation = (msgs: Message[]) => {
    setMessages(msgs.length > 0 ? msgs : [WELCOME]);
    setIsLoading(false);
  };

  return { messages, isLoading, sendMessage, resetChat, loadConversation };
}
