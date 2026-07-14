export type Message = {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
};
