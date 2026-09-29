import React, { useRef } from "react";
import type { Transaction } from "../api/financeApi";
import { formatRp } from "../../../utils/format";
import { Button, Modal } from "../../../components/common";
import { FinancePrintActions } from "./FinancePrintActions";

interface KasPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  initial_balance: number;
  ending_balance: number;
  period_label: string;
  cash_type_label: string;
  mode: "rincian" | "rekap";
}

export const KasPrintModal: React.FC<KasPrintModalProps> = ({
  isOpen,
  onClose,
  transactions,
  initial_balance,
  ending_balance,
  period_label,
  cash_type_label,
  mode,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const penerimaanGrouped: Record<string, number> = {};
  const pengeluaranGrouped: Record<string, number> = {};
  let totalDebit = 0;
  let totalCredit = 0;

  transactions.forEach((t) => {
    const isSaldoAwal =
      String(t.account_name || "").trim().toUpperCase() === "SALDO AWAL";

    const deb = Number(t.debit) || 0;
    const kre = Number(t.credit) || 0;

    if (!isSaldoAwal && deb > 0) {
      const key = (t.account_name || t.description || "LAINNYA").trim().toUpperCase();
      penerimaanGrouped[key] = (penerimaanGrouped[key] || 0) + deb;
      totalDebit += deb;
    }

    if (!isSaldoAwal && kre > 0) {
      const key = (t.account_name || t.description || "LAINNYA").trim().toUpperCase();
      pengeluaranGrouped[key] = (pengeluaranGrouped[key] || 0) + kre;
      totalCredit += kre;
    }
  });

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={mode === "rekap" ? "Laporan Rekapitulasi Kas" : "Rincian Transaksi Kas"}
    >
      <p className="text-ios-footnote text-surface-muted -mt-1 mb-4 px-1">
        {cash_type_label} • {period_label}
      </p>
      <div className="mb-4 space-y-2.5">
        <FinancePrintActions
          exportRef={printRef}
          filename={`${cash_type_label}-${period_label}`}
        />
        <Button variant="secondary" fullWidth onClick={onClose}>
          Tutup
        </Button>
      </div>

      <div className="overflow-y-auto bg-surface-card2 p-3 rounded-2xl border border-surface-border max-h-[60vh]">
        <div
          ref={printRef}
          className="bg-white text-slate-900 p-8 shadow-md rounded-lg max-w-[210mm] mx-auto min-h-[297mm] text-sm leading-relaxed"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
            <h1 className="text-xl font-bold tracking-wide uppercase">
              {mode === "rekap" ? "LAPORAN REKAPITULASI KAS" : "LAPORAN TRANSAKSI KAS"}
            </h1>
            <h2 className="text-md font-semibold text-slate-700 uppercase mt-1">
              {cash_type_label.toUpperCase()}
            </h2>
            <p className="text-xs text-slate-600 mt-1 uppercase tracking-wider">
              PERIODE: {period_label.toUpperCase()}
            </p>
          </div>

          {mode === "rincian" ? (
            <table className="w-full text-xs border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
                  <th className="border border-slate-400 p-2 text-center w-10">NO</th>
                  <th className="border border-slate-400 p-2 text-left w-24">TANGGAL</th>
                  <th className="border border-slate-400 p-2 text-left">KETERANGAN</th>
                  <th className="border border-slate-400 p-2 text-right w-28">DEBET</th>
                  <th className="border border-slate-400 p-2 text-right w-28">KREDIT</th>
                  <th className="border border-slate-400 p-2 text-right w-28">SALDO</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, idx) => (
                  <tr key={idx} className="border-b border-slate-300">
                    <td className="border border-slate-300 p-1.5 text-center">{idx + 1}</td>
                    <td className="border border-slate-300 p-1.5 whitespace-nowrap">{t.transaction_date}</td>
                    <td className="border border-slate-300 p-1.5">{t.description}</td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono">
                      {Number(t.debit) > 0 ? formatRp(Number(t.debit)) : "—"}
                    </td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono">
                      {Number(t.credit) > 0 ? formatRp(Number(t.credit)) : "—"}
                    </td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono font-semibold">
                      {formatRp(Number(t.balance) || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-slate-100 border-t-2 border-slate-400">
                  <td colSpan={3} className="border border-slate-400 p-2 text-right">
                    TOTAL TRANSAKSI
                  </td>
                  <td className="border border-slate-400 p-2 text-right font-mono text-emerald-800">
                    {formatRp(totalDebit)}
                  </td>
                  <td className="border border-slate-400 p-2 text-right font-mono text-rose-800">
                    {formatRp(totalCredit)}
                  </td>
                  <td className="border border-slate-400 p-2 text-right font-mono">
                    {formatRp(ending_balance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <table className="w-full text-xs border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
                  <th className="border border-slate-400 p-2 text-left">URAIAN AKUN / KATEGORI</th>
                  <th className="border border-slate-400 p-2 text-right w-36">PENERIMAAN</th>
                  <th className="border border-slate-400 p-2 text-right w-36">PENGELUARAN</th>
                  <th className="border border-slate-400 p-2 text-right w-36">SALDO</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-slate-50 font-semibold">
                  <td className="border border-slate-300 p-2">SALDO AWAL PERIODE</td>
                  <td className="border border-slate-300 p-2 text-right font-mono">—</td>
                  <td className="border border-slate-300 p-2 text-right font-mono">—</td>
                  <td className="border border-slate-300 p-2 text-right font-mono text-slate-900">
                    {formatRp(initial_balance)}
                  </td>
                </tr>

                <tr className="bg-emerald-50/50 font-bold">
                  <td colSpan={4} className="border border-slate-300 p-1.5 text-emerald-900 uppercase">
                    1. PENERIMAAN
                  </td>
                </tr>
                {Object.entries(penerimaanGrouped).map(([acc, val]) => (
                  <tr key={acc} className="border-b border-slate-200">
                    <td className="border border-slate-300 p-1.5 pl-6">{acc}</td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono">{formatRp(val)}</td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono">—</td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono">—</td>
                  </tr>
                ))}

                <tr className="bg-rose-50/50 font-bold">
                  <td colSpan={4} className="border border-slate-300 p-1.5 text-rose-900 uppercase">
                    2. PENGELUARAN
                  </td>
                </tr>
                {Object.entries(pengeluaranGrouped).map(([acc, val]) => (
                  <tr key={acc} className="border-b border-slate-200">
                    <td className="border border-slate-300 p-1.5 pl-6">{acc}</td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono">—</td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono">{formatRp(val)}</td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono">—</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-slate-100 border-t-2 border-slate-400">
                  <td className="border border-slate-400 p-2 text-right uppercase">TOTAL & SALDO AKHIR</td>
                  <td className="border border-slate-400 p-2 text-right font-mono text-emerald-800">
                    {formatRp(totalDebit)}
                  </td>
                  <td className="border border-slate-400 p-2 text-right font-mono text-rose-800">
                    {formatRp(totalCredit)}
                  </td>
                  <td className="border border-slate-400 p-2 text-right font-mono text-slate-900 font-bold">
                    {formatRp(ending_balance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}

          <div className="mt-12 flex justify-between text-center text-xs">
            <div>
              <p className="text-slate-600 mb-12">Bendahara / Tim Keuangan</p>
              <p className="font-bold underline uppercase">( ........................................ )</p>
            </div>
            <div>
              <p className="text-slate-600 mb-12">Mengetahui, Ketua / Pembina</p>
              <p className="font-bold underline uppercase">( ........................................ )</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
