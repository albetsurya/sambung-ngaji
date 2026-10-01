import React, { useMemo } from "react";
import type { DueMember, DuePayment } from "../api/financeApi";
import { formatRp } from "../../../utils/format";
interface ShodaqohPrintContentProps {
  members: DueMember[];
  payments: DuePayment[];
  periodLabel: string;
  selectedMonth?: string;
  variant?: "shodaqoh" | "infak-ir";
}
export const ShodaqohPrintContent: React.FC<ShodaqohPrintContentProps> = ({
  members,
  payments,
  periodLabel,
  selectedMonth = "",
  variant = "shodaqoh",
}) => {
  const isInfakIr = variant === "infak-ir";
  const paymentMap = new Map<string, DuePayment>();
  payments.forEach((p) => {
    paymentMap.set(p.member_id, p);
  });
  const monthLabelShort = (m: string) => {
    const mm = /^(\d{4})-(\d{2})$/.exec(m);
    if (!mm) return m;
    return new Date(Number(mm[1]), Number(mm[2]) - 1, 1).toLocaleDateString(
      "id-ID",
      { month: "short", year: "2-digit" },
    );
  };
  const susulanMonths = useMemo(() => {
    const sumByMonth = new Map<string, number>();
    payments.forEach((p) => {
      (p.carryover_items || []).forEach((it) => {
        const amt = Number(it.amount) || 0;
        if (amt <= 0) return;
        if (selectedMonth && it.month > selectedMonth) return;
        sumByMonth.set(it.month, (sumByMonth.get(it.month) || 0) + amt);
      });
    });
    const sorted = Array.from(sumByMonth.entries())
      .filter(([, total]) => total > 0)
      .map(([month]) => month)
      .sort();
    return sorted.slice(-3);
  }, [payments, selectedMonth]);
  const hasSub = susulanMonths.length > 0;
  const rowSpan = hasSub ? 2 : 1;
  let sumIr = 0;
  const sumSusulanByMonth: Record<string, number> = {};
  susulanMonths.forEach((m) => {
    sumSusulanByMonth[m] = 0;
  });
  let sumSambung = 0;
  let sumJimpitan = 0;
  let sumSiar = 0;
  let sumSeribuan = 0;
  let sumKafan = 0;
  let sumUkhro = 0;
  let sumTotal = 0;
  const rows = useMemo(() => {
    return members.map((m, idx) => {
      const p = paymentMap.get(m.member_id);
      const ir = Number(p?.carryover_ir) || 0;
      const sambung = Number(p?.connecting_fund) || 0;
      const jimpitan = Number(p?.community_dues) || 0;
      const siar = Number(p?.outreach_fund) || 0;
      const seribuan = Number(p?.thousand_fund) || 0;
      const kafan = Number(p?.funeral_fund) || 0;
      const ukhro = Number(p?.ukhro_mt) || 0;
      const total =
        Number(p?.total_amount) ||
        ir + sambung + jimpitan + siar + seribuan + kafan + ukhro;
      const susulanMap: Record<string, number> = {};
      (p?.carryover_items || []).forEach((it) => {
        const amt = Number(it.amount) || 0;
        if (amt <= 0) return;
        if (selectedMonth && it.month > selectedMonth) return;
        susulanMap[it.month] = (susulanMap[it.month] || 0) + amt;
      });
      sumIr += ir;
      susulanMonths.forEach((mm) => {
        sumSusulanByMonth[mm] += susulanMap[mm] || 0;
      });
      sumSambung += sambung;
      sumJimpitan += jimpitan;
      sumSiar += siar;
      sumSeribuan += seribuan;
      sumKafan += kafan;
      sumUkhro += ukhro;
      sumTotal += total;
      return {
        idx,
        m,
        p,
        ir,
        susulanMap,
        sambung,
        jimpitan,
        siar,
        seribuan,
        kafan,
        ukhro,
        total,
      };
    });
  }, [members, payments, susulanMonths, selectedMonth]);
  return (
    <>
      <div className="text-center border-b-2 border-slate-800 pb-3 mb-4">
        <h1 className="text-[1.4em] font-bold uppercase tracking-wide leading-tight">
          {isInfakIr
            ? "REKAPITULASI INFAK IR BULANAN"
            : "REKAPITULASI PEMBAYARAN SHODAQOH & INFAQ BULANAN"}
        </h1>
        <p className="text-[1em] text-slate-700 mt-0.5 uppercase tracking-wider font-semibold">
          PERIODE: {periodLabel.toUpperCase()}
        </p>
      </div>
      <table className="w-full text-[0.9em] border-collapse border border-slate-400">
        <thead>
          <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400 text-center">
            <th
              rowSpan={rowSpan}
              className="border border-slate-400 p-1 w-6 align-middle"
            >
              NO
            </th>
            <th
              rowSpan={rowSpan}
              className="border border-slate-400 p-1 text-left min-w-[120px] align-middle"
            >
              NAMA ANGGOTA
            </th>
            {hasSub && (
              <th
                colSpan={susulanMonths.length}
                className="border border-slate-400 p-1 bg-amber-100 text-amber-900"
              >
                IR / INFAQ
              </th>
            )}
            {!isInfakIr && (
              <>
                <th
                  rowSpan={rowSpan}
                  className="border border-slate-400 p-1 min-w-[70px] align-middle whitespace-nowrap"
                >
                  SAMBUNG
                </th>
                <th
                  rowSpan={rowSpan}
                  className="border border-slate-400 p-1 min-w-[64px] align-middle whitespace-nowrap"
                >
                  JIMPITAN
                </th>
                <th
                  rowSpan={rowSpan}
                  className="border border-slate-400 p-1 min-w-[64px] align-middle whitespace-nowrap"
                >
                  SIAR-SIAR
                </th>
                <th
                  rowSpan={rowSpan}
                  className="border border-slate-400 p-1 min-w-[64px] align-middle whitespace-nowrap"
                >
                  SERIBUAN
                </th>
                <th
                  rowSpan={rowSpan}
                  className="border border-slate-400 p-1 min-w-[64px] align-middle whitespace-nowrap"
                >
                  KAFAN
                </th>
                <th
                  rowSpan={rowSpan}
                  className="border border-slate-400 p-1 min-w-[70px] align-middle whitespace-nowrap"
                >
                  UKHRO MT
                </th>
              </>
            )}
            <th
              rowSpan={rowSpan}
              className="border border-slate-400 p-1 min-w-[80px] align-middle whitespace-nowrap"
            >
              {isInfakIr ? "TOTAL IR" : "TOTAL"}
            </th>
          </tr>
          {hasSub && (
            <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400 text-center">
              {susulanMonths.map((m) => (
                <th
                  key={m}
                  className="border border-slate-400 p-1 min-w-[64px] bg-amber-50 text-amber-900 whitespace-nowrap"
                >
                  {monthLabelShort(m)}
                </th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.m.member_id} className="border-b border-slate-300">
              <td className="border border-slate-300 p-1 text-center tabular-nums">
                {r.idx + 1}
              </td>
              <td className="border border-slate-300 p-1 font-semibold">
                {r.m.member_name}
              </td>
              {susulanMonths.map((m) => {
                const v = r.susulanMap[m] || 0;
                return (
                  <td
                    key={m}
                    className="border border-slate-300 p-1 text-right  tabular-nums whitespace-nowrap"
                  >
                    {v > 0 ? formatRp(v) : "—"}
                  </td>
                );
              })}
              {!isInfakIr && (
                <>
                  <td className="border border-slate-300 p-1 text-right  tabular-nums whitespace-nowrap">
                    {r.sambung > 0 ? formatRp(r.sambung) : "—"}
                  </td>
                  <td className="border border-slate-300 p-1 text-right  tabular-nums whitespace-nowrap">
                    {r.jimpitan > 0 ? formatRp(r.jimpitan) : "—"}
                  </td>
                  <td className="border border-slate-300 p-1 text-right  tabular-nums whitespace-nowrap">
                    {r.siar > 0 ? formatRp(r.siar) : "—"}
                  </td>
                  <td className="border border-slate-300 p-1 text-right  tabular-nums whitespace-nowrap">
                    {r.seribuan > 0 ? formatRp(r.seribuan) : "—"}
                  </td>
                  <td className="border border-slate-300 p-1 text-right  tabular-nums whitespace-nowrap">
                    {r.kafan > 0 ? formatRp(r.kafan) : "—"}
                  </td>
                  <td className="border border-slate-300 p-1 text-right  tabular-nums whitespace-nowrap">
                    {r.ukhro > 0 ? formatRp(r.ukhro) : "—"}
                  </td>
                </>
              )}
              <td className="border border-slate-300 p-1 text-right  font-bold text-slate-900 tabular-nums whitespace-nowrap">
                {(isInfakIr ? r.ir : r.total) > 0
                  ? formatRp(isInfakIr ? r.ir : r.total)
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold bg-slate-100 border-t-2 border-slate-400">
            <td
              colSpan={2}
              className="border border-slate-400 p-1.5 text-right uppercase"
            >
              JUMLAH TOTAL
            </td>
            {susulanMonths.map((m) => (
              <td
                key={m}
                className="border border-slate-400 p-1 text-right  tabular-nums whitespace-nowrap"
              >
                {formatRp(sumSusulanByMonth[m] || 0)}
              </td>
            ))}
            {!isInfakIr && (
              <>
                <td className="border border-slate-400 p-1 text-right  tabular-nums whitespace-nowrap">
                  {formatRp(sumSambung)}
                </td>
                <td className="border border-slate-400 p-1 text-right  tabular-nums whitespace-nowrap">
                  {formatRp(sumJimpitan)}
                </td>
                <td className="border border-slate-400 p-1 text-right  tabular-nums whitespace-nowrap">
                  {formatRp(sumSiar)}
                </td>
                <td className="border border-slate-400 p-1 text-right  tabular-nums whitespace-nowrap">
                  {formatRp(sumSeribuan)}
                </td>
                <td className="border border-slate-400 p-1 text-right  tabular-nums whitespace-nowrap">
                  {formatRp(sumKafan)}
                </td>
                <td className="border border-slate-400 p-1 text-right  tabular-nums whitespace-nowrap">
                  {formatRp(sumUkhro)}
                </td>
              </>
            )}
            <td className="border border-slate-400 p-1 text-right  text-emerald-800 font-bold tabular-nums whitespace-nowrap">
              {formatRp(isInfakIr ? sumIr : sumTotal)}
            </td>
          </tr>
        </tfoot>
      </table>
      <div className="mt-8 flex justify-between text-center text-[1em]">
        <div>
          <p className="text-slate-600 mb-10">Penerima / Tim KU</p>
          <p className="font-bold underline uppercase">
            ( ........................................ )
          </p>
        </div>
        <div>
          <p className="text-slate-600 mb-10">Mengetahui, Pengurus Kelompok</p>
          <p className="font-bold underline uppercase">
            ( ........................................ )
          </p>
        </div>
      </div>
    </>
  );
};
export default ShodaqohPrintContent;
