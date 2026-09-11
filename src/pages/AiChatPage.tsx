import { useEffect, useRef, useState } from "react";
import {
  Send,
  Sparkles,
  User as UserIcon,
  Loader2,
  ChevronDown,
  Zap,
  Copy,
  Check,
  Share2,
  RefreshCw,
} from "lucide-react";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { BottomSheet, LoadingOverlay } from "../components/common";
import { aiApi } from "../services/aiApi";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import { useAiChatHistory, type ChatMessage } from "../hooks/useAiChatHistory";

/* -------------------------------------------------------------------------- */
/*                              Types & Config                                */
/* -------------------------------------------------------------------------- */

const SUGGESTIONS = [
  "Berapa total jamaah aktif?",
  "Siapa saja yang perlu perhatian?",
  "Ringkasan kehadiran bulan ini",
  "Pengajian terdekat kapan?",
  "Daftar kelompok dan pembinanya",
];

const PLACEHOLDER_BY_ROLE: Record<string, string> = {
  SUPER_ADMIN: "Tanya data pengajian...",
  ADMIN: "Tanya data pengajian...",
  TIM_PNKB: "Tanya data pra nikah...",
  TIM_ABSENSI: "Tanya data absensi...",
};

const PROVIDERS = [
  {
    key: "auto",
    label: "Otomatis",
    description: "Pilih provider terbaik otomatis",
  },
  {
    key: "omniroute",
    label: "OmniRoute",
    description: "Provider utama, respons cepat",
  },
  {
    key: "gemini",
    label: "Gemini",
    description: "Google Gemini 2.0 Flash",
  },
  {
    key: "groq",
    label: "Groq",
    description: "Llama 3.3 70B (cepat & gratis)",
  },
] as const;

type ProviderKey = (typeof PROVIDERS)[number]["key"];

/* -------------------------------------------------------------------------- */
/*                          Avatar Icon (Custom)                              */
/* -------------------------------------------------------------------------- */

function AiAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-full bg-accent-soft text-accent flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M16 3c-3.5 2-6 5-6 8.5V14h12v-2.5C22 8 19.5 5 16 3Z"
          fill="currentColor"
          opacity="0.95"
        />
        <circle cx="16" cy="4" r="1.2" fill="currentColor" />
        <rect x="8" y="14" width="16" height="12" rx="1" fill="currentColor" />
        <rect
          x="4"
          y="10"
          width="3"
          height="16"
          rx="1"
          fill="currentColor"
          opacity="0.85"
        />
        <rect
          x="25"
          y="10"
          width="3"
          height="16"
          rx="1"
          fill="currentColor"
          opacity="0.85"
        />
        <circle cx="5.5" cy="9" r="1.5" fill="currentColor" />
        <circle cx="26.5" cy="9" r="1.5" fill="currentColor" />
        <path d="M14 26v-5a2 2 0 0 1 4 0v5h-4Z" fill="rgba(255,255,255,0.9)" />
        <rect
          x="10"
          y="17"
          width="2"
          height="3"
          rx="0.5"
          fill="rgba(255,255,255,0.7)"
        />
        <rect
          x="20"
          y="17"
          width="2"
          height="3"
          rx="0.5"
          fill="rgba(255,255,255,0.7)"
        />
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

export default function AiChatPage() {
  const { showToast } = useToast();
  const { user } = useAuth();

  // ✅ Pakai hook untuk history
  const { messages, setMessages, clearHistory, hydrated } = useAiChatHistory();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<ProviderKey>("auto");
  const [activeProvider, setActiveProvider] = useState<string>("");
  const [providerSheetOpen, setProviderSheetOpen] = useState(false);
  const [switchingProvider, setSwitchingProvider] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* ----------------------------- Load provider ----------------------------- */
  useEffect(() => {
    aiApi
      .getCurrentProvider()
      .then((info) => {
        setProvider((info.provider as ProviderKey) || "auto");
        setActiveProvider(info.active);
      })
      .catch(() => {
        // ignore — pakai default
      });
  }, []);

  /* ------------------------------ Auto scroll ------------------------------ */
  useEffect(() => {
    if (!hydrated) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, hydrated]);

  /* ----------------------------- Change provider --------------------------- */
  async function handleSelectProvider(key: ProviderKey) {
    setProviderSheetOpen(false);
    if (key === provider) return;

    setSwitchingProvider(true);
    try {
      const info = await aiApi.setProvider(key);
      setProvider(key);
      setActiveProvider(info.active);
      showToast(`Model: ${PROVIDERS.find((p) => p.key === key)?.label}`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal ganti model",
        "error",
      );
    } finally {
      setSwitchingProvider(false);
    }
  }

  /* ------------------------------- Send chat ------------------------------- */
  async function handleSend(text?: string) {
    const query = (text || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: query,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, text: m.text }));
      const res = await aiApi.chat(query, history, provider);

      if (res.provider) setActiveProvider(res.provider);

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: res.reply,
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal mengirim pesan",
        "error",
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          text: "Maaf, terjadi kesalahan. Silakan coba lagi.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------- Regenerate chat ---------------------------- */
  async function handleRegenerate() {
    if (loading) return;

    const lastUserIndex = [...messages]
      .reverse()
      .findIndex((m) => m.role === "user");
    if (lastUserIndex === -1) return;

    const actualIndex = messages.length - 1 - lastUserIndex;
    const lastUserMessage = messages[actualIndex];

    const trimmed = messages.slice(0, actualIndex + 1);
    setMessages(trimmed);
    setLoading(true);

    try {
      const history = trimmed.slice(0, -1).map((m) => ({
        role: m.role,
        text: m.text,
      }));
      const res = await aiApi.chat(lastUserMessage.text, history, provider);

      if (res.provider) setActiveProvider(res.provider);

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: res.reply,
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal regenerate",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  const placeholder =
    PLACEHOLDER_BY_ROLE[user?.role || ""] || "Tanya data pengajian...";

  const currentProviderLabel =
    PROVIDERS.find((p) => p.key === provider)?.label || provider;

  return (
    <AppLayout hideNav>
      <Header
        title="Asisten Pengajian"
        subtitle={`Model: ${currentProviderLabel}`}
        onBack={() => history.back()}
        right={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setProviderSheetOpen(true)}
              aria-label="Ganti model AI"
              className="flex items-center gap-1 h-9 px-2.5 rounded-xl text-ios-footnote font-medium text-accent transition-colors hover:bg-accent-soft/60 active:scale-[0.97]"
            >
              <Zap size={14} strokeWidth={2.4} />
              <span className="hidden xs:inline">Model</span>
              <ChevronDown size={12} strokeWidth={2.5} />
            </button>

            {messages.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-ios-body font-medium text-accent px-2 h-9 rounded-xl transition-colors hover:bg-accent-soft/60 active:scale-[0.97]"
              >
                Reset
              </button>
            )}
          </div>
        }
      />

      <div className="flex-1 flex flex-col min-h-0">
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {/* Loading saat history belum load */}
          {!hydrated && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-surface-muted" />
            </div>
          )}

          {/* Empty state */}
          {hydrated && messages.length === 0 && !loading && (
            <EmptyChat onSuggest={handleSend} />
          )}

          {/* Messages */}
          {hydrated &&
            messages.map((msg, i) => {
              const isLastAssistant =
                msg.role === "assistant" && i === messages.length - 1;
              return (
                <ChatBubble
                  key={msg.id}
                  message={msg}
                  isLastAssistant={isLastAssistant}
                  onRegenerate={isLastAssistant ? handleRegenerate : undefined}
                />
              );
            })}

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="sticky bottom-0 border-t border-surface-border backdrop-blur-xl bg-surface-bg/80">
          <div className="app-shell px-4 py-3 pb-safe">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={placeholder}
                rows={1}
                disabled={loading || !hydrated}
                className="flex-1 min-h-[44px] max-h-[120px] rounded-2xl border border-surface-border bg-surface-card px-4 py-2.5 text-[16px] text-surface-text placeholder:text-surface-muted/70 shadow-sm transition-all resize-none focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading || !hydrated}
                aria-label="Kirim"
                className="w-11 h-11 rounded-2xl bg-accent text-white flex items-center justify-center flex-shrink-0 transition-all hover:bg-accent-dark active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------ Provider Picker Sheet ------------------ */}
      <BottomSheet
        open={providerSheetOpen}
        onClose={() => setProviderSheetOpen(false)}
        title="Pilih Model AI"
      >
        <div className="space-y-2">
          {PROVIDERS.map((p) => {
            const isActive = p.key === provider;
            const isReallyActive = p.key === activeProvider;
            return (
              <button
                key={p.key}
                onClick={() => handleSelectProvider(p.key)}
                className={`w-full text-left rounded-2xl border p-3.5 flex items-center gap-3 transition-all active:scale-[0.99] ${
                  isActive
                    ? "border-accent bg-accent-soft"
                    : "border-surface-border bg-surface-card hover:bg-surface-card2"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isActive
                      ? "bg-accent text-white"
                      : "bg-surface-card2 text-surface-muted"
                  }`}
                >
                  <Sparkles size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-ios-body font-medium text-surface-text truncate">
                      {p.label}
                    </p>
                    {isReallyActive && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-accent-soft text-accent text-[9px] font-bold uppercase tracking-wide">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-ios-footnote text-surface-muted truncate">
                    {p.description}
                  </p>
                </div>
                {isActive && (
                  <div className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-ios-caption text-surface-muted text-center leading-relaxed">
          Model aktif akan dipakai untuk chat berikutnya. Jika model utama
          gagal, sistem otomatis beralih ke model lain.
        </p>
      </BottomSheet>

      <LoadingOverlay open={switchingProvider} label="Mengganti model..." />
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Empty Chat                                    */
/* -------------------------------------------------------------------------- */

function EmptyChat({ onSuggest }: { onSuggest: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4">
        <AiAvatar size={64} />
      </div>
      <h3 className="text-ios-nav font-semibold text-surface-text mb-1.5">
        Assalamu'alaikum
      </h3>
      <p className="text-ios-footnote text-surface-muted max-w-xs leading-relaxed mb-6">
        Saya siap membantu menjawab pertanyaan tentang jamaah, absensi,
        kelompok, dan pengumuman.
      </p>
      <div className="w-full max-w-sm space-y-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSuggest(s)}
            className="w-full text-left px-4 py-3 rounded-xl border border-surface-border bg-surface-card text-ios-footnote text-surface-text transition-all hover:border-accent/40 hover:bg-accent-soft/40 active:scale-[0.99]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Chat Bubble                                   */
/* -------------------------------------------------------------------------- */

function ChatBubble({
  message,
  isLastAssistant,
  onRegenerate,
}: {
  message: ChatMessage;
  isLastAssistant?: boolean;
  onRegenerate?: () => void;
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ text: message.text });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  }

  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      {isUser ? (
        <div className="w-8 h-8 rounded-full bg-surface-card2 text-surface-muted flex items-center justify-center flex-shrink-0">
          <UserIcon size={15} />
        </div>
      ) : (
        <AiAvatar size={32} />
      )}

      <div
        className={`max-w-[78%] flex flex-col gap-1 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-[14.5px] leading-relaxed ${
            isUser
              ? "bg-accent text-white rounded-tr-sm"
              : "bg-surface-card border border-surface-border text-surface-text rounded-tl-sm"
          }`}
        >
          <MessageContent text={message.text} />
        </div>

        {!isUser && (
          <div className="flex items-center gap-0.5 px-1">
            <ActionButton
              icon={copied ? <Check size={12} /> : <Copy size={12} />}
              label={copied ? "Tersalin" : "Salin"}
              onClick={handleCopy}
            />
            <ActionButton
              icon={<Share2 size={12} />}
              label="Bagikan"
              onClick={handleShare}
            />
            {isLastAssistant && onRegenerate && (
              <ActionButton
                icon={<RefreshCw size={12} />}
                label="Ulangi"
                onClick={onRegenerate}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-surface-muted transition-colors hover:bg-surface-card2 hover:text-accent active:scale-[0.95]"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Message Content Renderer                          */
/* -------------------------------------------------------------------------- */

function MessageContent({ text }: { text: string }) {
  const blocks = parseMarkdownBlocks(text);
  return (
    <div className="space-y-2">
      {blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Markdown Parser                               */
/* -------------------------------------------------------------------------- */

type MdBlock =
  | { type: "text"; content: string }
  | { type: "heading"; level: 1 | 2 | 3; content: string }
  | { type: "bullet"; content: string }
  | { type: "code"; language: string; content: string }
  | { type: "table"; headers: string[]; rows: string[][] };

function parseMarkdownBlocks(text: string): MdBlock[] {
  const lines = text.split("\n");
  const blocks: MdBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line.trim())) {
      const language = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ type: "code", language, content: codeLines.join("\n") });
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        content: headingMatch[2].trim(),
      });
      i++;
      continue;
    }

    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length) {
      const headerLine = line.trim();
      const sepLine = lines[i + 1].trim();
      if (/^\|[\s:|-]+\|$/.test(sepLine)) {
        const headers = splitTableRow(headerLine);
        const rows: string[][] = [];
        i += 2;
        while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
          rows.push(splitTableRow(lines[i].trim()));
          i++;
        }
        blocks.push({ type: "table", headers, rows });
        continue;
      }
    }

    if (/^\s*[-•*]\s+/.test(line)) {
      const content = line.replace(/^\s*[-•*]\s+/, "").trim();
      blocks.push({ type: "bullet", content });
      i++;
      continue;
    }

    if (!line.trim()) {
      i++;
      continue;
    }

    const textLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^```/.test(lines[i].trim()) &&
      !/^#{1,3}\s/.test(lines[i]) &&
      !/^\s*[-•*]\s+/.test(lines[i]) &&
      !/^\s*\|.*\|\s*$/.test(lines[i])
    ) {
      textLines.push(lines[i]);
      i++;
    }
    blocks.push({ type: "text", content: textLines.join("\n") });
  }

  return blocks;
}

function splitTableRow(line: string): string[] {
  return line
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());
}

/* -------------------------------------------------------------------------- */
/*                              Block Renderer                                */
/* -------------------------------------------------------------------------- */

function BlockRenderer({ block }: { block: MdBlock }) {
  switch (block.type) {
    case "heading": {
      const sizes = {
        1: "text-[17px] font-bold",
        2: "text-[16px] font-semibold",
        3: "text-[15px] font-semibold",
      };
      return (
        <p className={`${sizes[block.level]} text-surface-text`}>
          {renderInline(block.content)}
        </p>
      );
    }

    case "bullet":
      return (
        <div className="flex gap-2">
          <span className="text-accent flex-shrink-0 mt-0.5">•</span>
          <span className="flex-1">{renderInline(block.content)}</span>
        </div>
      );

    case "code":
      return <CodeBlock language={block.language} content={block.content} />;

    case "table":
      return <MarkdownTable headers={block.headers} rows={block.rows} />;

    case "text":
    default:
      return (
        <p className="whitespace-pre-wrap break-words">
          {renderInline(block.content)}
        </p>
      );
  }
}

/* -------------------------------------------------------------------------- */
/*                              Inline Renderer                               */
/* -------------------------------------------------------------------------- */

function renderInline(text: string): React.ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (
      part.startsWith("*") &&
      part.endsWith("*") &&
      part.length > 2 &&
      !part.startsWith("**")
    ) {
      return (
        <em key={i} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded-md bg-surface-card2 text-[13px] font-mono text-accent"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline underline-offset-2 break-all"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/* -------------------------------------------------------------------------- */
/*                              Code Block                                    */
/* -------------------------------------------------------------------------- */

function CodeBlock({
  language,
  content,
}: {
  language: string;
  content: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="relative rounded-xl bg-surface-card2 border border-surface-border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-surface-border bg-surface-card">
        <span className="text-[10px] font-mono text-surface-muted uppercase tracking-wide">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="text-[10px] font-medium text-surface-muted hover:text-accent transition-colors px-2 py-0.5 rounded-md hover:bg-accent-soft"
        >
          {copied ? "Tersalin" : "Salin"}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-[12.5px] leading-relaxed">
        <code className="font-mono text-surface-text whitespace-pre">
          {content}
        </code>
      </pre>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Markdown Table                                */
/* -------------------------------------------------------------------------- */

function MarkdownTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="rounded-xl border border-surface-border overflow-hidden bg-surface-card">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="bg-surface-card2">
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-3 py-2 text-left font-semibold text-surface-text border-b border-surface-border whitespace-nowrap"
                >
                  {renderInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className="border-b border-surface-border last:border-b-0"
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-3 py-2 text-surface-text align-top"
                  >
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Typing Indicator                                  */
/* -------------------------------------------------------------------------- */

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <AiAvatar size={32} />
      <div className="bg-surface-card border border-surface-border rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1">
          <span
            className="w-2 h-2 rounded-full bg-surface-muted animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-surface-muted animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-surface-muted animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
