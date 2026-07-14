"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useChat } from "@/hooks/useChat";
import { useLocation } from "@/hooks/useLocation";
import { useRoute } from "@/hooks/useRoute";
import { LandingView } from "@/components/landing/LandingView";
import { AppHeader } from "@/components/chat/AppHeader";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";

export default function Home() {
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

  return (
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
