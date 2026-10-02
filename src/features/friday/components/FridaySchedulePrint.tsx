import { forwardRef } from "react";
import type { FridaySchedule } from "../../../types";
import { FRIDAY_ROLES } from "../utils/friday";
import { formatDateLongText } from "../../../utils/format";


function shortDay(tanggal: string): string {
  const d = new Date(tanggal + "T00:00:00");
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(d);
}

export const FridaySchedulePrint = forwardRef<
  HTMLDivElement,
  { schedules: FridaySchedule[]; title?: string }
>(function FridaySchedulePrint({ schedules, title }, ref) {
  const generated = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
  const period =
    schedules.length > 0
      ? `${formatDateLongText(schedules[0].tanggal)} - ${formatDateLongText(
          schedules[schedules.length - 1].tanggal,
        )}`
      : "";

  return (
    <div
      ref={ref}
      className="bg-white text-slate-900 rounded-2xl border border-slate-200 overflow-hidden mx-auto"
      style={{ width: 900 }}
    >
      
      <div className="bg-emerald-800 px-8 pt-7 pb-6">
        <p
          className="text-[11px] font-bold uppercase text-emerald-200"
          style={{ letterSpacing: "0.28em" }}
        >
          Sambung Ngaji
        </p>
        <h2 className="text-[26px] leading-tight font-bold text-white mt-1">
          {title || "Jadwal Petugas Sholat Jumat"}
        </h2>
        {period && (
          <p className="text-[13px] text-emerald-100 mt-1 tabular-nums">
            {period}
          </p>
        )}
      </div>
      <div className="h-1 bg-amber-400" />

      
      <div className="p-6">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th
                className="text-[10px] font-bold uppercase text-white bg-emerald-700 px-3 py-2.5 first:rounded-l-lg"
                style={{ letterSpacing: "0.08em" }}
              >
                Tanggal
              </th>
              {FRIDAY_ROLES.map((r) => (
                <th
                  key={r.key}
                  className="text-[10px] font-bold uppercase text-white bg-emerald-700 px-3 py-2.5 last:rounded-r-lg"
                  style={{ letterSpacing: "0.08em" }}
                >
                  {r.short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedules.map((s, i) => (
              <tr key={s.tanggal} className={i % 2 === 1 ? "bg-slate-50" : ""}>
                <td className="px-3 py-2.5 border-b border-slate-100 align-top">
                  <p className="text-[13px] font-bold tabular-nums whitespace-nowrap">
                    {formatDateLongText(s.tanggal)}
                  </p>
                  <p className="text-[11px] text-slate-400 capitalize">
                    {shortDay(s.tanggal)}
                  </p>
                </td>
                {FRIDAY_ROLES.map((r) => (
                  <td
                    key={r.key}
                    className="px-3 py-2.5 border-b border-slate-100 align-top text-[13px] font-medium leading-snug"
                  >
                    {(s[r.key] || "").trim() || (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {schedules.length === 0 && (
              <tr>
                <td
                  colSpan={FRIDAY_ROLES.length + 1}
                  className="px-3 py-8 text-center text-[13px] text-slate-400"
                >
                  Belum ada jadwal.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        
        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400">
            {schedules.length} jadwal petugas
          </p>
          <p className="text-[11px] text-slate-400">
            Dibuat dari aplikasi Sambung Ngaji · {generated}
          </p>
        </div>
      </div>
    </div>
  );
});
