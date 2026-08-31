"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useChat } from "@/hooks/useChat";
import { useLocation } from "@/hooks/useLocation";
import { useUser } from "@/hooks/useUser";
import { useVoice } from "@/hooks/useVoice";
import { useConversations } from "@/hooks/useConversations";
import { WelcomeGate } from "@/components/landing/WelcomeGate";
import { LandingView } from "@/components/landing/LandingView";
import { Sidebar } from "@/components/layout/Sidebar";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { GpsBanner } from "@/components/chat/GpsBanner";

type View = "gate" | "app";

export default function Home() {
  const { user, loading } = useUser();
  const [view, setView] = useState<View>("gate");
  const wasLoggedIn = useRef(false);

  useEffect(() => {
    if (!loading && user) { wasLoggedIn.current = true; setView("app"); }
    else if (!loading && !user && wasLoggedIn.current) { wasLoggedIn.current = false; setView("gate"); }
  }, [loading, user]);

  const { location, requestLocation } = useLocation();
  const { messages, isLoading, sendMessage, resetChat, loadConversation } = useChat(location);
  const { conversations, activeId, startNewConversation, syncMessages, selectConversation, resetConversation, isFirstMessage } = useConversations();
  const { voiceState, isSupported: isVoiceSupported, toggle: toggleVoice, speakIfVoiceActive } = useVoice((transcript) => handleSend(transcript));

  useEffect(() => { if (view === "app") requestLocation(); }, [view]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { syncMessages(messages); }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!isLoading) speakIfVoiceActive(messages[messages.length - 1]?.content ?? ""); }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = (message: string) => {
    if (isFirstMessage()) startNewConversation(message);
    sendMessage(message);
  };

  const handleNewChat = () => { resetChat(); resetConversation(); };

  const handleSelectConversation = (id: string) => {
    const msgs = selectConversation(id);
    if (msgs) loadConversation(msgs);
  };

  if (loading) return null;

  if (view === "gate") {
    return (
      <AnimatePresence mode="wait">
        <WelcomeGate key="gate" onGuest={() => setView("app")} />
      </AnimatePresence>
    );
  }

  const isLanding = messages.length === 1;

  return (
    <div className="flex h-screen overflow-hidden">
      {user && (
        <Sidebar
          hasLocation={!!location}
          onNewChat={handleNewChat}
          conversations={conversations}
          activeConversationId={activeId}
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
            <div key="chat" className="flex flex-col h-full bg-white dark:bg-zinc-900">
              <MessageList messages={messages} isLoading={isLoading} />
              <AnimatePresence>
                {!location && <GpsBanner onActivate={requestLocation} />}
              </AnimatePresence>
              <ChatInput onSend={handleSend} disabled={isLoading} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
