import { useEffect, useRef, useState } from "react";
import {
  Send,
  Sparkles,
  Star,
  Loader2,
  ChevronLeft,
  ChevronDown,
  Zap,
  Chip,
  Copy,
  Check,
  Share2,
  RefreshCw,
  Trash2,
} from "../components/common/FontAwesomeIcons";
import { AppLayout } from "../components/layout/AppLayout";
import { BottomSheet, Button, LoadingOverlay } from "../components/common";
import { abortAllApiCalls } from "../services/api";
import { aiApi } from "../services/aiApi";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import { useEnvironment } from "../hooks/useEnvironment";
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
    icon: Sparkles,
    color: "",
  },
  {
    key: "gemini",
    label: "Gemini",
    description: "Gemini 3.8 Flash (cepat & gratis)",
    icon: Star,
    color: "#1a73e8",
  },
  {
    key: "groq",
    label: "Groq",
    description: "GPT-OSS 120B (cepat & gratis)",
    icon: Zap,
    color: "#F55036",
  },
  {
    key: "nvidia",
    label: "Nvidia",
    description: "GPT-OSS 20B (gratis)",
    icon: Chip,
    color: "#76B900",
  },
] as const;

type ProviderKey = (typeof PROVIDERS)[number]["key"];

function providerOf(key: string): (typeof PROVIDERS)[number] {
  return (
    PROVIDERS.find((p) => p.key === key) ??
    PROVIDERS.find((p) => p.key === "auto")!
  );
}

/* Icon tile per provider: bintang Gemini, petir Groq, chip Nvidia. */
function ProviderIcon({
  iconKey,
  size = 40,
  circle = false,
}: {
  iconKey: ProviderKey;
  size?: number;
  circle?: boolean;
}) {
  const p = providerOf(iconKey);
  const Icon = p.icon;
  const glyph = Math.round(size * 0.45);
  return (
    <div
      className={`flex items-center justify-center flex-shrink-0 ${
        circle ? "rounded-full shadow-lg shadow-accent/20" : "rounded-xl"
      }`}
      style={{
        width: size,
        height: size,
        background: p.color
          ? p.color
          : "linear-gradient(135deg, rgb(var(--c-accent)) 0%, rgb(var(--c-accent-dark)) 100%)",
      }}
    >
      <Icon size={glyph} className="text-white" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Avatar Icon (Custom)                              */
/* -------------------------------------------------------------------------- */

function AiAvatar({ size = 32, iconKey = "auto" as ProviderKey }: { size?: number; iconKey?: ProviderKey }) {
  return <ProviderIcon iconKey={iconKey} size={size} circle />;
}

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

export default function AiChatPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const { isDevelopment } = useEnvironment();

  const { messages, setMessages, clearHistory, hydrated } = useAiChatHistory();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<ProviderKey>("auto");
  const [activeProvider, setActiveProvider] = useState<string>("");
  const [providerSheetOpen, setProviderSheetOpen] = useState(false);
  const [switchingProvider, setSwitchingProvider] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
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
        // ignore
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

  function handleResetClick() {
    setConfirmResetOpen(true);
  }

  function confirmReset() {
    clearHistory();
    setConfirmResetOpen(false);
    showToast("Percakapan direset");
  }

  const placeholder =
    PLACEHOLDER_BY_ROLE[user?.role || ""] || "Tanya data pengajian...";

  const currentProviderLabel =
    PROVIDERS.find((p) => p.key === provider)?.label || provider;

  /* Provider efektif: yang benar-benar dipakai server kalau sudah tahu,
     kalau belum ya pilihan user. Header + avatar ikut ini. */
  const effectiveKey: ProviderKey = (PROVIDERS.some((p) => p.key === activeProvider)
    ? activeProvider
    : provider) as ProviderKey;
  const effective = providerOf(effectiveKey);
  const EffectiveGlyph = effective.icon;
  const showActiveSuffix =
    activeProvider !== "" &&
    activeProvider !== provider &&
    PROVIDERS.some((p) => p.key === activeProvider);

  return (
    <AppLayout hideNav>
      {/* -------------------- Custom Header (compact) -------------------- */}
      <header className="sticky top-0 z-30 pt-safe border-b border-surface-border backdrop-blur-xl bg-surface-bg/80 supports-[backdrop-filter]:bg-surface-bg/70">
        <div className="flex items-center gap-1 h-[56px] px-2">
          <Button
            onClick={() => history.back()}
            aria-label="Kembali"
            variant="ghost"
            size="sm"
            iconOnly
            className="flex-shrink-0"
          >
            <ChevronLeft size={24} strokeWidth={2.2} />
          </Button>

          <div className="flex-1 min-w-0 flex flex-col justify-center px-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="text-ios-nav font-semibold text-surface-text truncate min-w-0">
                Asisten Sambung Ngaji
              </h1>
              {isDevelopment && (
                <span className="inline-flex items-center px-1 py-[1px] rounded text-[8px] font-bold uppercase tracking-wide bg-warning-soft text-warning border border-warning/20 flex-shrink-0 leading-none">
                  DEV
                </span>
              )}
            </div>
            <p className="text-[11px] text-surface-muted truncate leading-tight mt-0.5">
              Model: {currentProviderLabel}
              {showActiveSuffix && ` • Aktif: ${providerOf(activeProvider).label}`}
            </p>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              onClick={() => setProviderSheetOpen(true)}
              aria-label="Ganti model AI"
              title="Ganti model AI"
              variant="secondary"
              size="sm"
              iconOnly
            >
              <EffectiveGlyph
                size={16}
                strokeWidth={2.3}
                style={effective.color ? { color: effective.color } : undefined}
              />
            </Button>

            {messages.length > 0 && (
              <Button
                onClick={handleResetClick}
                aria-label="Reset percakapan"
                title="Reset percakapan"
                variant="softDanger"
                size="sm"
                iconOnly
              >
                <Trash2 size={16} strokeWidth={2.2} />
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {!hydrated && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-surface-muted" />
            </div>
          )}

          {hydrated && messages.length === 0 && !loading && (
            <EmptyChat onSuggest={handleSend} iconKey={effectiveKey} />
          )}

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
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading || !hydrated}
                aria-label="Kirim"
                variant="primary"
                size="sm"
                iconOnly
                className="flex-shrink-0"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </Button>
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
                <ProviderIcon iconKey={p.key} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-ios-body font-medium text-surface-text truncate">
                      {p.label}
                    </p>
                    {isReallyActive && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-accent-soft text-accent text-[9px] font-bold uppercase tracking-wide flex-shrink-0">
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

      {/* ------------------ Reset Confirmation Sheet ------------------ */}
      <BottomSheet
        open={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        title="Reset Percakapan?"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-danger-soft border border-danger/20">
            <div className="w-9 h-9 rounded-xl bg-danger text-white flex items-center justify-center flex-shrink-0">
              <Trash2 size={16} strokeWidth={2.3} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-ios-body font-medium text-danger mb-0.5">
                Semua riwayat akan dihapus
              </p>
              <p className="text-ios-footnote text-danger/80 leading-relaxed">
                Percakapan Anda dengan AI akan dihapus permanen. Tindakan ini
                tidak bisa dibatalkan.
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              onClick={() => setConfirmResetOpen(false)}
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              onClick={confirmReset}
              variant="danger"
              size="sm"
              className="flex-1"
            >
              Reset
            </Button>
          </div>
        </div>
      </BottomSheet>

      <LoadingOverlay open={switchingProvider} label="Mengganti model..." onCancel={() => abortAllApiCalls()} />
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Empty Chat                                    */
/* -------------------------------------------------------------------------- */

function EmptyChat({ onSuggest, iconKey }: { onSuggest: (text: string) => void; iconKey?: ProviderKey }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4">
        <AiAvatar size={64} iconKey={iconKey} />
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

  /* WhatsApp-style: runcing ke arah pengirim, tanpa avatar */
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="selectable max-w-[82%] bg-accent text-white px-3.5 py-2.5 text-[14.5px] leading-relaxed shadow-sm"
          style={{
            borderRadius: "16px 0 16px 16px",
          }}
        >
          <MessageContent text={message.text} />
        </div>
      </div>
    );
  }

  /* AI bubble: runcing ke kiri */
  return (
    <div className="flex justify-start">
      <div className="max-w-[82%]">
        <div
          className="selectable bg-surface-card border border-surface-border text-surface-text px-3.5 py-2.5 text-[14.5px] leading-relaxed shadow-sm"
          style={{
            borderRadius: "0 16px 16px 16px",
          }}
        >
          <MessageContent text={message.text} />
        </div>

        <div className="flex items-center gap-0.5 mt-1 px-1">
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
    <Button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      variant="ghost"
      size="xs"
      leftIcon={icon}
    >
      {label}
    </Button>
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
  | { type: "heading"; level: 1 | 2 | 3 | 4; content: string }
  | { type: "bullet"; content: string }
  | { type: "numbered"; number: string; content: string }
  | { type: "quote"; content: string }
  | { type: "divider" }
  | { type: "code"; language: string; content: string }
  | { type: "table"; headers: string[]; rows: string[][] };

function parseMarkdownBlocks(text: string): MdBlock[] {
  const lines = text.split("\n");
  const blocks: MdBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    /* ----------------------------- Code fence ----------------------------- */
    if (/^```/.test(trimmed)) {
      const language = trimmed.slice(3).trim();
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

    /* ------------------------ Horizontal rule ------------------------ */
    /* ---, ***, ___ (min 3 karakter) */
    if (/^([-*_])\1{2,}$/.test(trimmed)) {
      blocks.push({ type: "divider" });
      i++;
      continue;
    }

    /* ------------------------------ Heading ------------------------------ */
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+?)\s*#*$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3 | 4,
        content: headingMatch[2].trim(),
      });
      i++;
      continue;
    }

    /* ------------------------------- Table ------------------------------- */
    if (/^\|.*\|$/.test(trimmed) && i + 1 < lines.length) {
      const sepLine = lines[i + 1].trim();
      if (/^\|[\s:|-]+\|$/.test(sepLine)) {
        const headers = splitTableRow(trimmed);
        const rows: string[][] = [];
        i += 2;
        while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) {
          rows.push(splitTableRow(lines[i].trim()));
          i++;
        }
        blocks.push({ type: "table", headers, rows });
        continue;
      }
    }

    /* ---------------------------- Blockquote ---------------------------- */
    if (/^>\s?/.test(trimmed)) {
      const content = trimmed.replace(/^>\s?/, "");
      blocks.push({ type: "quote", content });
      i++;
      continue;
    }

    /* ------------------------- Numbered list ------------------------- */
    const numberedMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      blocks.push({
        type: "numbered",
        number: numberedMatch[1],
        content: numberedMatch[2].trim(),
      });
      i++;
      continue;
    }

    /* --------------------------- Bullet list --------------------------- */
    if (/^\s*[-•*]\s+/.test(line)) {
      const content = line.replace(/^\s*[-•*]\s+/, "").trim();
      blocks.push({ type: "bullet", content });
      i++;
      continue;
    }

    /* ---------------------------- Empty line ---------------------------- */
    if (!trimmed) {
      i++;
      continue;
    }

    /* ----------------------------- Paragraph ----------------------------- */
    const textLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^```/.test(lines[i].trim()) &&
      !/^#{1,4}\s/.test(lines[i]) &&
      !/^([-*_])\1{2,}$/.test(lines[i].trim()) &&
      !/^\s*[-•*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^>\s?/.test(lines[i].trim()) &&
      !/^\|.*\|$/.test(lines[i].trim())
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
        4: "text-[14.5px] font-semibold",
      };
      return (
        <p className={`${sizes[block.level]} leading-snug`}>
          {renderInline(block.content)}
        </p>
      );
    }

    case "bullet":
      return (
        <div className="flex gap-2 items-start">
          <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-current opacity-60 flex-shrink-0" />
          <span className="flex-1 min-w-0">{renderInline(block.content)}</span>
        </div>
      );

    case "numbered":
      return (
        <div className="flex gap-2 items-start">
          <span className="opacity-70 flex-shrink-0 font-medium min-w-[1.5em]">
            {block.number}.
          </span>
          <span className="flex-1 min-w-0">{renderInline(block.content)}</span>
        </div>
      );

    case "quote":
      return (
        <div
          className="pl-3 py-0.5 opacity-90"
          style={{
            borderLeft: "3px solid currentColor",
            borderLeftColor: "currentColor",
          }}
        >
          <span className="opacity-70 italic">
            {renderInline(block.content)}
          </span>
        </div>
      );

    case "divider":
      return (
        <hr
          className="my-2 border-0"
          style={{
            borderTop: "1px solid currentColor",
            opacity: 0.2,
          }}
        />
      );

    case "code":
      return <CodeBlock language={block.language} content={block.content} />;

    case "table":
      return <MarkdownTable headers={block.headers} rows={block.rows} />;

    case "text":
    default:
      return (
        <p className="whitespace-pre-wrap break-words leading-relaxed">
          {renderInline(block.content)}
        </p>
      );
  }
}

/* -------------------------------------------------------------------------- */
/*                              Inline Renderer                               */
/* -------------------------------------------------------------------------- */

function renderInline(text: string): React.ReactNode[] {
  /* Order matters: bold-italic dulu, baru bold, baru italic */
  const pattern =
    /(\*\*\*[^*\n]+\*\*\*|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|~~[^~\n]+~~|`[^`\n]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(pattern);

  return parts.map((part, i) => {
    /* ***bold italic*** atau ___bold italic___ */
    if (
      (part.startsWith("***") && part.endsWith("***") && part.length > 6) ||
      (part.startsWith("___") && part.endsWith("___") && part.length > 6)
    ) {
      const inner = part.slice(3, -3);
      return (
        <strong key={i} className="font-semibold">
          <em>{inner}</em>
        </strong>
      );
    }
    /* **bold** atau __bold__ */
    if (
      (part.startsWith("**") && part.endsWith("**") && part.length > 4) ||
      (part.startsWith("__") && part.endsWith("__") && part.length > 4)
    ) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    /* *italic* atau _italic_ */
    if (
      ((part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) ||
        (part.startsWith("_") &&
          part.endsWith("_") &&
          !part.startsWith("__"))) &&
      part.length > 2
    ) {
      return (
        <em key={i} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    /* ~~strike~~ */
    if (part.startsWith("~~") && part.endsWith("~~") && part.length > 4) {
      return (
        <span key={i} className="line-through opacity-70">
          {part.slice(2, -2)}
        </span>
      );
    }
    /* `code` */
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded-md text-[0.9em] font-mono"
          style={{
            backgroundColor: "rgba(0,0,0,0.1)",
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    /* [text](url) */
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 break-all"
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
    <div
      className="rounded-xl overflow-hidden my-1"
      style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
    >
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b"
        style={{ borderColor: "rgba(0,0,0,0.08)" }}
      >
        <span className="text-[10px] font-mono opacity-70 uppercase tracking-wide">
          {language || "code"}
        </span>
        <Button onClick={handleCopy} variant="ghost" size="xs">
          {copied ? "Tersalin" : "Salin"}
        </Button>
      </div>
      <pre className="p-3 overflow-x-auto text-[12.5px] leading-relaxed">
        <code className="font-mono whitespace-pre">{content}</code>
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
    <div
      className="rounded-xl overflow-hidden my-1"
      style={{ border: "1px solid rgba(0,0,0,0.1)" }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead style={{ backgroundColor: "rgba(0,0,0,0.05)" }}>
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-3 py-2 text-left font-semibold whitespace-nowrap"
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}
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
                style={{
                  borderBottom:
                    ri < rows.length - 1
                      ? "1px solid rgba(0,0,0,0.08)"
                      : "none",
                }}
              >
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-2 align-top">
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
    <div className="flex justify-start">
      <div
        className="bg-surface-card border border-surface-border px-4 py-3 shadow-sm"
        style={{ borderRadius: "0 16px 16px 16px" }}
      >
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
