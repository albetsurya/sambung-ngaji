import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { goBack } from "../utils/navigation";
import {
  ScrollText,
  Sparkles,
  RefreshCw,
  Heart,
} from "../components/ui/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { MasukButton } from "../components/ui";
import { Button } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import {
  MOOD_LIST,
  getMood,
  type Mood,
  type MoodAyat,
  type MoodDoa,
  type MoodHadits,
  type MoodKey,
} from "../features/ai-chat/data/mood";
import { moodApi } from "../services/domainApi";

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

type Dalil =
  | { kind: "ayat"; data: MoodAyat }
  | { kind: "hadits"; data: MoodHadits };

function pickDalil(mood: Mood): Dalil | null {
  const hasAyat = mood.ayat.length > 0;
  const hasHadits = mood.hadits.length > 0;
  if (!hasAyat && !hasHadits) return null;

  const preferAyat = hasAyat && (!hasHadits || Math.random() < 0.5);
  return preferAyat
    ? { kind: "ayat", data: pickRandom(mood.ayat) }
    : { kind: "hadits", data: pickRandom(mood.hadits) };
}

export default function MemberMoodPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pickerMood, setPickerMood] = useState<MoodKey | null>(null);
  const moodParam = searchParams.get("mood") as MoodKey | null;
  const selected = moodParam ? getMood(moodParam) : null;

  useEffect(() => {
    if (selected) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selected?.key]);

  function handleSubmit() {
    if (!pickerMood) return;
    if (user) moodApi.save(pickerMood).catch(() => {});
    setSearchParams({ mood: pickerMood });
  }

  return (
    <AppLayout hideNav showAiChat={false}>
      <Header
        title={selected ? "Untukmu" : "Tenangkan Hati"}
        subtitle={
          selected
            ? "Ayat, doa & hadits untuk hatimu"
            : "Pilih yang paling dekat dengan perasaanmu"
        }
        onBack={() => {
          if (selected) {
            setSearchParams({}, { replace: true });
            setPickerMood(null);
          } else {
            goBack(navigate, user ? "/member" : "/");
          }
        }}
        backLabel="Kembali"
        showSyncButton={false}
        right={!user ? <MasukButton /> : undefined}
      />

      <div className="px-4 pt-5 pb-36 space-y-5">
        {!selected && (
          <MoodPicker selected={pickerMood} onSelect={setPickerMood} />
        )}
        {selected && <MoodResult key={selected.key} mood={selected} />}
      </div>

      {!selected && (
        <div className="sticky bottom-0 z-20 mt-auto pointer-events-none">
          <div className="px-4 pt-8 pb-4 bg-gradient-to-t from-surface-bg via-surface-bg/95 to-transparent">
            <div className="pointer-events-auto">
              <Button
                onClick={handleSubmit}
                disabled={!pickerMood}
                variant="primary"
                size="lg"
                fullWidth
                leftIcon={<Sparkles size={16} />}
                className="!rounded-full !shadow-lg !shadow-accent/25"
              >
                {pickerMood ? "Tampilkan untuk saya" : "Pilih mood dulu"}
              </Button>
              {!user && (
                <p className="text-ios-caption text-surface-muted text-center mt-2.5">
                  Masuk agar riwayat mood tersimpan di akun Anda.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="sticky bottom-0 z-20 mt-auto pointer-events-none">
          <div className="px-4 pt-8 pb-4 bg-gradient-to-t from-surface-bg via-surface-bg/95 to-transparent">
            <div className="pointer-events-auto grid grid-cols-2 gap-2.5">
              <Button
                onClick={() => navigate("/member/dzikir")}
                variant="soft"
                size="md"
                fullWidth
                leftIcon={<RefreshCw size={14} />}
                className="!rounded-full"
              >
                Dzikir
              </Button>
              <Button
                onClick={() => navigate("/member/quran")}
                variant="secondary"
                size="md"
                fullWidth
                leftIcon={<ScrollText size={14} />}
                className="!rounded-full"
              >
                Al-Quran
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function MoodPicker({
  selected,
  onSelect,
}: {
  selected: MoodKey | null;
  onSelect: (k: MoodKey) => void;
}) {
  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent-soft via-accent-soft/70 to-accent-soft/30 ring-1 ring-accent/15 px-4 py-4">
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-accent/10 blur-2xl" />
        <div className="relative flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/70 flex items-center justify-center shrink-0">
            <Heart size={14} className="text-accent" />
          </div>
          <p className="text-ios-footnote text-accent/90 leading-relaxed pt-1">
            Tidak ada perasaan yang salah. Pilih yang paling dekat, kami akan
            temani dengan ayat, doa & hadits yang menenangkan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {MOOD_LIST.map((m) => {
          const active = selected === m.key;
          return (
            <button
              key={m.key}
              onClick={() => onSelect(m.key)}
              className={
                "group relative rounded-3xl p-4 flex flex-col items-center text-center gap-2.5 min-h-[148px] " +
                "transition-all duration-300 ease-out active:scale-[0.96] " +
                (active
                  ? "bg-gradient-to-br from-accent-soft via-accent-soft/70 to-accent-soft/30 " +
                    "ring-2 ring-accent/50 shadow-[0_12px_36px_-16px] shadow-accent/45"
                  : "bg-surface-card ring-1 ring-surface-border/60 " +
                    "shadow-[0_2px_12px_-6px_rgba(0,0,0,0.06)] " +
                    "hover:shadow-[0_10px_28px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5")
              }
            >
              <div
                className={
                  "w-14 h-14 rounded-2xl flex items-center justify-center " +
                  "transition-all duration-300 " +
                  (active
                    ? "bg-transparent scale-110"
                    : "bg-surface-card2 group-hover:scale-105")
                }
              >
                <span className="text-[30px] leading-none drop-shadow-sm">
                  {m.emoji}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span
                  className={
                    "text-ios-body font-bold tracking-tight " +
                    (active ? "text-accent" : "text-surface-text")
                  }
                >
                  {m.label}
                </span>
                <span className="text-[11px] text-surface-muted leading-snug line-clamp-2">
                  {m.deskripsi}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function MoodResult({ mood }: { mood: Mood }) {
  const navigate = useNavigate();

  const [dalil] = useState<Dalil | null>(() => pickDalil(mood));
  const [doa] = useState<MoodDoa | null>(() =>
    mood.doa.length > 0 ? pickRandom(mood.doa) : null,
  );

  return (
    <>
      <div className="rounded-3xl bg-accent px-5 py-7 text-center text-white shadow-[0_20px_48px_-20px] shadow-accent/50">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center ring-1 ring-white/30">
          <span className="text-[44px] leading-none">{mood.emoji}</span>
        </div>
        <p className="text-ios-body font-bold mb-2 tracking-tight">
          Untukmu yang sedang {mood.label.toLowerCase()}
        </p>
        <p className="text-ios-footnote text-white/85 leading-relaxed max-w-sm mx-auto">
          {mood.pembuka}
        </p>
      </div>

      {dalil && (
        <Section
          title={dalil.kind === "ayat" ? "Ayat untukmu" : "Hadits untukmu"}
          icon={
            dalil.kind === "ayat" ? (
              <ScrollText size={12} className="text-accent" />
            ) : (
              <Heart size={12} className="text-success" />
            )
          }
          tone={dalil.kind === "ayat" ? "accent" : "success"}
        >
          {dalil.kind === "ayat" ? (
            <AyatCard
              ayat={dalil.data}
              onOpen={() => navigate("/member/quran/" + dalil.data.surah)}
            />
          ) : (
            <HaditsCard hadits={dalil.data} />
          )}
        </Section>
      )}

      {doa && (
        <Section
          title="Doa untukmu"
          icon={<Sparkles size={12} className="text-accent" />}
          tone="accent"
        >
          <DoaCard doa={doa} />
        </Section>
      )}

      <Section
        title="Nasehat & Hikmah"
        icon={<Heart size={12} className="text-success" />}
        tone="success"
      >
        <div className="rounded-3xl bg-success-soft/60 ring-1 ring-success/15 px-5 py-5">
          <NasehatContent text={mood.nasehat} />
        </div>
      </Section>

      <p className="text-ios-caption text-surface-muted text-center pt-1 italic">
        Dalil & doa berganti setiap kamu membuka halaman ini.
      </p>
    </>
  );
}

function Section({
  title,
  icon,
  tone,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  tone: "accent" | "success";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "accent"
      ? "bg-accent-soft/60 text-accent"
      : "bg-success-soft/60 text-success";

  return (
    <section className="space-y-2.5">
      <div className="px-1 flex items-center gap-2">
        <span
          className={`w-6 h-6 rounded-lg flex items-center justify-center ${toneClass}`}
        >
          {icon}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-surface-muted">
          {title}
        </span>
      </div>
      {children}
    </section>
  );
}

function AyatCard({ ayat, onOpen }: { ayat: MoodAyat; onOpen: () => void }) {
  return (
    <div className="relative rounded-3xl bg-surface-card ring-1 ring-surface-border/60 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] overflow-hidden">
      <div className="px-5 py-3 border-b border-surface-border/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
          <span className="text-ios-caption font-semibold text-surface-text truncate">
            {ayat.surahNama} · {ayat.ayat}
          </span>
        </div>
        <button
          onClick={onOpen}
          className="text-ios-caption font-semibold text-accent shrink-0 min-h-[32px] px-2 -mr-2 rounded-lg active:bg-accent-soft transition-colors"
        >
          Buka surah →
        </button>
      </div>
      <div className="px-5 py-5 space-y-4">
        <p
          className="text-surface-text"
          style={{
            fontFamily:
              '"Noto Naskh Arabic", "Amiri Quran", "Scheherazade New", serif',
            fontSize: "22px",
            fontWeight: 400,
            lineHeight: 2.2,
            wordSpacing: "0.1em",
            direction: "rtl",
            textAlign: "right",
          }}
        >
          {ayat.teksArab}
        </p>
        <div className="pt-3 border-t border-dashed border-surface-border">
          <p className="text-ios-footnote text-surface-text leading-relaxed italic">
            &ldquo;{ayat.teksIndonesia}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}

function DoaCard({ doa }: { doa: MoodDoa }) {
  return (
    <div className="relative rounded-3xl bg-surface-card ring-1 ring-surface-border/60 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] overflow-hidden">
      <div className="px-5 py-3 border-b border-surface-border/60 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
        <p className="text-ios-caption font-semibold text-surface-text truncate">
          {doa.judul}
        </p>
      </div>
      <div className="px-5 py-5 space-y-4">
        <p
          className="text-surface-text"
          style={{
            fontFamily:
              '"Noto Naskh Arabic", "Amiri", "Scheherazade New", serif',
            fontSize: "20px",
            fontWeight: 400,
            lineHeight: 2.1,
            wordSpacing: "0.1em",
            direction: "rtl",
            textAlign: "right",
          }}
        >
          {doa.arab}
        </p>
        <p className="text-ios-footnote italic text-surface-muted leading-relaxed">
          {doa.latin}
        </p>
        <div className="relative overflow-hidden rounded-2xl bg-accent-soft/50 ring-1 ring-accent/10 px-4 py-3.5">
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-accent/10 blur-xl" />
          <p className="relative text-[10px] font-bold uppercase tracking-[0.08em] text-accent/80 mb-1.5">
            Artinya
          </p>
          <p className="relative text-ios-footnote text-surface-text leading-relaxed">
            {doa.arti}
          </p>
        </div>
        {doa.sumber && (
          <p className="text-ios-caption text-surface-muted">
            <span className="font-semibold">Sumber:</span> {doa.sumber}
          </p>
        )}
      </div>
    </div>
  );
}

function HaditsCard({ hadits }: { hadits: MoodHadits }) {
  return (
    <div className="relative rounded-3xl bg-surface-card ring-1 ring-success/20 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] overflow-hidden">
      <div className="px-5 py-3 border-b border-success/15 bg-success-soft/30 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
        <p className="text-ios-caption font-semibold text-surface-text truncate">
          {hadits.judul}
        </p>
      </div>
      <div className="px-5 py-5 space-y-4">
        <p
          className="text-surface-text"
          style={{
            fontFamily:
              '"Noto Naskh Arabic", "Amiri", "Scheherazade New", serif',
            fontSize: "20px",
            fontWeight: 400,
            lineHeight: 2.1,
            wordSpacing: "0.1em",
            direction: "rtl",
            textAlign: "right",
          }}
        >
          {hadits.arab}
        </p>
        <p className="text-ios-footnote italic text-surface-muted leading-relaxed">
          {hadits.latin}
        </p>
        <div className="pt-3 border-t border-dashed border-surface-border">
          <p className="text-ios-footnote text-surface-text leading-relaxed">
            &ldquo;{hadits.arti}&rdquo;
          </p>
        </div>
        <p className="text-ios-caption text-surface-muted">
          <span className="font-semibold">Sumber:</span> {hadits.sumber}
        </p>
      </div>
    </div>
  );
}

function NasehatContent({ text }: { text: string }) {
  const normalized = text
    .replace(/\bHR\.\s/g, "HR\u00A0")
    .replace(/\bNo\.\s/g, "No\u00A0");

  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const conclIdx = sentences.findIndex((s) =>
    /^(maka hikmahnya|maka dari itu|maka|jadi|karena itu|oleh karena itu)[:,]?\s/i.test(
      s,
    ),
  );

  let main: string[] = [];
  let conclusion: string | null = null;

  if (conclIdx >= 0) {
    conclusion = sentences[conclIdx].replace(
      /^(maka hikmahnya|maka dari itu|maka|jadi|karena itu|oleh karena itu)[:,]?\s*/i,
      "",
    );
    main = [...sentences.slice(0, conclIdx), ...sentences.slice(conclIdx + 1)];
  } else {
    main = sentences;
  }

  const paragraphs: string[] = [];
  for (let i = 0; i < main.length; i += 2) {
    paragraphs.push(main.slice(i, i + 2).join(" "));
  }

  return (
    <div className="space-y-3.5">
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className="text-ios-footnote text-surface-text leading-[1.75]"
        >
          <InlineQuotes text={p} />
        </p>
      ))}
      {conclusion && (
        <div className="mt-1 rounded-2xl bg-surface-card shadow-sm ring-1 ring-success/20 px-4 py-3.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-success/80 mb-1.5">
            Hikmah
          </p>
          <p className="text-ios-footnote text-surface-text leading-[1.75]">
            <InlineQuotes text={conclusion} />
          </p>
        </div>
      )}
    </div>
  );
}

function InlineQuotes({ text }: { text: string }) {
  const regex = /[“”"]([^“”"]+)[“”"]\s*(\([^)]+\))?/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIndex) {
      nodes.push(<span key={key++}>{text.slice(lastIndex, m.index)}</span>);
    }
    const quote = m[1];
    const source = m[2]?.replace(/[()]/g, "");
    nodes.push(
      <span
        key={key++}
        className="inline rounded-md bg-surface-card2 ring-1 ring-surface-border/60 px-1.5 py-[1px] box-decoration-clone"
      >
        <span className="text-surface-text font-medium">{quote}</span>
        {source && (
          <span className="text-[10px] font-semibold text-surface-text/70 ml-1">
            · {source}
          </span>
        )}
      </span>,
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }

  return <>{nodes}</>;
}
