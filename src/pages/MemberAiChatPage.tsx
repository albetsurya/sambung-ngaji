import { useEffect, useRef, useState } from "react";
import {
  Send,
  User as UserIcon,
  Loader2,
  Copy,
  Check,
  Share2,
  RefreshCw,
} from "../components/ui/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { Button } from "../components/ui";
import { aiApi } from "../features/ai-chat/api/aiApi";
import { useToast } from "../contexts/ToastContext";
import { useAiChatHistory, type ChatMessage } from "../features/ai-chat/hooks/useAiChatHistory";

const SUGGESTIONS = [
  "Berapa persen kehadiran saya?",
  "Kapan jadwal pengajian berikutnya?",
  "Bagaimana status pembinaan saya?",
  "Tampilkan riwayat absensi saya",
  "Data diri saya saat ini",
];

function AiAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/20"
      style={{
        width: size,
        height: size,
        background:
          "linear-gradient(135deg, rgb(var(--c-accent)) 0%, rgb(var(--c-accent-dark)) 100%)",
      }}
    >
      <svg
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        
        <path
          d="M12 2 L13.5 9 L20.5 10.5 L13.5 12 L12 19 L10.5 12 L3.5 10.5 L10.5 9 Z"
          fill="white"
        />
        
        <path
          d="M19 17 L19.7 19.3 L22 20 L19.7 20.7 L19 23 L18.3 20.7 L16 20 L18.3 19.3 Z"
          fill="white"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}

export default function MemberAiChatPage() {
  const { showToast } = useToast();

  const { messages, setMessages, clearHistory, hydrated } = useAiChatHistory();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hydrated) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, hydrated]);

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
      const res = await aiApi.chat(query, history);

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
      const res = await aiApi.chat(lastUserMessage.text, history);

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

  return (
    <AppLayout hideNav>
      <Header
        title="Asisten Pribadi"
        subtitle="Bantuan data jamaah Anda"
        onBack={() => history.back()}
        right={
          messages.length > 0 ? (
            <Button
              onClick={clearHistory}
              variant="soft"
              size="sm"
            >
              Reset
            </Button>
          ) : undefined
        }
      />

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {!hydrated && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-surface-muted" />
            </div>
          )}

          {hydrated && messages.length === 0 && !loading && (
            <EmptyChat onSuggest={handleSend} />
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
                placeholder="Tanya tentang data Anda..."
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
    </AppLayout>
  );
}

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
        Saya siap membantu menjawab pertanyaan tentang data pribadi Anda:
        biodata, absensi, pembinaan, dan jadwal pengajian.
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
    } catch {}
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ text: message.text });
      } catch {}
    } else {
      handleCopy();
    }
  }

  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      {isUser ? (
        <div className="w-8 h-8 rounded-full bg-surface-card2 text-surface-muted flex items-center justify-center flex-shrink-0">
          <UserIcon size={16} />
        </div>
      ) : (
        <AiAvatar size={32} />
      )}

      <div
        className={`selectable max-w-[78%] flex flex-col gap-1 ${
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
    <Button
      onClick={onClick}
      variant="ghost"
      size="xs"
      leftIcon={icon}
    >
      {label}
    </Button>
  );
}

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
          className="px-1.5 py-0.5 rounded-md bg-surface-card2 text-[13px]  text-accent"
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
    } catch {}
  }

  return (
    <div className="relative rounded-xl bg-surface-card2 border border-surface-border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-surface-border bg-surface-card">
        <span className="text-[10px]  text-surface-muted uppercase tracking-wide">
          {language || "code"}
        </span>
        <Button onClick={handleCopy} variant="ghost" size="xs">
          {copied ? "Tersalin" : "Salin"}
        </Button>
      </div>
      <pre className="p-3 overflow-x-auto text-[12.5px] leading-relaxed">
        <code className=" text-surface-text whitespace-pre">
          {content}
        </code>
      </pre>
    </div>
  );
}

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
