import React, { useRef } from "react";
import type { DueMember, DuePayment } from "../api/financeApi";
import { formatRp } from "../../../utils/format";
import { Button, Modal } from "../../../components/common";
import { FinancePrintActions } from "./FinancePrintActions";

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

  const paymentMap = new Map<string, DuePayment>();
  payments.forEach((p) => {
    paymentMap.set(p.member_id, p);
  });

  function carryNote(p?: DuePayment): string {
    const parts: string[] = [];
    const items = p?.carryover_items || [];
    if (items.length) {
      const lbl = items
        .map((it) => {
          const m = /^(\d{4})-(\d{2})$/.exec(it.month);
          const name = m
            ? new Date(Number(m[1]), Number(m[2]) - 1, 1).toLocaleDateString("id-ID", {
                month: "short",
                year: "numeric",
              })
            : it.month;
          return `${name} (${formatRp(it.amount)})`;
        })
        .join(", ");
      parts.push(`Susulan: ${lbl}`);
    }
    if (p?.notes) parts.push(p.notes);
    return parts.join(" · ");
  }

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
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Rekap Matriks Shodaqoh & Infaq"
    >
      <p className="text-ios-footnote text-surface-muted -mt-1 mb-4 px-1">
        Periode: {periodLabel}
      </p>
      <div className="mb-4 space-y-2.5">
        <FinancePrintActions
          exportRef={printRef}
          filename={`Matriks-Shodaqoh-${periodLabel}`}
        />
        <Button variant="secondary" fullWidth onClick={onClose}>
          Tutup
        </Button>
      </div>

      <div className="overflow-y-auto bg-surface-card2 p-3 rounded-2xl border border-surface-border max-h-[60vh]">
        <div
          ref={printRef}
          className="bg-white text-slate-900 p-8 shadow-md rounded-lg max-w-[297mm] mx-auto min-h-[210mm] text-xs leading-tight"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <div className="text-center border-b-2 border-slate-800 pb-3 mb-4">
            <h1 className="text-lg font-bold uppercase tracking-wide">
              REKAPITULASI PEMBAYARAN SHODAQOH & INFAQ BULANAN
            </h1>
            <p className="text-xs text-slate-700 mt-0.5 uppercase tracking-wider font-semibold">
              PERIODE: {periodLabel.toUpperCase()}
            </p>
          </div>

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
                const ir = Number(p?.carryover_ir) || 0;
                const sambung = Number(p?.connecting_fund) || 0;
                const jimpitan = Number(p?.community_dues) || 0;
                const siar = Number(p?.outreach_fund) || 0;
                const seribuan = Number(p?.thousand_fund) || 0;
                const kafan = Number(p?.funeral_fund) || 0;
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
                    <td className="border border-slate-300 p-1">{carryNote(p)}</td>
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
    </Modal>
  );
};
