import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useEventStore } from "../hooks/useEventStore";
import type { EventMission } from "../services/eventApi";

const TEAL = "#134E4A";
const EMERALD = "#0D9488";

function formatRewards(mission: EventMission): string {
  const parts: string[] = [];
  if (mission.reward_coins > 0) parts.push(`${mission.reward_coins} Koin`);
  if (mission.reward_tickets > 0) parts.push(`${mission.reward_tickets} Tiket`);
  if (mission.reward_hearts > 0) parts.push(`${mission.reward_hearts} Hati`);
  return parts.length > 0 ? `Hadiah: ${parts.join(" · ")}` : "Tanpa hadiah";
}

export function EventDetailModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const activeEvent = useEventStore((state) => state.activeEvent);
  const missions = useEventStore((state) => state.missions);
  const claimingId = useEventStore((state) => state.claimingId);
  const claimReward = useEventStore((state) => state.claimReward);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setError(null);
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [visible, onClose]);

  if (!visible) return null;

  const handleClaim = (missionId: string) => {
    setError(null);
    void claimReward(missionId).catch((reason: unknown) => {
      setError(
        reason instanceof Error ? reason.message : "Gagal mengklaim hadiah",
      );
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 px-4 py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={activeEvent?.name ?? "Detail Event"}
        className="max-h-[calc(100dvh-3rem)] w-full max-w-md overflow-y-auto rounded-2xl border-[3px] bg-white p-5"
        style={{ borderColor: TEAL, boxShadow: `8px 8px 0 0 ${TEAL}` }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div
              className="inline-block rounded-full border-2 bg-[#FFF8EE] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest"
              style={{ borderColor: TEAL, color: TEAL }}
            >
              Misi Event
            </div>
            <h2 className="mt-2 font-display text-lg font-black leading-tight text-[#5A3A2A]">
              {activeEvent?.name ?? "Event tidak tersedia"}
            </h2>
            {activeEvent?.description ? (
              <p className="mt-1 text-[11px] font-bold text-[#8C7A68]">
                {activeEvent.description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border-[3px] bg-[#FFF8EE] px-2.5 py-1 text-[11px] font-black text-[#5A3A2A]"
            style={{ borderColor: TEAL, boxShadow: `3px 3px 0 0 ${TEAL}` }}
          >
            Tutup
          </button>
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-3 rounded-lg border-[3px] border-[#B91C1C] bg-[#FEE2E2] px-3 py-2 text-[11px] font-bold text-[#7F1D1D]"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-4 space-y-2.5">
          {missions.length === 0 ? (
            <p className="rounded-xl border-[3px] border-dashed border-[#134E4A]/40 bg-[#FFF8EE] px-3 py-6 text-center text-[11px] font-bold text-[#8C7A68]">
              Belum ada misi pada event ini.
            </p>
          ) : (
            missions.map((mission) => (
              <div
                key={mission.id}
                className="rounded-xl border-[3px] bg-[#FFF8EE] p-3"
                style={{ borderColor: TEAL }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-black text-[#5A3A2A]">
                    {mission.title}
                  </p>
                  <span
                    className="shrink-0 rounded-full border-2 bg-white px-2 py-0.5 text-[10px] font-black"
                    style={{ borderColor: TEAL, color: TEAL }}
                  >
                    {Math.min(mission.progress, mission.target_amount)} /{" "}
                    {mission.target_amount}
                  </span>
                </div>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[#8C5A3A]">
                  {formatRewards(mission)}
                </p>

                <div className="mt-2">
                  {mission.is_claimed ? (
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-lg border-[3px] border-[#134E4A]/40 bg-[#E5E7EB] px-3 py-1.5 text-[11px] font-black text-[#6B7280]"
                    >
                      Sudah Diklaim
                    </button>
                  ) : mission.is_completed ? (
                    <button
                      type="button"
                      disabled={claimingId === mission.id}
                      onClick={() => handleClaim(mission.id)}
                      className="w-full rounded-lg border-[3px] px-3 py-1.5 text-[11px] font-black text-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-wait disabled:opacity-70"
                      style={{
                        borderColor: TEAL,
                        backgroundColor: EMERALD,
                        boxShadow: `3px 3px 0 0 ${TEAL}`,
                      }}
                    >
                      {claimingId === mission.id
                        ? "Memproses..."
                        : "Klaim Hadiah"}
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
