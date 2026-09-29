import React, { useRef } from "react";
import type { DueMember, DuePayment } from "../api/financeApi";
import { formatRp } from "../../../utils/format";

interface MonthlyDuesPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: DueMember[];
  payments: DuePayment[];
  periodLabel: string;
}

export const MonthlyDuesPrintModal: React.FC<MonthlyDuesPrintModalProps> = ({
  isOpen,
  onClose,
  members,
  payments,
  periodLabel,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Map member payments
  const paymentMap = new Map<string, DuePayment>();
  payments.forEach((p) => {
    paymentMap.set(p.member_id, p);
  });

  let sumTarget = 0;
  let sumIr = 0;
  let sumSambung = 0;
  let sumJimpitan = 0;
  let sumSiar = 0;
  let sumSeribuan = 0;
  let sumKafan = 0;
  let sumUkhro = 0;
  let sumTotal = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-5xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Pratinjau Cetak: Rekap Matriks Shodaqoh & Infaq
            </h3>
            <p className="text-xs text-slate-500">Periode: {periodLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              <span>Cetak Matriks</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* Paper Container */}
        <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div
            ref={printRef}
            className="bg-white text-slate-900 p-8 shadow-md rounded-lg max-w-[297mm] mx-auto min-h-[210mm] font-serif text-xs leading-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {/* Header Cetak */}
            <div className="text-center border-b-2 border-slate-800 pb-3 mb-4">
              <h1 className="text-lg font-bold uppercase tracking-wide">
                REKAPITULASI PEMBAYARAN SHODAQOH & INFAQ BULANAN
              </h1>
              <p className="text-xs text-slate-700 mt-0.5 uppercase tracking-wider font-semibold">
                PERIODE: {periodLabel.toUpperCase()}
              </p>
            </div>

            {/* Matrix Table */}
            <table className="w-full text-[10px] border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400 text-center">
                  <th className="border border-slate-400 p-1 w-6">NO</th>
                  <th className="border border-slate-400 p-1 text-left min-w-[120px]">NAMA ANGGOTA</th>
                  <th className="border border-slate-400 p-1 w-20">TARGET BULANAN</th>
                  <th className="border border-slate-400 p-1 w-16">IR / INFAQ</th>
                  <th className="border border-slate-400 p-1 w-16">SAMBUNG</th>
                  <th className="border border-slate-400 p-1 w-14">JIMPITAN</th>
                  <th className="border border-slate-400 p-1 w-14">SIAR-SIAR</th>
                  <th className="border border-slate-400 p-1 w-14">SERIBUAN</th>
                  <th className="border border-slate-400 p-1 w-14">KAFAN</th>
                  <th className="border border-slate-400 p-1 w-16">UKHRO MT</th>
                  <th className="border border-slate-400 p-1 w-20">TOTAL</th>
                  <th className="border border-slate-400 p-1 text-left">KETERANGAN</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, idx) => {
                  const p = paymentMap.get(m.member_id);
                  const target = Number(m.monthly_target) || 0;
                  const ir = Number((p as any)?.carryover_ir ?? (p as any)?.susulan_ir) || 0;
                  const sambung = Number((p as any)?.connecting_fund ?? (p as any)?.uang_sambung) || 0;
                  const jimpitan = Number((p as any)?.community_dues ?? (p as any)?.jimpitan) || 0;
                  const siar = Number((p as any)?.outreach_fund ?? (p as any)?.siar_siar) || 0;
                  const seribuan = Number((p as any)?.thousand_fund ?? (p as any)?.seribuan) || 0;
                  const kafan = Number((p as any)?.funeral_fund ?? (p as any)?.kafan) || 0;
                  const ukhro = Number(p?.ukhro_mt) || 0;
                  const total = Number(p?.total_amount) || (ir + sambung + jimpitan + siar + seribuan + kafan + ukhro);

                  sumTarget += target;
                  sumIr += ir;
                  sumSambung += sambung;
                  sumJimpitan += jimpitan;
                  sumSiar += siar;
                  sumSeribuan += seribuan;
                  sumKafan += kafan;
                  sumUkhro += ukhro;
                  sumTotal += total;

                  return (
                    <tr key={m.member_id} className="border-b border-slate-300">
                      <td className="border border-slate-300 p-1 text-center">{idx + 1}</td>
                      <td className="border border-slate-300 p-1 font-semibold">{m.member_name}</td>
                      <td className="border border-slate-300 p-1 text-right font-mono">{target > 0 ? formatRp(target) : "—"}</td>
                      <td className="border border-slate-300 p-1 text-right font-mono">{ir > 0 ? formatRp(ir) : "—"}</td>
                      <td className="border border-slate-300 p-1 text-right font-mono">{sambung > 0 ? formatRp(sambung) : "—"}</td>
                      <td className="border border-slate-300 p-1 text-right font-mono">{jimpitan > 0 ? formatRp(jimpitan) : "—"}</td>
                      <td className="border border-slate-300 p-1 text-right font-mono">{siar > 0 ? formatRp(siar) : "—"}</td>
                      <td className="border border-slate-300 p-1 text-right font-mono">{seribuan > 0 ? formatRp(seribuan) : "—"}</td>
                      <td className="border border-slate-300 p-1 text-right font-mono">{kafan > 0 ? formatRp(kafan) : "—"}</td>
                      <td className="border border-slate-300 p-1 text-right font-mono">{ukhro > 0 ? formatRp(ukhro) : "—"}</td>
                      <td className="border border-slate-300 p-1 text-right font-mono font-bold text-slate-900">
                        {total > 0 ? formatRp(total) : "—"}
                      </td>
                      <td className="border border-slate-300 p-1">{p?.notes || ""}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-slate-100 border-t-2 border-slate-400">
                  <td colSpan={2} className="border border-slate-400 p-1.5 text-right uppercase">JUMLAH TOTAL</td>
                  <td className="border border-slate-400 p-1 text-right font-mono">{formatRp(sumTarget)}</td>
                  <td className="border border-slate-400 p-1 text-right font-mono">{formatRp(sumIr)}</td>
                  <td className="border border-slate-400 p-1 text-right font-mono">{formatRp(sumSambung)}</td>
                  <td className="border border-slate-400 p-1 text-right font-mono">{formatRp(sumJimpitan)}</td>
                  <td className="border border-slate-400 p-1 text-right font-mono">{formatRp(sumSiar)}</td>
                  <td className="border border-slate-400 p-1 text-right font-mono">{formatRp(sumSeribuan)}</td>
                  <td className="border border-slate-400 p-1 text-right font-mono">{formatRp(sumKafan)}</td>
                  <td className="border border-slate-400 p-1 text-right font-mono">{formatRp(sumUkhro)}</td>
                  <td className="border border-slate-400 p-1 text-right font-mono text-emerald-800 font-bold">
                    {formatRp(sumTotal)}
                  </td>
                  <td className="border border-slate-400 p-1"></td>
                </tr>
              </tfoot>
            </table>

            {/* Signatures */}
            <div className="mt-8 flex justify-between text-center text-xs">
              <div>
                <p className="text-slate-600 mb-10">Penerima / Tim KU</p>
                <p className="font-bold underline uppercase">( ........................................ )</p>
              </div>
              <div>
                <p className="text-slate-600 mb-10">Mengetahui, Pengurus Kelompok</p>
                <p className="font-bold underline uppercase">( ........................................ )</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
