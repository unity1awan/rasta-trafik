"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useChat } from "@/hooks/useChat";
import { useLocation } from "@/hooks/useLocation";
import { useUser } from "@/hooks/useUser";
import { WelcomeGate } from "@/components/landing/WelcomeGate";
import { LandingView } from "@/components/landing/LandingView";
import { Sidebar } from "@/components/layout/Sidebar";
import { AppHeader } from "@/components/chat/AppHeader";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";

type View = "gate" | "app";

export default function Home() {
  const { user, loading } = useUser();
  const [view, setView] = useState<View>("gate");
  const wasLoggedIn = useRef(false);

  useEffect(() => {
    if (!loading && user) {
      wasLoggedIn.current = true;
      setView("app");
    } else if (!loading && !user && wasLoggedIn.current) {
      wasLoggedIn.current = false;
      setView("gate");
    }
  }, [loading, user]);

  const { location, requestLocation } = useLocation();
  const { messages, isLoading, sendMessage, resetChat } = useChat(location, null);

  const [conversations, setConversations] = useState<string[]>([]);
  const hasAddedCurrentChat = useRef(false);

  // Begär GPS automatiskt när appen öppnas
  useEffect(() => {
    if (view === "app") requestLocation();
  }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  const isLanding = messages.length === 1;

  const handleSend = (message: string) => {
    if (!hasAddedCurrentChat.current) {
      const title = message.trim().split(/\s+/).slice(0, 4).join(" ");
      setConversations((prev) => [title, ...prev]);
      hasAddedCurrentChat.current = true;
    }
    sendMessage(message);
  };

  const handleNewChat = () => {
    resetChat();
    hasAddedCurrentChat.current = false;
  };

  if (loading) return null;

  if (view === "gate") {
    return (
      <AnimatePresence mode="wait">
        <WelcomeGate key="gate" onGuest={() => setView("app")} />
      </AnimatePresence>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {user && (
        <Sidebar
          hasLocation={!!location}
          onNewChat={handleNewChat}
          conversations={conversations}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
        <AnimatePresence mode="wait">
          {isLanding ? (
            <LandingView
              key="landing"
              onSend={handleSend}
              isLoading={isLoading}
            />
          ) : (
            <div key="chat" className="flex flex-col h-full bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
              <AppHeader
                hasLocation={!!location}
                onReset={handleNewChat}
              />
              <MessageList messages={messages} isLoading={isLoading} />
              <ChatInput onSend={handleSend} disabled={isLoading} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
