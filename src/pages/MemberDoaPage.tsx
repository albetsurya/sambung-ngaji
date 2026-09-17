import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { DoaCard } from "../components/member/DoaCard";
import {
  DOA_KATEGORI,
  getDoaKategori,
  type DoaWaktu,
} from "../data/doa";

/* -------------------------------------------------------------------------- */
/*                              Main Component                                */
/* -------------------------------------------------------------------------- */

export default function MemberDoaPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const waktuParam = searchParams.get("waktu");
  const waktu: DoaWaktu = waktuParam === "sore" ? "sore" : "pagi";
  const kategori = getDoaKategori(waktu);

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
        {/* Tab switcher */}
        <div className="flex rounded-2xl bg-surface-card2 border border-surface-border overflow-hidden">
          {DOA_KATEGORI.map((k, idx) => {
            const active = k.key === waktu;
            const Icon = k.key === "pagi" ? Sun : Moon;
            return (
              <div key={k.key} className="flex-1 flex">
                {idx > 0 && <div className="w-px bg-surface-border" />}
                <button
                  onClick={() => switchWaktu(k.key)}
                  className={`flex-1 min-h-[52px] flex items-center justify-center gap-2 text-ios-footnote font-medium transition-all duration-200 ${
                    active
                      ? "bg-accent text-white"
                      : "text-surface-muted hover:bg-surface-card"
                  }`}
                >
                  <Icon size={16} />
                  {k.label}
                </button>
              </div>
            );
          })}
        </div>

        {/* Arab label */}
        <div className="text-center py-2">
          <p
            className="text-accent/80"
            style={{
              fontFamily:
                '"Noto Naskh Arabic", "Amiri", "Scheherazade New", serif',
              fontSize: "26px",
              lineHeight: 1.6,
            }}
          >
            {kategori.arabLabel}
          </p>
          <p className="text-ios-footnote text-surface-muted mt-1">
            {kategori.entries.length} doa — klik untuk membuka
          </p>
        </div>

        {/* List doa */}
        <div className="space-y-2.5">
          {kategori.entries.map((doa, i) => (
            <DoaCard key={doa.id} doa={doa} index={i} />
          ))}
        </div>

        {/* Info */}
        <div className="rounded-2xl border border-surface-border bg-surface-card2/40 p-3.5">
          <p className="text-ios-caption text-surface-muted leading-relaxed">
            Doa pagi dibaca setelah Subuh hingga terbit matahari. Doa sore
            dibaca setelah Ashar hingga terbenam matahari.
          </p>
          <p className="text-ios-caption text-surface-muted leading-relaxed mt-2">
            <span className="font-medium text-surface-text">Sumber:</span>{" "}
            Al-Quran & Kutubusittah — Shahih Bukhari, Shahih Muslim, Sunan Abu
            Dawud, Sunan at-Tirmidzi, Sunan an-Nasa&apos;i, dan Sunan Ibnu Majah.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
