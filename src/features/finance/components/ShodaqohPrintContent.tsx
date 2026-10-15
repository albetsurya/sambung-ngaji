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
  const headerRowSpan = hasSub ? 2 : 1;
  const variableColumnCount = susulanMonths.length + (isInfakIr ? 0 : 6);
  const nameColumnWidth = isInfakIr
    ? hasSub
      ? 30
      : 80
    : hasSub
      ? 22
      : 27;
  const totalColumnWidth = isInfakIr ? 8 : hasSub ? 9 : 12;
  const noColumnWidth = 5;
  const variableColumnWidth = variableColumnCount
    ? (100 - noColumnWidth - nameColumnWidth - totalColumnWidth) /
      variableColumnCount
    : 0;
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
  // Total diturunkan murni dari rows (tanpa efek samping di dalam useMemo)
  // agar tidak me-reset ke 0 saat memo ter-cache / render ganda StrictMode.
  const totals = useMemo(() => {
    const t = {
      ir: 0,
      sambung: 0,
      jimpitan: 0,
      siar: 0,
      seribuan: 0,
      kafan: 0,
      ukhro: 0,
      total: 0,
      susulan: {} as Record<string, number>,
    };
    susulanMonths.forEach((mm) => {
      t.susulan[mm] = 0;
    });
    rows.forEach((r) => {
      t.ir += r.ir;
      susulanMonths.forEach((mm) => {
        t.susulan[mm] += r.susulanMap[mm] || 0;
      });
      t.sambung += r.sambung;
      t.jimpitan += r.jimpitan;
      t.siar += r.siar;
      t.seribuan += r.seribuan;
      t.kafan += r.kafan;
      t.ukhro += r.ukhro;
      t.total += r.total;
    });
    return t;
  }, [rows, susulanMonths]);
  return (
    <>
      <div className="print-shodaqoh-header text-center border-b-2 border-slate-800 pb-3 mb-4">
        <h1 className="text-[1.4em] font-bold uppercase tracking-wide leading-tight">
          {isInfakIr
            ? "REKAPITULASI INFAK IR BULANAN"
            : "REKAPITULASI PEMBAYARAN SHODAQOH & INFAQ BULANAN"}
        </h1>
        <p className="text-[1em] text-slate-700 mt-0.5 uppercase tracking-wider font-semibold">
          PERIODE: {periodLabel.toUpperCase()}
        </p>
      </div>
      <table className="print-shodaqoh-table w-full text-[0.9em] border-collapse border border-slate-400">
        <colgroup>
          <col style={{ width: `${noColumnWidth}%` }} />
          <col style={{ width: `${nameColumnWidth}%` }} />
          {hasSub &&
            susulanMonths.map((month) => (
              <col
                key={`sub-col-${month}`}
                style={{ width: `${variableColumnWidth}%` }}
              />
            ))}
          {!isInfakIr &&
            ["sambung", "jimpitan", "siar", "seribuan", "kafan", "ukhro"].map(
              (column) => (
                <col
                  key={`main-col-${column}`}
                  style={{ width: `${variableColumnWidth}%` }}
                />
              ),
            )}
          <col style={{ width: `${totalColumnWidth}%` }} />
        </colgroup>
        <thead>
          <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400 text-center">
            <th
              rowSpan={headerRowSpan}
              className="print-shodaqoh-merged-header border border-slate-400 p-1 w-6 align-middle whitespace-nowrap"
            >
              <span className="print-shodaqoh-header-label">NO</span>
            </th>
            <th
              rowSpan={headerRowSpan}
              className="print-shodaqoh-merged-header border border-slate-400 p-1 text-left min-w-[120px] align-middle whitespace-nowrap"
            >
              <span className="print-shodaqoh-header-label">
                NAMA ANGGOTA
              </span>
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
                  rowSpan={headerRowSpan}
                  className="print-shodaqoh-merged-header border border-slate-400 p-1 min-w-[70px] align-middle whitespace-nowrap"
                >
                  <span className="print-shodaqoh-header-label">SAMBUNG</span>
                </th>
                <th
                  rowSpan={headerRowSpan}
                  className="print-shodaqoh-merged-header border border-slate-400 p-1 min-w-[64px] align-middle whitespace-nowrap"
                >
                  <span className="print-shodaqoh-header-label">JIMPITAN</span>
                </th>
                <th
                  rowSpan={headerRowSpan}
                  className="print-shodaqoh-merged-header border border-slate-400 p-1 min-w-[64px] align-middle whitespace-nowrap"
                >
                  <span className="print-shodaqoh-header-label">SIAR-SIAR</span>
                </th>
                <th
                  rowSpan={headerRowSpan}
                  className="print-shodaqoh-merged-header border border-slate-400 p-1 min-w-[64px] align-middle whitespace-nowrap"
                >
                  <span className="print-shodaqoh-header-label">SERIBUAN</span>
                </th>
                <th
                  rowSpan={headerRowSpan}
                  className="print-shodaqoh-merged-header border border-slate-400 p-1 min-w-[64px] align-middle whitespace-nowrap"
                >
                  <span className="print-shodaqoh-header-label">KAFAN</span>
                </th>
                <th
                  rowSpan={headerRowSpan}
                  className="print-shodaqoh-merged-header border border-slate-400 p-1 min-w-[70px] align-middle whitespace-nowrap"
                >
                  <span className="print-shodaqoh-header-label">UKHRO MT</span>
                </th>
              </>
            )}
            <th
              rowSpan={headerRowSpan}
              className="print-shodaqoh-merged-header border border-slate-400 p-1 min-w-[80px] align-middle whitespace-nowrap"
            >
              <span className="print-shodaqoh-header-label">
                {isInfakIr ? "TOTAL IR" : "TOTAL"}
              </span>
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
                    {v > 0 ? formatRp(v) : "-"}
                  </td>
                );
              })}
              {!isInfakIr && (
                <>
                  <td className="border border-slate-300 p-1 text-right  tabular-nums whitespace-nowrap">
                    {r.sambung > 0 ? formatRp(r.sambung) : "-"}
                  </td>
                  <td className="border border-slate-300 p-1 text-right  tabular-nums whitespace-nowrap">
                    {r.jimpitan > 0 ? formatRp(r.jimpitan) : "-"}
                  </td>
                  <td className="border border-slate-300 p-1 text-right  tabular-nums whitespace-nowrap">
                    {r.siar > 0 ? formatRp(r.siar) : "-"}
                  </td>
                  <td className="border border-slate-300 p-1 text-right  tabular-nums whitespace-nowrap">
                    {r.seribuan > 0 ? formatRp(r.seribuan) : "-"}
                  </td>
                  <td className="border border-slate-300 p-1 text-right  tabular-nums whitespace-nowrap">
                    {r.kafan > 0 ? formatRp(r.kafan) : "-"}
                  </td>
                  <td className="border border-slate-300 p-1 text-right  tabular-nums whitespace-nowrap">
                    {r.ukhro > 0 ? formatRp(r.ukhro) : "-"}
                  </td>
                </>
              )}
              <td className="border border-slate-300 p-1 text-right  font-bold text-slate-900 tabular-nums whitespace-nowrap">
                {(isInfakIr ? r.ir : r.total) > 0
                  ? formatRp(isInfakIr ? r.ir : r.total)
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="print-shodaqoh-total-row font-bold bg-slate-100 border-t-2 border-slate-400">
            <td
              colSpan={2}
              className="print-shodaqoh-total-cell border border-slate-400 p-1.5 text-right uppercase"
            >
              JUMLAH TOTAL
            </td>
            {susulanMonths.map((m) => (
              <td
                key={m}
                className="print-shodaqoh-total-cell border border-slate-400 p-1 text-right  tabular-nums whitespace-nowrap"
              >
                {formatRp(totals.susulan[m] || 0)}
              </td>
            ))}
            {!isInfakIr && (
              <>
                <td className="print-shodaqoh-total-cell border border-slate-400 p-1 text-right  tabular-nums whitespace-nowrap">
                  {formatRp(totals.sambung)}
                </td>
                <td className="print-shodaqoh-total-cell border border-slate-400 p-1 text-right  tabular-nums whitespace-nowrap">
                  {formatRp(totals.jimpitan)}
                </td>
                <td className="print-shodaqoh-total-cell border border-slate-400 p-1 text-right  tabular-nums whitespace-nowrap">
                  {formatRp(totals.siar)}
                </td>
                <td className="print-shodaqoh-total-cell border border-slate-400 p-1 text-right  tabular-nums whitespace-nowrap">
                  {formatRp(totals.seribuan)}
                </td>
                <td className="print-shodaqoh-total-cell border border-slate-400 p-1 text-right  tabular-nums whitespace-nowrap">
                  {formatRp(totals.kafan)}
                </td>
                <td className="print-shodaqoh-total-cell border border-slate-400 p-1 text-right  tabular-nums whitespace-nowrap">
                  {formatRp(totals.ukhro)}
                </td>
              </>
            )}
            <td className="print-shodaqoh-total-cell border border-slate-400 p-1 text-right  text-emerald-800 font-bold tabular-nums whitespace-nowrap">
              {formatRp(isInfakIr ? totals.ir : totals.total)}
            </td>
          </tr>
        </tfoot>
      </table>
      <div className="print-shodaqoh-signature mt-8 flex justify-between text-center text-[1em]">
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
