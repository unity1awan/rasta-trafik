"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useChat } from "@/hooks/useChat";
import { useLocation } from "@/hooks/useLocation";
import { useRoute } from "@/hooks/useRoute";
import { useUser } from "@/hooks/useUser";
import { WelcomeGate } from "@/components/landing/WelcomeGate";
import { LandingView } from "@/components/landing/LandingView";
import { AppHeader } from "@/components/chat/AppHeader";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";

type View = "gate" | "app";

export default function Home() {
  const { user, loading } = useUser();
  const [view, setView] = useState<View>("gate");

  // Inloggad användare hoppar direkt förbi gate
  useEffect(() => {
    if (!loading && user) setView("app");
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

  // Kort blank under auth-laddning för att undvika glimt av gate för inloggade
  if (loading) return null;

  return (
    <AnimatePresence mode="wait">
      {view === "gate" ? (
        <WelcomeGate key="gate" onGuest={() => setView("app")} />
      ) : isLanding ? (
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
        <div key="chat" className="flex flex-col h-screen bg-gradient-to-b from-zinc-50 to-zinc-100">
          <AppHeader
            hasLocation={!!location}
            onRequestLocation={requestLocation}
            onReset={() => { resetChat(); clearRoute(); }}
            routeFrom={route ? fromText : undefined}
            routeTo={route ? toText : undefined}
          />
          <MessageList messages={messages} isLoading={isLoading} />
          <ChatInput onSend={sendMessage} disabled={isLoading} />
        </div>
      )}
    </AnimatePresence>
  );
}
