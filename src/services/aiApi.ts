import { restGet, restPost } from "./apiClient";

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
    restPost<AiChatResponse>("/api/v1/ai/chat", {
      message,
      history: JSON.stringify(history),
      provider: provider || "",
    }),

  getCurrentProvider: () => restGet<ProviderInfo>("/api/v1/ai/provider"),

  setProvider: (provider: string) =>
    restPost<ProviderInfo>("/api/v1/ai/provider", { provider }),
};
