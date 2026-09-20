import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ScrollText,
  Sparkles,
  RefreshCw,
  Heart,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { MOOD_LIST, getMood, type Mood, type MoodKey } from "../data/mood";
import { useMoodPick } from "../hooks/useMoodPick";
import { moodApi } from "../services/domainApi";

export default function MemberMoodPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const moodParam = searchParams.get("mood") as MoodKey | null;
  const selected = moodParam ? getMood(moodParam) : null;

  return (
    <AppLayout hideNav showAiChat={false}>
      <Header
        title={selected ? "Untukmu" : "Tenangkan Hati"}
        subtitle={
          selected
            ? "Ayat & doa untuk hatimu"
            : "Pilih yang paling dekat dengan perasaanmu"
        }
        onBack={() => {
          if (selected) {
            setSearchParams({}, { replace: true });
          } else {
            navigate("/member");
          }
        }}
        backLabel={selected ? "Kembali" : "Home"}
        showSyncButton={false}
      />

      <div className="px-4 py-4 space-y-4 pb-8">
        {!selected && <MoodPicker onSelect={(k) => setSearchParams({ mood: k })} />}
        {selected && <MoodResult mood={selected} />}
      </div>
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Mood Picker                                   */
/* -------------------------------------------------------------------------- */

function MoodPicker({ onSelect }: { onSelect: (k: MoodKey) => void }) {
  const [selected, setSelected] = useState<MoodKey | null>(null);

  return (
    <>
      <div className="rounded-2xl border border-accent/15 bg-accent-soft/60 px-4 py-3.5">
        <p className="text-ios-footnote text-accent/90 leading-relaxed">
          Tidak ada perasaan yang salah. Pilih yang paling dekat, kami akan
          temani dengan ayat & doa yang menenangkan.
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

      <button
        onClick={() => {
          if (selected) {
            // Best-effort sync mood harian ke backend (upsert per hari). Gagal tidak memblok UX.
            moodApi.save(selected).catch(() => {});
            onSelect(selected);
          }
        }}
        disabled={!selected}
        className="w-full min-h-[52px] rounded-2xl bg-accent text-white text-ios-body font-semibold transition-all duration-200 hover:bg-accent-dark active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Sparkles size={16} />
        {selected ? "Tampilkan untuk saya" : "Pilih mood dulu"}
      </button>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Mood Result                                   */
/* -------------------------------------------------------------------------- */

function MoodResult({ mood }: { mood: Mood }) {
  const navigate = useNavigate();
  const pick = useMoodPick(mood);

  return (
    <>
      {/* Hero */}
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

      {/* Ayat */}
      <section className="space-y-2.5">
        <p className="text-ios-footnote font-semibold text-surface-text px-1 flex items-center gap-1.5">
          <ScrollText size={13} className="text-accent" />
          Ayat untukmu
        </p>

        <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden">
          <div className="px-4 py-2.5 border-b border-surface-border flex items-center justify-between gap-2">
            <span className="text-ios-caption font-medium text-surface-text">
              {pick.ayat.surahNama} : {pick.ayat.ayat}
            </span>
            <button
              onClick={() => navigate("/member/quran/" + pick.ayat.surah)}
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
              {pick.ayat.teksArab}
            </p>
            <p className="text-ios-footnote text-surface-text leading-relaxed">
              &ldquo;{pick.ayat.teksIndonesia}&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Doa */}
      <section className="space-y-2.5">
        <p className="text-ios-footnote font-semibold text-surface-text px-1 flex items-center gap-1.5">
          <Sparkles size={13} className="text-accent" />
          Doa yang bisa dibaca
        </p>

        <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden">
          <div className="px-4 py-2.5 border-b border-surface-border">
            <p className="text-ios-caption font-medium text-surface-text">
              {pick.doa.judul}
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
              {pick.doa.arab}
            </p>
            <p className="text-ios-footnote italic text-surface-muted leading-relaxed">
              {pick.doa.latin}
            </p>
            <div className="rounded-xl bg-accent-soft/50 border border-accent/10 px-3.5 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-accent/80 mb-1">
                Artinya
              </p>
              <p className="text-ios-footnote text-surface-text leading-relaxed">
                {pick.doa.arti}
              </p>
            </div>
            {pick.doa.sumber && (
              <p className="text-ios-caption text-surface-muted">
                <span className="font-medium">Sumber:</span> {pick.doa.sumber}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Nasehat & Hikmah */}
      <section className="space-y-2.5">
        <p className="text-ios-footnote font-semibold text-surface-text px-1 flex items-center gap-1.5">
          <Heart size={13} className="text-success" />
          Nasehat & Hikmah
        </p>

        <div className="rounded-2xl border border-success/20 bg-success-soft/60 px-4 py-4">
          <p className="text-ios-footnote text-surface-text leading-relaxed">
            {mood.nasehat}
          </p>
        </div>
      </section>

      {/* Aksi */}
      <div className="flex flex-col gap-2 pt-2">
        <button
          onClick={() => navigate("/member/dzikir")}
          className="min-h-[48px] rounded-2xl border border-accent/25 bg-accent-soft text-accent text-ios-footnote font-medium transition-all duration-200 hover:bg-accent-soft/80 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <RefreshCw size={14} />
          Lanjutkan dengan dzikir
        </button>
        <button
          onClick={() => navigate("/member/quran")}
          className="min-h-[48px] rounded-2xl border border-surface-border bg-surface-card text-surface-text text-ios-footnote font-medium transition-all duration-200 hover:bg-surface-card2 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <ScrollText size={14} />
          Baca Al-Quran
        </button>
      </div>

      {/* Info refresh */}
      <p className="text-ios-caption text-surface-muted text-center pt-1">
        Ayat & doa berganti tiap hari. Buka lagi besok untuk pilihan baru.
      </p>
    </>
  );
}

/* Suppress unused */
void ChevronLeft;
