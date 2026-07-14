"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useChat } from "@/hooks/useChat";
import { useLocation } from "@/hooks/useLocation";
import { useRoute } from "@/hooks/useRoute";
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
      // Användaren loggade ut — skicka tillbaka till gate
      wasLoggedIn.current = false;
      setView("gate");
    }
  }, [loading, user]);

  const { location, requestLocation } = useLocation();
  const {
    fromText, setFromText,
    toText, setToText,
    coordinates: route,
    isGeocoding, isGettingGps,
    error: routeError,
    useGpsAsFrom,
    confirmRoute,
    clearRoute,
  } = useRoute();
  const { messages, isLoading, sendMessage, resetChat } = useChat(location, route);

  const prevRouteRef = useRef(route);
  useEffect(() => {
    if (route && !prevRouteRef.current) {
      sendMessage(`Visa rastplatser längs rutten från ${fromText} till ${toText}`);
    }
    prevRouteRef.current = route;
  }, [route]); // eslint-disable-line react-hooks/exhaustive-deps

  const isLanding = messages.length === 1;

  const handleNewChat = () => { resetChat(); clearRoute(); };

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
      {/* Sidebar — bara för inloggade */}
      {user && (
        <Sidebar hasLocation={!!location} onNewChat={handleNewChat} />
      )}

      {/* Huvudinnehåll */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
        <AnimatePresence mode="wait">
          {isLanding ? (
            <LandingView
              key="landing"
              onSend={sendMessage}
              isLoading={isLoading}
              route={{
                fromText,
                toText,
                onFromChange: setFromText,
                onToChange: setToText,
                onConfirm: confirmRoute,
                onClear: clearRoute,
                onUseGps: () => { useGpsAsFrom(); requestLocation(); },
                isActive: !!route,
                isGeocoding,
                isGettingGps,
                error: routeError,
              }}
            />
          ) : (
            <div key="chat" className="flex flex-col h-full bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
              <AppHeader
                hasLocation={!!location}
                onRequestLocation={requestLocation}
                onReset={handleNewChat}
                routeFrom={route ? fromText : undefined}
                routeTo={route ? toText : undefined}
              />
              <MessageList messages={messages} isLoading={isLoading} />
              <ChatInput onSend={sendMessage} disabled={isLoading} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
