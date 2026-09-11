import { call } from "./api";

export interface AiChatResponse {
  reply: string;
  provider?: string;
  requestedProvider?: string;
}

export interface ProviderInfo {
  provider: string;
  active: string;
}

export const aiApi = {
  chat: (
    message: string,
    history: { role: "user" | "assistant"; text: string }[] = [],
    provider?: string,
  ) =>
    call<AiChatResponse>("aiChat", {
      message,
      history: JSON.stringify(history),
      provider: provider || "",
    }),

  /** Ambil provider aktif saat ini */
  getCurrentProvider: () => call<ProviderInfo>("getCurrentProvider", {}),

  /** Set provider aktif */
  setProvider: (provider: string) =>
    call<ProviderInfo>("setAIProvider", { provider }),
};
