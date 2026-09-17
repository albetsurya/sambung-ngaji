import { useSearchParams, useNavigate } from "react-router-dom";
import { Sun, Moon, CheckCircle2, RefreshCw } from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { DoaCard } from "../components/member/DoaCard";
import { useDoaProgress } from "../hooks/useDoaProgress";
import {
  DOA_KATEGORI,
  getDoaKategori,
  type DoaWaktu,
} from "../data/doa";

export default function MemberDoaPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const waktuParam = searchParams.get("waktu");
  const waktu: DoaWaktu = waktuParam === "sore" ? "sore" : "pagi";
  const kategori = getDoaKategori(waktu);
  const total = kategori.entries.length;

  const { readIds, toggle, reset, count, percentage } = useDoaProgress(
    waktu,
    total,
  );

  function switchWaktu(w: DoaWaktu) {
    setSearchParams({ waktu: w }, { replace: true });
  }

  return (
    <AppLayout hideNav showAiChat={false}>
      <Header
        title={kategori.label}
        subtitle={kategori.description}
        onBack={() => navigate("/member")}
        backLabel="Home"
        showSyncButton={false}
      />

      <div className="px-4 py-4 space-y-4 pb-8">
        <div className="flex rounded-2xl bg-surface-card2 border border-surface-border overflow-hidden">
          {DOA_KATEGORI.map((k, idx) => {
            const active = k.key === waktu;
            const Icon = k.key === "pagi" ? Sun : Moon;
            return (
              <div key={k.key} className="flex-1 flex">
                {idx > 0 && <div className="w-px bg-surface-border" />}
                <button
                  onClick={() => switchWaktu(k.key)}
                  className={
                    "flex-1 min-h-[52px] flex items-center justify-center gap-2 text-ios-footnote font-medium transition-all duration-200 " +
                    (active
                      ? "bg-accent text-white"
                      : "text-surface-muted hover:bg-surface-card")
                  }
                >
                  <Icon size={16} />
                  {k.label}
                </button>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-surface-border bg-surface-card px-4 py-3">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2
                size={14}
                className={count === total && total > 0 ? "text-success" : "text-accent"}
              />
              <span className="text-ios-footnote font-medium text-surface-text">
                Progress hari ini
              </span>
            </div>
            <span
              className={
                "text-ios-footnote font-semibold tabular-nums " +
                (count === total && total > 0 ? "text-success" : "text-accent")
              }
            >
              {count}/{total}
            </span>
          </div>

          <div className="h-1.5 rounded-full bg-surface-card2 overflow-hidden">
            <div
              className={
                "h-full transition-all duration-500 " +
                (count === total && total > 0 ? "bg-success" : "bg-accent")
              }
              style={{ width: percentage + "%" }}
            />
          </div>

          {count > 0 && (
            <div className="flex items-center justify-between mt-2">
              <p className="text-ios-caption text-surface-muted">
                {count === total
                  ? "Alhamdulillah, semua doa sudah dibaca"
                  : "Teruskan, tinggal " + (total - count) + " lagi"}
              </p>
              <button
                onClick={reset}
                className="flex items-center gap-1 text-ios-caption font-medium text-surface-muted transition-colors duration-200 hover:text-danger"
              >
                <RefreshCw size={11} />
                Reset
              </button>
            </div>
          )}
        </div>

        <div className="text-center py-3 border-b border-surface-border/60">
          <p
            className="text-accent/80 py-2"
            style={{
              fontFamily:
                '"Noto Naskh Arabic", "Amiri", "Scheherazade New", serif',
              fontSize: "26px",
              fontWeight: 400,
              lineHeight: 2,
              wordSpacing: "0.1em",
            }}
          >
            {kategori.arabLabel}
          </p>
          <p className="text-ios-footnote text-surface-muted mt-1">
            {kategori.entries.length} doa — klik untuk membuka
          </p>
        </div>

        <div className="space-y-2.5">
          {kategori.entries.map((doa, i) => (
            <DoaCard
              key={doa.id}
              doa={doa}
              index={i}
              isRead={readIds.has(doa.id)}
              onToggleRead={() => toggle(doa.id)}
            />
          ))}
        </div>

        <div className="rounded-2xl border border-surface-border bg-surface-card2/40 p-3.5">
          <p className="text-ios-caption text-surface-muted leading-relaxed">
            Doa pagi dibaca setelah Subuh hingga terbit matahari. Doa sore
            dibaca setelah Ashar hingga terbenam matahari.
          </p>
          <p className="text-ios-caption text-surface-muted leading-relaxed mt-2">
            <span className="font-medium text-surface-text">Sumber:</span>{" "}
            Al-Quran & Kutubusittah — Shahih Bukhari, Shahih Muslim, Sunan Abu
            Dawud, Sunan at-Tirmidzi, Sunan an-Nasa'i, dan Sunan Ibnu Majah.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
