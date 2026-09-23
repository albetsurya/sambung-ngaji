import { useNavigate } from "react-router-dom";
import { goBack } from "../utils/navigation";
import { RefreshCw } from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { Button } from "../components/common";
import { DZIKIR_PRESETS } from "../data/dzikir";
import { useDzikirCounters } from "../hooks/useDzikirCounters";

export default function MemberDzikirPage() {
  const navigate = useNavigate();
  const { getCount, resetAll, counts } = useDzikirCounters();

  const totalDzikir = Object.values(counts).reduce((a, b) => a + b, 0);
  const adaProgress = totalDzikir > 0;

  return (
    <AppLayout showAiChat={false}>
      <Header
        title="Dzikir"
        subtitle="Tasbih digital"
        onBack={() => goBack(navigate, "/member")}
        backLabel="Kembali"
        showSyncButton={false}
        right={
          adaProgress ? (
            <Button
              variant="ghost"
              size="xs"
              iconOnly
              onClick={() => {
                if (confirm("Reset semua dzikir hari ini?")) resetAll();
              }}
              aria-label="Reset semua"
              title="Reset semua"
              className="border border-surface-border hover:!bg-danger-soft hover:!text-danger hover:!border-danger/30"
            >
              <RefreshCw size={16} />
            </Button>
          ) : undefined
        }
      />

      <div className="px-4 py-4 space-y-4 pb-8">
        <div className="rounded-2xl border border-accent/15 bg-accent-soft/60 px-4 py-3.5">
          <p className="text-ios-footnote text-accent/90 leading-relaxed">
            Tap area besar untuk berdzikir. Jumlah tersimpan otomatis dan
            di-reset tiap ganti hari.
          </p>
        </div>

        <div className="space-y-2.5">
          {DZIKIR_PRESETS.map((d) => {
            const count = getCount(d.id);
            const target = d.target;
            const percentage = Math.min(100, Math.round((count / target) * 100));
            const done = count >= target;

            return (
              <button
                key={d.id}
                onClick={() => navigate("/member/dzikir/" + d.id)}
                className="w-full text-left rounded-2xl border border-surface-border bg-surface-card overflow-hidden transition-all duration-200 hover:bg-surface-card2 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-ios-body font-medium text-surface-text truncate">
                      {d.nama}
                    </p>
                    <p
                      className="text-surface-muted truncate mt-0.5"
                      style={{
                        fontFamily:
                          '"Noto Naskh Arabic", "Amiri", "Scheherazade New", serif',
                        fontSize: "18px",
                        fontWeight: 400,
                        lineHeight: 1.6,
                        direction: "rtl",
                        textAlign: "left",
                      }}
                    >
                      {d.arab}
                    </p>
                  </div>

                  <div className="flex flex-col items-end flex-shrink-0">
                    <span
                      className={
                        "text-ios-footnote font-bold tabular-nums " +
                        (done ? "text-success" : "text-accent")
                      }
                    >
                      {count}
                      <span className="text-surface-muted font-normal">
                        /{target}
                      </span>
                    </span>
                    {done && (
                      <span className="text-[10px] font-semibold text-success uppercase tracking-wide mt-0.5">
                        Selesai
                      </span>
                    )}
                  </div>
                </div>

                {count > 0 && (
                  <div className="h-1 bg-surface-card2">
                    <div
                      className={
                        "h-full transition-all duration-500 " +
                        (done ? "bg-success" : "bg-accent")
                      }
                      style={{ width: percentage + "%" }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {adaProgress && (
          <p className="text-center text-ios-caption text-surface-muted pt-2">
            Total hari ini: {totalDzikir} dzikir
          </p>
        )}
      </div>
    </AppLayout>
  );
}
