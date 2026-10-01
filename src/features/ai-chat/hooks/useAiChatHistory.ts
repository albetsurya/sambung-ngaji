import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pengajian_ai_chat_history";
const MAX_MESSAGES = 100;

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
}

interface StoredData {
  messages: ChatMessage[];
  provider?: string;
  updatedAt: number;
}

export function useAiChatHistory() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setHydrated(true);
        return;
      }

      const parsed: StoredData = JSON.parse(raw);
      if (Array.isArray(parsed.messages)) {
        setMessages(parsed.messages);
      }
    } catch (err) {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const timer = setTimeout(() => {
      try {
        const trimmed = messages.slice(-MAX_MESSAGES);

        const payload: StoredData = {
          messages: trimmed,
          updatedAt: Date.now(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (err) {
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [messages, hydrated]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
    }
  }, []);

  return {
    messages,
    setMessages,
    clearHistory,
    hydrated,
  };
}
