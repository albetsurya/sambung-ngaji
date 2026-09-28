import React, { useRef } from "react";
import type { ZakatItem } from "../api/financeApi";
import { formatRp } from "../../../utils/format";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Pratinjau Cetak: {mode === "kwitansi" ? "Kwitansi Tanda Terima Zakat" : "Rekapitulasi Zakat"}
            </h3>
            <p className="text-xs text-slate-500">Muzakki: {zakat.namaMuzaki}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              <span>Cetak Kwitansi</span>
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
            className="bg-white text-slate-900 p-8 shadow-md rounded-lg max-w-[210mm] mx-auto font-serif text-xs leading-relaxed border border-slate-300"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {/* Header Cetak */}
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

            {/* Receipt Form */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border border-slate-300 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500">No. Transaksi Zakat:</span>
                  <p className="font-bold text-slate-900">{zakat.id}</p>
                </div>
                <div>
                  <span className="text-slate-500">Tanggal Penerimaan:</span>
                  <p className="font-bold text-slate-900">{zakat.tanggal || new Date().toISOString().slice(0, 10)}</p>
                </div>
              </div>

              <div className="border-t border-b border-slate-300 py-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Telah Terima Dari (Muzakki):</span>
                  <span className="font-bold text-slate-900 text-sm uppercase">{zakat.namaMuzaki}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Jenis Zakat:</span>
                  <span className="font-semibold text-emerald-800 uppercase">{zakat.tipeZakat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Jumlah Tanggungan Jiwa:</span>
                  <span className="font-mono font-semibold text-slate-900">{zakat.jumlahJiwa || 1} Orang</span>
                </div>
              </div>

              {/* Rincian Nominal */}
              <div className="bg-emerald-50/60 p-4 rounded-lg border border-emerald-300/80 space-y-2">
                <h4 className="font-bold text-emerald-950 uppercase border-b border-emerald-200 pb-1">
                  RINCIAN PENERIMAAN ZAKAT
                </h4>
                <div className="flex justify-between font-mono text-xs">
                  <span>Beras (Kg):</span>
                  <span className="font-bold text-slate-900">{zakat.totalBerasKg ? `${zakat.totalBerasKg} Kg` : "—"}</span>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span>Uang (Rp):</span>
                  <span className="font-bold text-emerald-700">{zakat.totalUangRp ? formatRp(zakat.totalUangRp) : "—"}</span>
                </div>
              </div>

              {/* Doa Muzakki */}
              <div className="text-center italic text-slate-600 bg-slate-50 p-3 rounded border border-slate-200 text-[11px] my-4">
                "Âjarakallâhu fîmâ a'thaita, wa bâraka fîmâ abqaita, wa ja'alahu laka thahûrâ."
                <br />
                <span className="text-[10px] text-slate-500">
                  (Semoga Allah memberikan pahala atas apa yang engkau berikan, memberikan keberkahan atas apa yang engkau sisakan, dan menjadikannya pembersih bagimu.)
                </span>
              </div>
            </div>

            {/* Signatures */}
            <div className="mt-8 flex justify-between text-center text-xs">
              <div>
                <p className="text-slate-600 mb-10">Muzakki / Pembayar</p>
                <p className="font-bold underline uppercase">( {zakat.namaMuzaki} )</p>
              </div>
              <div>
                <p className="text-slate-600 mb-10">Panitia Amil Zakat</p>
                <p className="font-bold underline uppercase">( ........................................ )</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
