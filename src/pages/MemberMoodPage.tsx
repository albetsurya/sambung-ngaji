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
import { useToast } from "../contexts/ToastContext";
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
import { MoodIcon } from "../features/ai-chat/components/MoodIcon";

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
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pickerMood, setPickerMood] = useState<MoodKey | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const moodParam = searchParams.get("mood") as MoodKey | null;
  const selected = moodParam ? getMood(moodParam) : null;

  useEffect(() => {
    if (selected) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selected?.key]);

  function handleSubmit() {
    if (!pickerMood || isPreparing) return;
    if (user) {
      moodApi.save(pickerMood).catch(() => {
        showToast("Mood tampil, tetapi riwayat belum tersimpan. Coba sinkronkan lagi.", "warning");
      });
    }
    setIsPreparing(true);
    window.setTimeout(() => {
      setSearchParams({ mood: pickerMood });
      setIsPreparing(false);
    }, 900);
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
        {isPreparing && pickerMood ? (
          <MoodLoading mood={pickerMood} />
        ) : !selected ? (
          <MoodPicker selected={pickerMood} onSelect={setPickerMood} />
        ) : selected ? (
          <MoodResult key={selected.key} mood={selected} />
        ) : null}
      </div>

      {!selected && !isPreparing && (
        <div className="sticky bottom-0 z-20 mt-auto pointer-events-none">
          <div className="px-4 pt-10 pb-4 bg-gradient-to-t from-surface-bg via-surface-bg/95 to-transparent">
            <div className="pointer-events-auto">
              <Button
                onClick={handleSubmit}
                disabled={!pickerMood}
                variant="primary"
                size="lg"
                fullWidth
                leftIcon={<Sparkles size={16} />}
                className="!rounded-full !shadow-lg !shadow-accent/25 transition-all duration-300 enabled:hover:!shadow-xl enabled:hover:!shadow-accent/40 enabled:hover:-translate-y-0.5"
              >
                {pickerMood ? "Tampilkan untuk saya" : "Pilih mood dulu"}
              </Button>
              {!user && (
                <p className="text-ios-caption text-surface-muted text-center mt-3">
                  Masuk agar riwayat mood tersimpan di akun Anda.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="sticky bottom-0 z-20 mt-auto pointer-events-none">
          <div className="px-4 pt-10 pb-4 bg-gradient-to-t from-surface-bg via-surface-bg/95 to-transparent">
            <div className="pointer-events-auto grid grid-cols-2 gap-2.5">
              <Button
                onClick={() => navigate("/member/dzikir")}
                variant="soft"
                size="md"
                fullWidth
                leftIcon={<RefreshCw size={14} />}
                className="!rounded-full transition-all duration-300 hover:-translate-y-0.5"
              >
                Dzikir
              </Button>
              <Button
                onClick={() => navigate("/member/quran")}
                variant="secondary"
                size="md"
                fullWidth
                leftIcon={<ScrollText size={14} />}
                className="!rounded-full transition-all duration-300 hover:-translate-y-0.5"
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
      <div className="relative overflow-hidden rounded-[28px] bg-accent-soft ring-1 ring-accent/15 px-5 py-5 shadow-[0_8px_30px_-14px] shadow-accent/20">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative flex items-start gap-3.5">
          <div className="relative w-9 h-9 rounded-xl bg-white/80 backdrop-blur flex items-center justify-center shrink-0 shadow-sm ring-1 ring-white/60">
            <Heart size={15} className="text-accent" />
          </div>
          <p className="text-ios-footnote text-accent/95 leading-relaxed pt-1.5 font-medium">
            Tidak ada perasaan yang salah. Pilih yang paling dekat, kami akan
            temani dengan ayat, doa & hadits yang menenangkan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {MOOD_LIST.map((m, idx) => {
          const active = selected === m.key;
          return (
            <button
              key={m.key}
              onClick={() => onSelect(m.key)}
              style={{ animationDelay: `${idx * 50}ms` }}
              className={
                "group relative rounded-3xl p-4 flex flex-col items-center text-center gap-3 min-h-[168px] overflow-hidden " +
                "transition-all duration-300 ease-out active:scale-[0.96] " +
                (active
                  ? "bg-accent-soft ring-2 ring-accent/50 shadow-[0_16px_40px_-16px] shadow-accent/50 -translate-y-0.5"
                  : "bg-surface-card ring-1 ring-surface-border/60 " +
                    "shadow-[0_2px_12px_-6px_rgba(0,0,0,0.06)] " +
                    "hover:shadow-[0_14px_32px_-14px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:ring-accent/20")
              }
            >
              {active && (
                <span className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-accent/20 blur-2xl" />
              )}

              {active && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center shadow-md shadow-accent/40 animate-in zoom-in duration-200 z-10">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}

              <div className="relative flex items-center justify-center pt-1">
                <span
                  className={
                    "absolute inset-0 rounded-full blur-xl transition-all duration-300 " +
                    (active
                      ? "bg-accent/25 scale-110"
                      : "bg-accent/0 group-hover:bg-accent/15")
                  }
                />
                <MoodIcon
                  mood={m.key}
                  size={64}
                  className={
                    "relative transition-all duration-300 drop-shadow-sm " +
                    (active
                      ? "scale-110 -rotate-3"
                      : "group-hover:scale-110 group-hover:-rotate-3")
                  }
                />
              </div>

              <div className="relative flex flex-col gap-0.5">
                <span
                  className={
                    "text-ios-body font-bold tracking-tight transition-colors " +
                    (active
                      ? "text-accent"
                      : "text-surface-text group-hover:text-accent")
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

function MoodLoading({ mood }: { mood: MoodKey }) {
  return (
    <div
      className="relative flex min-h-[440px] flex-col items-center justify-center rounded-[28px] bg-accent-soft px-6 text-center ring-1 ring-accent/15 shadow-[0_20px_60px_-30px] shadow-accent/30 overflow-hidden"
      role="status"
      aria-live="polite"
    >
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-accent/15 blur-3xl animate-pulse" />
      <div
        className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-accent/10 blur-3xl animate-pulse"
        style={{ animationDelay: "500ms" }}
      />

      <div className="relative flex items-center justify-center">
        <span className="absolute h-32 w-32 rounded-full bg-accent/20 animate-ping" />
        <span className="absolute h-28 w-28 rounded-full bg-accent/15 animate-pulse" />
        <MoodIcon
          mood={mood}
          size={128}
          className="relative rounded-[2rem] drop-shadow-2xl animate-in zoom-in duration-500"
        />
      </div>

      <p className="relative mt-8 text-lg font-black tracking-tight text-surface-text">
        Menyiapkan penguat untuk hatimu…
      </p>
      <p className="relative mt-2 max-w-xs text-ios-footnote leading-relaxed text-surface-muted">
        Kami sedang memilih ayat, doa, dan nasihat yang paling sesuai.
      </p>
      <div className="relative mt-6 flex items-center gap-2" aria-hidden="true">
        {[0, 1, 2].map((item) => (
          <span
            key={item}
            className="h-2.5 w-2.5 animate-bounce rounded-full bg-accent shadow-sm"
            style={{ animationDelay: `${item * 140}ms` }}
          />
        ))}
      </div>
    </div>
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
      <div className="relative rounded-[28px] bg-accent px-5 py-8 text-center text-white shadow-[0_24px_60px_-20px] shadow-accent/50 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex items-center justify-center mx-auto mb-5">
          <span className="absolute h-28 w-28 rounded-full bg-white/20 animate-pulse" />
          <span className="absolute h-24 w-24 rounded-full bg-white/10 blur-md" />
          <MoodIcon
            mood={mood.key}
            size={104}
            className="relative rounded-[1.75rem] drop-shadow-2xl"
          />
        </div>

        <p className="relative text-ios-body font-bold mb-2.5 tracking-tight">
          Untukmu yang sedang {mood.label.toLowerCase()}
        </p>
        <p className="relative text-ios-footnote text-white/90 leading-relaxed max-w-sm mx-auto">
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
        <div className="relative rounded-[24px] bg-success-soft ring-1 ring-success/20 px-5 py-5 shadow-[0_8px_30px_-18px] shadow-success/30 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-success/10 blur-2xl" />
          <div className="relative">
            <NasehatContent text={mood.nasehat} />
          </div>
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
      ? "bg-accent-soft text-accent ring-1 ring-accent/15"
      : "bg-success-soft text-success ring-1 ring-success/15";

  return (
    <section className="space-y-3">
      <div className="px-1 flex items-center gap-2.5">
        <span
          className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-sm ${toneClass}`}
        >
          {icon}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-surface-muted">
          {title}
        </span>
        <span className="h-px flex-1 bg-surface-border" />
      </div>
      {children}
    </section>
  );
}

function AyatCard({ ayat, onOpen }: { ayat: MoodAyat; onOpen: () => void }) {
  return (
    <div className="relative rounded-[24px] bg-surface-card ring-1 ring-surface-border/60 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-300 hover:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.2)] hover:-translate-y-0.5">
      <div className="absolute inset-x-0 top-0 h-1 bg-accent" />

      <div className="px-5 py-3.5 border-b border-surface-border/60 flex items-center justify-between gap-3 bg-accent-soft/50">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-accent shadow-sm shadow-accent/50 shrink-0" />
          <span className="text-ios-caption font-semibold text-surface-text truncate">
            {ayat.surahNama} · {ayat.ayat}
          </span>
        </div>
        <button
          onClick={onOpen}
          className="group text-ios-caption font-semibold text-accent shrink-0 min-h-[32px] px-2.5 -mr-2 rounded-lg active:bg-accent-soft transition-all duration-300 hover:bg-accent-soft flex items-center gap-1"
        >
          Buka surah
          <span className="transition-transform duration-300 group-hover:translate-x-0.5">
            →
          </span>
        </button>
      </div>
      <div className="px-5 py-6 space-y-5">
        <p
          className="text-surface-text"
          style={{
            fontFamily:
              '"Noto Naskh Arabic", "Amiri Quran", "Scheherazade New", serif',
            fontSize: "23px",
            fontWeight: 400,
            lineHeight: 2.2,
            wordSpacing: "0.1em",
            direction: "rtl",
            textAlign: "right",
          }}
        >
          {ayat.teksArab}
        </p>
        <div className="pt-4 border-t border-dashed border-surface-border">
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
    <div className="relative rounded-[24px] bg-surface-card ring-1 ring-surface-border/60 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-300 hover:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.2)] hover:-translate-y-0.5">
      <div className="absolute inset-x-0 top-0 h-1 bg-accent" />

      <div className="px-5 py-3.5 border-b border-surface-border/60 flex items-center gap-2 bg-accent-soft/50">
        <span className="w-2 h-2 rounded-full bg-accent shadow-sm shadow-accent/50 shrink-0" />
        <p className="text-ios-caption font-semibold text-surface-text truncate">
          {doa.judul}
        </p>
      </div>
      <div className="px-5 py-6 space-y-5">
        <p
          className="text-surface-text"
          style={{
            fontFamily:
              '"Noto Naskh Arabic", "Amiri", "Scheherazade New", serif',
            fontSize: "21px",
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
        <div className="relative overflow-hidden rounded-2xl bg-accent-soft ring-1 ring-accent/15 px-4 py-4">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-accent/15 blur-2xl" />
          <p className="relative text-[10px] font-bold uppercase tracking-[0.1em] text-accent/90 mb-2 flex items-center gap-1.5">
            <Sparkles size={10} />
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
    <div className="relative rounded-[24px] bg-surface-card ring-1 ring-success/20 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-300 hover:shadow-[0_16px_40px_-20px] hover:shadow-success/25 hover:-translate-y-0.5">
      <div className="absolute inset-x-0 top-0 h-1 bg-success" />

      <div className="px-5 py-3.5 border-b border-success/15 bg-success-soft/50 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-success shadow-sm shadow-success/50 shrink-0" />
        <p className="text-ios-caption font-semibold text-surface-text truncate">
          {hadits.judul}
        </p>
      </div>
      <div className="px-5 py-6 space-y-5">
        <p
          className="text-surface-text"
          style={{
            fontFamily:
              '"Noto Naskh Arabic", "Amiri", "Scheherazade New", serif',
            fontSize: "21px",
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
        <div className="pt-4 border-t border-dashed border-surface-border">
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
    <div className="space-y-4">
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className="text-ios-footnote text-surface-text leading-[1.8]"
        >
          <InlineQuotes text={p} />
        </p>
      ))}
      {conclusion && (
        <div className="relative mt-2 rounded-2xl bg-surface-card shadow-sm ring-1 ring-success/20 px-4 py-4 overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1 bg-success" />
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-success/90 mb-2 flex items-center gap-1.5">
            <Sparkles size={10} />
            Hikmah
          </p>
          <p className="text-ios-footnote text-surface-text leading-[1.8]">
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
        className="inline rounded-md bg-accent-soft ring-1 ring-accent/15 px-1.5 py-[1px] box-decoration-clone"
      >
        <span className="text-surface-text font-medium">{quote}</span>
        {source && (
          <span className="text-[10px] font-semibold text-accent/80 ml-1">
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
