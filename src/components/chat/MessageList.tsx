"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Message } from "@/types/Message";
import { MessageBubble } from "./MessageBubble";

type Props = {
  messages: Message[];
  isLoading: boolean;
};

export function MessageList({ messages, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <motion.div
      className="flex-1 overflow-y-auto px-4 py-5 space-y-3"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
    >
      <AnimatePresence initial={false}>
        {messages.map((message, index) => (
          <motion.div
            key={`${message.role}-${index}`}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <MessageBubble
              message={message}
              isLast={index === messages.length - 1}
              isLoading={isLoading}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={bottomRef} />
    </motion.div>
  );
}
