import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { aiApi } from "../../../services/aiApi";
import { useToast } from "../../../contexts/ToastContext";
import { AppLayout, Header } from "../../../components/layout/AppLayout";
import { Button, Input, EmptyState } from "../../../components/common";
import { Sparkles, Send } from "../../../components/common/FontAwesomeIcons";
import { ApiError } from "../../../services/api";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

const QUICK_PROMPTS = [
  "Berapa total saldo kas bulan ini?",
  "Siapa saja yang belum bayar shodaqoh?",
  "Jelaskan pembagian zakat fitrah",
];

export const FinanceAiPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Assalamu'alaikum! Saya Asisten AI Keuangan SabilKas. Ada yang bisa saya bantu terkait laporan kas, shodaqoh, atau kalkulasi zakat?",
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendText = async (text: string) => {
    const userText = text.trim();
    if (!userText || loading) return;
    setInputQuery("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);
    try {
      const historyPayload = messages.slice(-10).map((m) => ({
        role: (m.sender === "user" ? "user" : "assistant") as "user" | "assistant",
        text: m.text,
      }));
      const res = await aiApi.chat(userText, historyPayload);
      if (res?.reply) {
        setMessages((prev) => [...prev, { sender: "ai", text: res.reply }]);
      } else {
        showToast("Gagal mendapatkan respon dari AI.", "error");
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: "[Error]: Gagal mendapatkan respon dari AI." },
        ]);
      }
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : "Gagal menghubungi AI Assistant";
      showToast(msg, "error");
      setMessages((prev) => [...prev, { sender: "ai", text: `[Error]: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendText(inputQuery);
  };

  return (
    <AppLayout>
      <Header
        title="Asisten AI"
        subtitle="Tanya jawab keuangan"
        onBack={() => navigate("/lainnya")}
        backLabel="Lainnya"
        showSyncButton={false}
      />

      <div className="py-4 flex flex-col" style={{ minHeight: "60vh" }}>
        {messages.length <= 1 && !loading ? (
          <div className="px-4">
            <EmptyState
              title="Mulai percakapan"
              description="Pilih contoh pertanyaan di bawah atau ketik pertanyaan sendiri."
              icon={<Sparkles size={26} className="text-accent" />}
            />
          </div>
        ) : (
          <div className="px-4 space-y-2.5">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-ios-body leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-accent text-white rounded-br-md"
                      : "bg-surface-card border border-surface-border text-surface-text rounded-bl-md shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface-card border border-surface-border rounded-2xl rounded-bl-md px-3.5 py-2.5 flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full animate-ping" />
                  <span className="text-ios-footnote text-surface-muted">AI sedang berpikir…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        <div className="px-4 mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q}
              onClick={() => sendText(q)}
              disabled={loading}
              className="whitespace-nowrap px-3.5 py-1.5 rounded-full text-ios-footnote font-medium border bg-surface-card text-accent border-accent/30 active:scale-[0.97] disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        <form onSubmit={handleSend} className="px-4 mt-2.5 flex gap-2 items-end">
          <div className="flex-1 min-w-0">
            <Input
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Tanyakan ke AI Keuangan…"
              disabled={loading}
              aria-label="Pesan untuk AI"
            />
          </div>
          <div className="mb-4 shrink-0">
            <Button
              type="submit"
              variant="primary"
              iconOnly
              disabled={loading || !inputQuery.trim()}
              aria-label="Kirim pesan"
            >
              <Send size={16} />
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};
