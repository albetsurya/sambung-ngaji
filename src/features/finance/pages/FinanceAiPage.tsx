import React, { useState } from "react";
import { financeApi } from "../api/financeApi";
import { useToast } from "../../../contexts/ToastContext";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

export const FinanceAiPage: React.FC = () => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Assalamu'alaikum! Saya Asisten AI Keuangan SabilKas. Ada yang bisa saya bantu terkait laporan kas, shodaqoh, atau kalkulasi zakat?",
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || loading) return;

    const userText = inputQuery.trim();
    setInputQuery("");

    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      const historyPayload = messages.slice(-10).map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      const res = await financeApi.sendAiChatQuery(userText, historyPayload);
      const reply = res?.data?.reply || res?.data?.text || "";
      if (res && res.success && reply) {
        setMessages((prev) => [...prev, { sender: "ai", text: reply }]);
      } else {
        const errMsg = res?.message || "Gagal mendapatkan respon dari AI.";
        showToast(errMsg, "error");
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: `[Error]: ${errMsg}` },
        ]);
      }
    } catch (err: any) {
      showToast(err.message || "Gagal menghubungi AI Assistant", "error");
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: `[Error]: ${err.message || "Terjadi kendala jaringan."}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold shadow-sm">
            AI
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">AI Financial Assistant</h3>
            <p className="text-[11px] text-slate-500">Tanyakan seputar kas, saldo, rekap, & aturan zakat</p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-slate-950/20">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-emerald-600 text-white rounded-br-none shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700/60 shadow-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-2xl rounded-bl-none p-3 text-xs flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <span>AI sedang berpikir...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
        <input
          type="text"
          placeholder="Tanyakan ke AI Keuangan..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border-0 focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={loading || !inputQuery.trim()}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
        >
          Kirim
        </button>
      </form>
    </div>
  );
};
