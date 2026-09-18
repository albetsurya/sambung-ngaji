import { lazy, Suspense, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout, Header } from "../components/layout/AppLayout";
import {
  Calendar,
  Plus,
  ScrollText,
  Loader2,
} from "../components/common/FontAwesomeIcons";

/* -------------------------------------------------------------------------- */
/*                              Lazy Tabs                                     */
/* -------------------------------------------------------------------------- */

const CalendarTab = lazy(() =>
  import("../components/jadwal/CalendarTab").then((m) => ({
    default: m.CalendarTab,
  })),
);
const BulkCreateTab = lazy(() =>
  import("../components/jadwal/BulkCreateTab").then((m) => ({
    default: m.BulkCreateTab,
  })),
);
const ImportPdfTab = lazy(() =>
  import("../components/jadwal/ImportPdfTab").then((m) => ({
    default: m.ImportPdfTab,
  })),
);

const TABS = [
  { key: "kalender", label: "Kalender", Icon: Calendar },
  { key: "bulk", label: "Tambah Massal", Icon: Plus },
  { key: "import", label: "Import PDF", Icon: ScrollText },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function TabFallback() {
  return (
    <div className="py-12 flex flex-col items-center gap-3">
      <Loader2 size={20} className="animate-spin text-surface-muted" />
      <p className="text-ios-footnote text-surface-muted">Memuat...</p>
    </div>
  );
}

export default function JadwalPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab: TabKey =
    tabParam === "bulk" || tabParam === "import" ? tabParam : "kalender";
  const [tab, setTab] = useState<TabKey>(initialTab);

  return (
    <AppLayout hideNav>
      <Header
        title="Kelola Jadwal"
        onBack={() => navigate(-1)}
        backLabel="Kembali"
      />

      {/* Sticky tab bar */}
      <div
        className="sticky z-10 backdrop-blur-xl bg-surface-bg/80 border-b border-surface-border px-3 py-2"
        style={{ top: "calc(52px + var(--safe-top))" }}
      >
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((t) => {
            const Icon = t.Icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-3.5 h-9 rounded-xl text-ios-footnote font-medium whitespace-nowrap transition-all duration-200 active:scale-[0.97] ${
                  active
                    ? "bg-accent text-white shadow-sm shadow-accent/30"
                    : "bg-surface-card text-surface-muted border border-surface-border hover:bg-surface-card2"
                }`}
              >
                <Icon size={14} strokeWidth={active ? 2.5 : 2.2} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content — lazy */}
      <Suspense fallback={<TabFallback />}>
        <div key={tab}>
          {tab === "kalender" && <CalendarTab />}
          {tab === "bulk" && <BulkCreateTab />}
          {tab === "import" && <ImportPdfTab />}
        </div>
      </Suspense>
    </AppLayout>
  );
}
