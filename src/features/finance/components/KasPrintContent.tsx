import React, { useMemo } from "react";
import type { Transaction } from "../api/financeApi";
import { formatRp, toTitleCase } from "../../../utils/format";
interface KasPrintContentProps {
  transactions: Transaction[];
  initial_balance: number;
  ending_balance: number;
  period_label: string;
  cash_type_label: string;
  mode: "rincian" | "rekap";
  group_name?: string;
  month_key?: string;
}
function formatDateDMY(input?: string | null): string {
  if (!input) return "-";
  const s = String(input).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}
export const KasPrintContent: React.FC<KasPrintContentProps> = ({
  transactions,
  initial_balance,
  ending_balance,
  period_label,
  cash_type_label,
  mode,
  group_name,
  month_key,
}) => {
  const penerimaanGrouped: Record<string, number> = {};
  const pengeluaranGrouped: Record<string, number> = {};
  let totalDebit = 0;
  let totalCredit = 0;
  transactions.forEach((t) => {
    const isSaldoAwal =
      String(t.account_name || "")
        .trim()
        .toUpperCase() === "SALDO AWAL";
    const deb = Number(t.debit) || 0;
    const kre = Number(t.credit) || 0;
    if (!isSaldoAwal && deb > 0) {
      const key = (t.account_name || t.description || "LAINNYA")
        .trim()
        .toUpperCase();
      penerimaanGrouped[key] = (penerimaanGrouped[key] || 0) + deb;
      totalDebit += deb;
    }
    if (!isSaldoAwal && kre > 0) {
      const key = (t.account_name || t.description || "LAINNYA")
        .trim()
        .toUpperCase();
      pengeluaranGrouped[key] = (pengeluaranGrouped[key] || 0) + kre;
      totalCredit += kre;
    }
  });
  const rows = useMemo(() => {
    return transactions.map((t, idx) => ({
      idx,
      t,
      isSaldoAwal:
        String(t.account_name || "")
          .trim()
          .toUpperCase() === "SALDO AWAL",
      deb: Number(t.debit) || 0,
      kre: Number(t.credit) || 0,
      saldo: Number(t.balance) || 0,
      date: formatDateDMY(t.transaction_date),
    }));
  }, [transactions]);
  const printTitle =
    mode === "rekap" ? "Laporan Rekapitulasi Kas" : "Rincian Transaksi Kas";
  // ponytail: header gaya buku kas (KELOMPOK / BULAN / TAHUN) untuk mode rekap.
  const monthName = (() => {
    const m = /^(\d{4})-(\d{2})$/.exec(month_key || "");
    if (!m) return period_label.toUpperCase();
    try {
      return new Date(Number(m[1]), Number(m[2]) - 1, 1)
        .toLocaleDateString("id-ID", { month: "long" })
        .toUpperCase();
    } catch {
      return period_label.toUpperCase();
    }
  })();
  const yearName = (() => {
    const m = /^(\d{4})-(\d{2})$/.exec(month_key || "");
    return m ? m[1] : "";
  })();
  const netMonth = totalDebit - totalCredit;
  return (
    <>
      {mode === "rekap" ? (
        <div className="text-center pb-4 mb-6">
          <p className="text-xs font-semibold tracking-wide uppercase underline underline-offset-4">
            KELOMPOK: {group_name ? group_name.toUpperCase() : "............"}
          </p>
          <h1 className="text-xl font-bold tracking-wide uppercase underline underline-offset-4 mt-1">
            LAPORAN KAS
          </h1>
          <p className="text-xs font-semibold tracking-wide uppercase underline underline-offset-4 mt-1">
            BULAN: {monthName}
            {yearName ? ` TAHUN: ${yearName}` : ""}
          </p>
        </div>
      ) : (
        <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
          <h1 className="text-xl font-bold tracking-wide uppercase">
            LAPORAN TRANSAKSI KAS
          </h1>
          <h2 className="text-md font-semibold text-slate-700 uppercase mt-1">
            {cash_type_label.toUpperCase()}
          </h2>
          <p className="text-xs text-slate-600 mt-1 uppercase tracking-wider">
            PERIODE: {period_label.toUpperCase()}
          </p>
        </div>
      )}
      {mode === "rincian" ? (
        <table className="w-full text-xs border-collapse border border-slate-400">
          <thead>
            <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
              <th className="border border-slate-400 p-2 text-center w-10">
                NO
              </th>
              <th className="border border-slate-400 p-2 text-center w-24">
                TANGGAL
              </th>
              <th className="border border-slate-400 p-2 text-left">
                KETERANGAN
              </th>
              <th className="border border-slate-400 p-2 text-right w-28">
                DEBET
              </th>
              <th className="border border-slate-400 p-2 text-right w-28">
                KREDIT
              </th>
              <th className="border border-slate-400 p-2 text-right w-28">
                SALDO
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.idx} className="border-b border-slate-300">
                <td className="border border-slate-300 p-1.5 text-center">
                  {r.idx + 1}
                </td>
                <td className="border border-slate-300 p-1.5 whitespace-nowrap">
                  {r.date}
                </td>
                <td className="border border-slate-300 p-1.5">
                  {r.t.description}
                </td>
                <td className="border border-slate-300 p-1.5 text-right ">
                  {r.deb > 0 ? formatRp(r.deb) : "-"}
                </td>
                <td className="border border-slate-300 p-1.5 text-right ">
                  {r.kre > 0 ? formatRp(r.kre) : "-"}
                </td>
                <td className="border border-slate-300 p-1.5 text-right  font-semibold">
                  {formatRp(r.saldo)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-slate-100 border-t-2 border-slate-400">
              <td
                colSpan={3}
                className="border border-slate-400 p-2 text-right"
              >
                TOTAL TRANSAKSI
              </td>
              <td className="border border-slate-400 p-2 text-right  text-emerald-800">
                {formatRp(
                  rows.reduce((sum, r) => sum + (Number(r.t.debit) || 0), 0),
                )}
              </td>
              <td className="border border-slate-400 p-2 text-right  text-rose-800">
                {formatRp(
                  rows.reduce((sum, r) => sum + (Number(r.t.credit) || 0), 0),
                )}
              </td>
              <td className="border border-slate-400 p-2 text-right ">
                {formatRp(rows[rows.length - 1]?.saldo ?? 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      ) : (
        <table className="w-full text-xs border-collapse border border-slate-400">
          <thead>
            <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
              <th className="border border-slate-400 p-2 text-center w-20">
                Tgl
              </th>
              <th className="border border-slate-400 p-2 text-left">
                Keterangan
              </th>
              <th className="border border-slate-400 p-2 text-right w-28">
                Debet
              </th>
              <th className="border border-slate-400 p-2 text-right w-28">
                Kredit
              </th>
              <th className="border border-slate-400 p-2 text-right w-28">
                Saldo
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-300">
              <td className="border border-slate-300 p-1.5" />
              <td className="border border-slate-300 p-1.5 font-semibold">
                Saldo awal
              </td>
              <td className="border border-slate-300 p-1.5" />
              <td className="border border-slate-300 p-1.5" />
              <td className="border border-slate-300 p-1.5 text-right font-semibold">
                {formatRp(initial_balance)}
              </td>
            </tr>
            <tr className="font-bold bg-emerald-100/70">
              <td className="border border-slate-300 p-1.5" />
              <td className="border border-slate-300 p-1.5">Penerimaan</td>
              <td className="border border-slate-300 p-1.5" />
              <td className="border border-slate-300 p-1.5" />
              <td className="border border-slate-300 p-1.5" />
            </tr>
            {Object.entries(penerimaanGrouped).map(([acc, val]) => (
              <tr key={`in-${acc}`} className="border-b border-slate-200">
                <td className="border border-slate-300 p-1.5" />
                <td className="border border-slate-300 p-1.5">
                  {toTitleCase(acc)}
                </td>
                <td className="border border-slate-300 p-1.5 text-right bg-emerald-50">
                  {formatRp(val)}
                </td>
                <td className="border border-slate-300 p-1.5" />
                <td className="border border-slate-300 p-1.5" />
              </tr>
            ))}
            <tr className="font-bold bg-rose-100/70">
              <td className="border border-slate-300 p-1.5" />
              <td className="border border-slate-300 p-1.5">Pengeluaran</td>
              <td className="border border-slate-300 p-1.5" />
              <td className="border border-slate-300 p-1.5" />
              <td className="border border-slate-300 p-1.5" />
            </tr>
            {Object.entries(pengeluaranGrouped).map(([acc, val]) => (
              <tr key={`out-${acc}`} className="border-b border-slate-200">
                <td className="border border-slate-300 p-1.5" />
                <td className="border border-slate-300 p-1.5">
                  {toTitleCase(acc)}
                </td>
                <td className="border border-slate-300 p-1.5" />
                <td className="border border-slate-300 p-1.5 text-right bg-rose-50">
                  {formatRp(val)}
                </td>
                <td className="border border-slate-300 p-1.5" />
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold bg-slate-100 border-t-2 border-slate-400">
              <td className="border border-slate-400 p-2" />
              <td className="border border-slate-400 p-2">Jumlah</td>
              <td className="border border-slate-400 p-2 text-right bg-emerald-50">
                {formatRp(totalDebit)}
              </td>
              <td className="border border-slate-400 p-2 text-right bg-rose-50">
                {formatRp(totalCredit)}
              </td>
              <td className="border border-slate-400 p-2" />
            </tr>
            <tr
              className={`font-bold border-t border-slate-400 ${netMonth >= 0 ? "bg-emerald-50" : "bg-rose-50"}`}
            >
              <td className="border border-slate-400 p-2" />
              <td className="border border-slate-400 p-2">Saldo bulan</td>
              <td className="border border-slate-400 p-2" />
              <td className="border border-slate-400 p-2" />
              <td className="border border-slate-400 p-2 text-right">
                {formatRp(netMonth)}
              </td>
            </tr>
            <tr className="font-bold bg-slate-100 border-t border-slate-400">
              <td className="border border-slate-400 p-2" />
              <td className="border border-slate-400 p-2">Saldo akhir</td>
              <td className="border border-slate-400 p-2" />
              <td className="border border-slate-400 p-2" />
              <td className="border border-slate-400 p-2 text-right">
                {formatRp(ending_balance)}
              </td>
            </tr>
          </tfoot>
        </table>
      )}
      <div className="mt-12 flex justify-between text-center text-xs">
        <div>
          <p className="text-slate-600 mb-12">TIM KU</p>
          <p className="font-bold underline uppercase">
            ( ........................................ )
          </p>
        </div>
        <div>
          <p className="text-slate-600 mb-12">Mengetahui, KI Kelompok</p>
          <p className="font-bold underline uppercase">
            ( ........................................ )
          </p>
        </div>
      </div>
    </>
  );
};
export default KasPrintContent;
