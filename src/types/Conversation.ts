import type { Message } from "./Message";

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
};
