import { useState } from "react";
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
  const moodParam = searchParams.get("mood") as MoodKey | null;
  const selected = moodParam ? getMood(moodParam) : null;

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
          if (selected) setSearchParams({}, { replace: true });
          else goBack(navigate, user ? "/member" : "/");
        }}
        backLabel="Kembali"
        showSyncButton={false}
        right={
          !user ? (
              <MasukButton />
          ) : undefined
        }
      />

      <div className="px-4 py-4 space-y-4 pb-8">
        {!selected && (
          <MoodPicker onSelect={(k) => setSearchParams({ mood: k })} />
        )}
        
        {selected && <MoodResult key={selected.key} mood={selected} />}
      </div>
    </AppLayout>
  );
}


function MoodPicker({ onSelect }: { onSelect: (k: MoodKey) => void }) {
  const [selected, setSelected] = useState<MoodKey | null>(null);
  const { user } = useAuth();

  return (
    <>
      <div className="rounded-2xl border border-accent/15 bg-accent-soft/60 px-4 py-3.5">
        <p className="text-ios-footnote text-accent/90 leading-relaxed">
          Tidak ada perasaan yang salah. Pilih yang paling dekat, kami akan
          temani dengan ayat, doa & hadits yang menenangkan.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {MOOD_LIST.map((m) => {
          const active = selected === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setSelected(m.key)}
              className={
                "rounded-2xl border p-4 flex flex-col items-center text-center gap-2 transition-all duration-200 active:scale-[0.97] " +
                (active
                  ? "border-accent bg-accent-soft shadow-sm shadow-accent/20"
                  : "border-surface-border bg-surface-card hover:bg-surface-card2")
              }
            >
              <span className="text-[36px] leading-none">{m.emoji}</span>
              <span
                className={
                  "text-ios-body font-semibold " +
                  (active ? "text-accent" : "text-surface-text")
                }
              >
                {m.label}
              </span>
              <span className="text-ios-caption text-surface-muted leading-snug">
                {m.deskripsi}
              </span>
            </button>
          );
        })}
      </div>

      <Button
        onClick={() => {
          if (selected) {
            if (user) moodApi.save(selected).catch(() => {});
            onSelect(selected);
          }
        }}
        disabled={!selected}
        variant="primary"
        size="lg"
        fullWidth
        leftIcon={<Sparkles size={16} />}
      >
        {selected ? "Tampilkan untuk saya" : "Pilih mood dulu"}
      </Button>
      {!user && (
        <p className="text-ios-caption text-surface-muted text-center">
          Masuk agar riwayat mood tersimpan di akun Anda.
        </p>
      )}
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
      
      <div className="rounded-3xl border border-accent/20 bg-gradient-to-br from-accent-soft to-accent-soft/40 px-5 py-6 text-center">
        <span className="text-[56px] leading-none block mb-3">
          {mood.emoji}
        </span>
        <p className="text-ios-body font-semibold text-accent mb-2">
          Untukmu yang sedang {mood.label.toLowerCase()}
        </p>
        <p className="text-ios-footnote text-accent/90 leading-relaxed max-w-sm mx-auto">
          {mood.pembuka}
        </p>
      </div>

      
      {dalil && (
        <Section
          title={dalil.kind === "ayat" ? "Ayat untukmu" : "Hadits untukmu"}
          icon={
            dalil.kind === "ayat" ? (
              <ScrollText size={14} className="text-accent" />
            ) : (
              <Heart size={14} className="text-success" />
            )
          }
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
          icon={<Sparkles size={14} className="text-accent" />}
        >
          <DoaCard doa={doa} />
        </Section>
      )}

      
      <Section
        title="Nasehat & Hikmah"
        icon={<Heart size={14} className="text-success" />}
      >
        <div className="rounded-2xl border border-success/20 bg-success-soft/60 px-4 py-4">
          <p className="text-ios-footnote text-surface-text leading-relaxed">
            {mood.nasehat}
          </p>
        </div>
      </Section>

      
      <div className="flex flex-col gap-2 pt-2">
        <Button
          onClick={() => navigate("/member/dzikir")}
          variant="soft"
          size="md"
          fullWidth
          leftIcon={<RefreshCw size={14} />}
        >
          Lanjutkan dengan dzikir
        </Button>
        <Button
          onClick={() => navigate("/member/quran")}
          variant="secondary"
          size="md"
          fullWidth
          leftIcon={<ScrollText size={14} />}
        >
          Baca Al-Quran
        </Button>
      </div>

      <p className="text-ios-caption text-surface-muted text-center pt-1">
        Dalil & doa berganti setiap kamu membuka halaman ini.
      </p>
    </>
  );
}


function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2.5">
      <p className="text-ios-footnote font-semibold text-surface-text px-1 flex items-center gap-1.5">
        {icon}
        {title}
      </p>
      {children}
    </section>
  );
}

function AyatCard({ ayat, onOpen }: { ayat: MoodAyat; onOpen: () => void }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden">
      <div className="px-4 py-2.5 border-b border-surface-border flex items-center justify-between gap-2">
        <span className="text-ios-caption font-medium text-surface-text">
          {ayat.surahNama} : {ayat.ayat}
        </span>
        <button
          onClick={onOpen}
          className="text-ios-caption font-medium text-accent transition-colors duration-200 hover:text-accent-dark"
        >
          Buka surah →
        </button>
      </div>
      <div className="px-4 py-4 space-y-3">
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
        <p className="text-ios-footnote text-surface-text leading-relaxed">
          &ldquo;{ayat.teksIndonesia}&rdquo;
        </p>
      </div>
    </div>
  );
}

function DoaCard({ doa }: { doa: MoodDoa }) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden">
      <div className="px-4 py-2.5 border-b border-surface-border">
        <p className="text-ios-caption font-medium text-surface-text">
          {doa.judul}
        </p>
      </div>
      <div className="px-4 py-4 space-y-3">
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
        <div className="rounded-xl bg-accent-soft/50 border border-accent/10 px-3.5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-accent/80 mb-1">
            Artinya
          </p>
          <p className="text-ios-footnote text-surface-text leading-relaxed">
            {doa.arti}
          </p>
        </div>
        {doa.sumber && (
          <p className="text-ios-caption text-surface-muted">
            <span className="font-medium">Sumber:</span> {doa.sumber}
          </p>
        )}
      </div>
    </div>
  );
}

function HaditsCard({ hadits }: { hadits: MoodHadits }) {
  return (
    <div className="rounded-2xl border border-success/20 bg-surface-card overflow-hidden">
      <div className="px-4 py-2.5 border-b border-success/15 bg-success-soft/40">
        <p className="text-ios-caption font-medium text-surface-text">
          {hadits.judul}
        </p>
      </div>
      <div className="px-4 py-4 space-y-3">
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
        <p className="text-ios-footnote text-surface-text leading-relaxed">
          &ldquo;{hadits.arti}&rdquo;
        </p>
        <p className="text-ios-caption text-surface-muted">
          <span className="font-medium">Sumber:</span> {hadits.sumber}
        </p>
      </div>
    </div>
  );
}
