"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useLocation } from "@/hooks/useLocation";
import { useUser } from "@/hooks/useUser";
import { useVoice } from "@/hooks/useVoice";
import { WelcomeGate } from "@/components/landing/WelcomeGate";
import { LandingView } from "@/components/landing/LandingView";
import { Sidebar } from "@/components/layout/Sidebar";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import type { Conversation } from "@/types/Conversation";

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
  const { messages, isLoading, sendMessage, resetChat, loadConversation } =
    useChat(location, null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const hasAddedCurrentChat = useRef(false);

  // Röst — onTranscript skickar direkt som prompt
  const { voiceState, isSupported: isVoiceSupported, isVoiceActiveRef, toggle: toggleVoice, speak } =
    useVoice((transcript) => handleSend(transcript));

  // Läs upp AI-svar med TTS när streaming är klar och användaren använde röst
  const prevIsLoadingRef = useRef(false);
  useEffect(() => {
    if (prevIsLoadingRef.current && !isLoading) {
      const last = messages[messages.length - 1];
      if (last?.role === "assistant" && !last.isError && isVoiceActiveRef.current) {
        speak(last.content);
      }
    }
    prevIsLoadingRef.current = isLoading;
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Begär GPS automatiskt när appen öppnas
  useEffect(() => {
    if (view === "app") requestLocation();
  }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  // Synka meddelanden tillbaka till aktiv konversation efter varje uppdatering
  useEffect(() => {
    if (!activeConversationId || messages.length <= 1) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversationId ? { ...c, messages } : c))
    );
  }, [messages, activeConversationId]);

  const isLanding = messages.length === 1;

  const handleSend = (message: string) => {
    if (!hasAddedCurrentChat.current) {
      const id = crypto.randomUUID();
      const title = message.trim().split(/\s+/).slice(0, 4).join(" ");
      setConversations((prev) => [{ id, title, messages: [] }, ...prev]);
      setActiveConversationId(id);
      hasAddedCurrentChat.current = true;
    }
    sendMessage(message);
  };

  const handleNewChat = () => {
    resetChat();
    setActiveConversationId(null);
    hasAddedCurrentChat.current = false;
  };

  const handleSelectConversation = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;
    setActiveConversationId(id);
    loadConversation(conv.messages);
    hasAddedCurrentChat.current = true;
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
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
        <AnimatePresence mode="wait">
          {isLanding ? (
            <LandingView
              key="landing"
              onSend={handleSend}
              isLoading={isLoading}
              hasLocation={!!location}
              onRequestLocation={requestLocation}
              voiceState={voiceState}
              onVoiceToggle={toggleVoice}
              isVoiceSupported={isVoiceSupported}
            />
          ) : (
            <div
              key="chat"
              className="flex flex-col h-full bg-white dark:bg-zinc-900"
            >
              <MessageList messages={messages} isLoading={isLoading} />

              {/* GPS-banner om position saknas */}
              <AnimatePresence>
                {!location && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.25 }}
                    className="flex justify-center px-4 pb-2"
                  >
                    <button
                      onClick={() => requestLocation()}
                      className="flex items-center gap-2.5 px-5 py-2 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                      </span>
                      <MapPin className="w-3.5 h-3.5" />
                      Aktivera GPS för bättre träffar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <ChatInput onSend={handleSend} disabled={isLoading} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
