import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pengajian_ai_chat_history";
const MAX_MESSAGES = 100; // simpan maksimal 100 pesan terakhir

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

/**
 * Hook untuk simpan/restore history chat AI di localStorage.
 *
 * - Auto-load saat mount
 * - Auto-save saat messages berubah (debounced 500ms)
 * - Limit MAX_MESSAGES agar tidak overflow
 */
export function useAiChatHistory() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);

  /* --------------------------- Load dari storage --------------------------- */
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
      console.warn("[ChatHistory] Gagal load:", err);
      // Kalau corrupt, hapus
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  /* --------------------------- Save ke storage ----------------------------- */
  useEffect(() => {
    if (!hydrated) return;

    const timer = setTimeout(() => {
      try {
        // Limit jumlah pesan
        const trimmed = messages.slice(-MAX_MESSAGES);

        const payload: StoredData = {
          messages: trimmed,
          updatedAt: Date.now(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (err) {
        console.warn("[ChatHistory] Gagal save:", err);
      }
    }, 500); // debounce 500ms

    return () => clearTimeout(timer);
  }, [messages, hydrated]);

  /* ----------------------------- Clear history ----------------------------- */
  const clearHistory = useCallback(() => {
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return {
    messages,
    setMessages,
    clearHistory,
    hydrated, // true kalau sudah selesai load dari storage
  };
}
