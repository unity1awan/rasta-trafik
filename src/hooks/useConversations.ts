"use client";

import { useState, useRef } from "react";
import type { Conversation } from "@/types/Conversation";
import type { Message } from "@/types/Message";

/**
 * Hanterar konversationshistoriken i sidopanelen.
 *
 * `hasAddedCurrentChat` används som en ref (inte state) eftersom värdet
 * inte behöver trigga en re-render — det är en intern spärr mot att
 * samma chatt-session registreras flera gånger i listan.
 */
export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const hasAddedCurrentChat = useRef(false);

  /** Skapar en ny konversation med de fyra första orden som titel. */
  const startNewConversation = (firstMessage: string): string => {
    const id = crypto.randomUUID();
    const title = firstMessage.trim().split(/\s+/).slice(0, 4).join(" ");
    setConversations((prev) => [{ id, title, messages: [] }, ...prev]);
    setActiveId(id);
    hasAddedCurrentChat.current = true;
    return id;
  };

  /**
   * Synkar de senaste meddelandena tillbaka till aktiv konversation.
   * Hoppar över synk om det bara finns välkomstmeddelandet (length <= 1)
   * för att undvika att skriva över en nyss vald historikkonversation.
   */
  const syncMessages = (messages: Message[]) => {
    if (!activeId || messages.length <= 1) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, messages } : c))
    );
  };

  const selectConversation = (id: string): Message[] | null => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return null;
    setActiveId(id);
    hasAddedCurrentChat.current = true;
    return conv.messages;
  };

  const resetConversation = () => {
    setActiveId(null);
    hasAddedCurrentChat.current = false;
  };

  const isFirstMessage = () => !hasAddedCurrentChat.current;

  return {
    conversations,
    activeId,
    startNewConversation,
    syncMessages,
    selectConversation,
    resetConversation,
    isFirstMessage,
  };
}
