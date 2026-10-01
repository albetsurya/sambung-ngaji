import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Check,
  RefreshCw,
  ChevronLeft,
} from "../components/ui/FontAwesomeIcons";
import { AppLayout } from "../components/layout/AppLayout";
import { Button } from "../components/ui";
import { getDzikirPreset } from "../features/doa-dzikir/data/dzikir";
import { useDzikirCounters, vibrate } from "../features/doa-dzikir/hooks/useDzikirCounters";
import { useToast } from "../contexts/ToastContext";

export default function MemberDzikirCounterPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const { getCount, increment, reset } = useDzikirCounters();

  const preset = useMemo(() => (id ? getDzikirPreset(id) : undefined), [id]);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!preset) navigate("/member/dzikir", { replace: true });
  }, [preset, navigate]);

  if (!preset) return null;

  const count = getCount(preset.id);
  const target = preset.target;
  const percentage = Math.min(100, (count / target) * 100);
  const done = count >= target;

  function handleTap() {
    vibrate(30);
    increment(preset!.id);

    if (count + 1 === target) {
      vibrate([80, 60, 80]);
    }

    setPressed(true);
    window.setTimeout(() => setPressed(false), 100);
  }

  function handleReset() {
    if (!confirm("Reset hitungan dzikir ini?")) return;
    vibrate(50);
    reset(preset!.id);
    showToast("Hitungan direset");
  }

  const circleSize = 260;
  const strokeWidth = 10;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - percentage / 100);

  return (
    <AppLayout hideNav showAiChat={false}>
      
      <header className="sticky top-0 z-30 pt-safe border-b border-surface-border backdrop-blur-xl bg-surface-bg/80">
        <div className="grid grid-cols-[auto_1fr_auto] items-center h-[52px] px-3 gap-2">
          <Button
            onClick={() => navigate("/member/dzikir")}
            aria-label="Kembali"
            variant="ghost"
            size="sm"
            iconOnly
          >
            <ChevronLeft size={24} strokeWidth={2.2} />
          </Button>

          <div className="flex flex-col items-center min-w-0">
            <h1 className="text-ios-nav font-semibold text-surface-text truncate">
              {preset.nama}
            </h1>
            <p className="text-ios-caption text-surface-muted truncate">
              Tap untuk berdzikir
            </p>
          </div>

          <Button
            onClick={handleReset}
            aria-label="Reset"
            title="Reset hitungan"
            variant="softDanger"
            size="xs"
            iconOnly
          >
            <RefreshCw size={16} />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 min-h-[calc(100vh-52px)]">
        
        <div className="w-full max-w-md mb-8 text-center">
          <p
            className="text-surface-text mb-3"
            style={{
              fontFamily:
                '"Noto Naskh Arabic", "Amiri", "Scheherazade New", serif',
              fontSize: "28px",
              fontWeight: 400,
              lineHeight: 2,
              wordSpacing: "0.1em",
            }}
          >
            {preset.arab}
          </p>
          <p className="text-ios-footnote italic text-surface-muted">
            {preset.latin}
          </p>
          <p className="text-ios-caption text-surface-muted mt-1.5 max-w-xs mx-auto leading-relaxed">
            {preset.arti}
          </p>
        </div>

        
        <button
          onClick={handleTap}
          aria-label="Tambah hitungan"
          className="relative w-[260px] h-[260px] flex items-center justify-center select-none transition-transform duration-100 active:scale-[0.96]"
          style={{ transform: pressed ? "scale(0.96)" : undefined }}
        >
          
          <svg
            width={circleSize}
            height={circleSize}
            className="absolute inset-0 -rotate-90"
            aria-hidden="true"
          >
            <circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              fill="none"
              stroke="rgb(var(--c-surface-card2))"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              fill="none"
              stroke={done ? "rgb(var(--c-success))" : "rgb(var(--c-accent))"}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 300ms ease-out" }}
            />
          </svg>

          
          <div
            className={
              "absolute inset-6 rounded-full flex flex-col items-center justify-center transition-colors duration-300 " +
              (done ? "bg-success-soft" : "bg-accent-soft")
            }
          >
            <span
              className={
                "text-[64px] font-bold tabular-nums leading-none tracking-[-0.03em] " +
                (done ? "text-success" : "text-accent")
              }
            >
              {count}
            </span>
            <span className="text-ios-caption text-surface-muted mt-1">
              dari {target}
            </span>

            {done && (
              <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-success">
                <Check size={12} strokeWidth={3} />
                Selesai
              </span>
            )}
          </div>
        </button>

        
        {preset.keutamaan && (
          <div className="mt-8 max-w-md w-full rounded-2xl bg-success-soft border border-success/20 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-success mb-1">
              Keutamaan
            </p>
            <p className="text-ios-caption text-success/90 leading-relaxed">
              {preset.keutamaan}
            </p>
          </div>
        )}

        {done && (
          <Button
            onClick={() => navigate("/member/dzikir")}
            variant="primary"
            size="sm"
            className="mt-6"
          >
            Pilih Dzikir Lain
          </Button>
        )}
      </div>
    </AppLayout>
  );
}
