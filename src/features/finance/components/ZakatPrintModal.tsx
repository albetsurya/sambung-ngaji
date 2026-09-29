import React, { useRef } from "react";
import type { ZakatItem } from "../api/financeApi";
import { formatRp } from "../../../utils/format";
import { Button, Modal } from "../../../components/common";
import { Printer } from "../../../components/common/FontAwesomeIcons";

interface ZakatPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  zakat: ZakatItem | null;
  mode: "kwitansi" | "rekap";
}

export const ZakatPrintModal: React.FC<ZakatPrintModalProps> = ({
  isOpen,
  onClose,
  zakat,
  mode,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !zakat) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={mode === "kwitansi" ? "Kwitansi Tanda Terima Zakat" : "Rekapitulasi Zakat"}
    >
      <p className="text-ios-footnote text-surface-muted -mt-1 mb-4 px-1">
        Muzakki: {zakat.muzakki_name}
      </p>
      <div className="flex gap-2.5 mb-4">
        <Button fullWidth onClick={handlePrint} leftIcon={<Printer size={14} />}>
          Cetak Kwitansi
        </Button>
        <Button variant="secondary" fullWidth onClick={onClose}>
          Tutup
        </Button>
      </div>

      <div className="overflow-y-auto bg-surface-card2 p-3 rounded-2xl border border-surface-border max-h-[60vh]">
        <div
          ref={printRef}
          className="bg-white text-slate-900 p-8 shadow-md rounded-lg max-w-[210mm] mx-auto text-xs leading-relaxed border border-slate-300"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <div className="text-center border-b-2 border-slate-800 pb-3 mb-6">
            <h1 className="text-xl font-bold uppercase tracking-wide text-emerald-950">
              PANITIA AMIL ZAKAT FITRAH & MAL
            </h1>
            <h2 className="text-sm font-semibold text-slate-700 uppercase mt-0.5">
              KELOMPOK LATUKAN
            </h2>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
              TANDA TERIMA PENERIMAAN ZAKAT (KWITANSI)
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-300 font-mono text-[11px]">
              <div>
                <span className="text-slate-500">No. Transaksi Zakat:</span>
                <p className="font-bold text-slate-900">{zakat.zakat_id}</p>
              </div>
              <div>
                <span className="text-slate-500">Tanggal Penerimaan:</span>
                <p className="font-bold text-slate-900">{zakat.transaction_date || new Date().toISOString().slice(0, 10)}</p>
              </div>
            </div>

            <div className="border-t border-b border-slate-300 py-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Telah Terima Dari (Muzakki):</span>
                <span className="font-bold text-slate-900 text-sm uppercase">{zakat.muzakki_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Jenis Zakat:</span>
                <span className="font-semibold text-emerald-800 uppercase">{zakat.zakat_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Jumlah Tanggungan Jiwa:</span>
                <span className="font-mono font-semibold text-slate-900">{zakat.soul_count || 1} Orang</span>
              </div>
            </div>

            <div className="bg-emerald-50/60 p-4 rounded-lg border border-emerald-300/80 space-y-2">
              <h4 className="font-bold text-emerald-950 uppercase border-b border-emerald-200 pb-1">
                RINCIAN PENERIMAAN ZAKAT
              </h4>
              <div className="flex justify-between font-mono text-xs">
                <span>Beras (Kg):</span>
                <span className="font-bold text-slate-900">{zakat.total_rice_kg ? `${zakat.total_rice_kg} Kg` : "—"}</span>
              </div>
              <div className="flex justify-between font-mono text-xs">
                <span>Uang (Rp):</span>
                <span className="font-bold text-emerald-700">{zakat.total_money_rp ? formatRp(zakat.total_money_rp) : "—"}</span>
              </div>
            </div>

            <div className="text-center italic text-slate-600 bg-slate-50 p-3 rounded border border-slate-200 text-[11px] my-4">
              "Âjarakallâhu fîmâ a'thaita, wa bâraka fîmâ abqaita, wa ja'alahu laka thahûrâ."
              <br />
              <span className="text-[10px] text-slate-500">
                (Semoga Allah memberikan pahala atas apa yang engkau berikan, memberikan keberkahan atas apa yang engkau sisakan, dan menjadikannya pembersih bagimu.)
              </span>
            </div>
          </div>

          <div className="mt-8 flex justify-between text-center text-xs">
            <div>
              <p className="text-slate-600 mb-10">Muzakki / Pembayar</p>
              <p className="font-bold underline uppercase">( {zakat.muzakki_name} )</p>
            </div>
            <div>
              <p className="text-slate-600 mb-10">Panitia Amil Zakat</p>
              <p className="font-bold underline uppercase">( ........................................ )</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
