import React from "react";
import type { ZakatItem } from "../api/financeApi";
import { formatRp } from "../../../utils/format";

interface ZakatPrintContentProps {
  zakat: ZakatItem | null;
  mode: "kwitansi" | "rekap";
}

function toNum(v: number | undefined, def = 0): number {
  const n = Number(v);
  return isNaN(n) ? def : n;
}

function alloc(zakat: ZakatItem | null, category: string) {
  const r = zakat?.allocations || {};
  return (
    r.by_category?.[category] ?? (category === "FITRAH" ? r.fitrah : r.maal)
  );
}

const fmt = (v: number | undefined) => {
  const n = Number(v ?? 0);
  if (!n) return "Rp -";
  return formatRp(n);
};

export const ZakatPrintContent: React.FC<ZakatPrintContentProps> = ({
  zakat,
  mode,
}) => {
  if (!zakat) return null;

  const fitrahAlloc = alloc(zakat, "FITRAH");
  const maalAlloc = alloc(zakat, "MAL");

  const fitrahPenerimaan = toNum(
    fitrahAlloc?.recipient?.amount,
    toNum(zakat.total_money_rp, 0),
  );
  const fitrahMustahiqPersen = toNum(fitrahAlloc?.recipient?.percent, 45);
  const fitrahSabilillahPersen = toNum(fitrahAlloc?.sabilillah?.percent, 40);
  const fitrahAmilPersen = toNum(fitrahAlloc?.amil?.percent, 15);
  const fitrahAmilKelompokPersen = toNum(fitrahAlloc?.amil?.group?.percent, 12);
  const fitrahAmilDesaPersen = toNum(fitrahAlloc?.amil?.village?.percent, 2);
  const fitrahAmilDaerahPersen = toNum(fitrahAlloc?.amil?.region?.percent, 1);

  const fitrahMustahiqNominal = toNum(
    fitrahAlloc?.recipient?.amount,
    Math.round((fitrahPenerimaan * fitrahMustahiqPersen) / 100),
  );
  const fitrahSabilillahNominal = toNum(
    fitrahAlloc?.sabilillah?.amount,
    Math.round((fitrahPenerimaan * fitrahSabilillahPersen) / 100),
  );
  const fitrahAmilNominal = toNum(
    fitrahAlloc?.amil?.amount,
    Math.round((fitrahPenerimaan * fitrahAmilPersen) / 100),
  );
  const fitrahAmilKelompokNominal = toNum(
    fitrahAlloc?.amil?.group?.amount,
    Math.round((fitrahPenerimaan * fitrahAmilKelompokPersen) / 100),
  );
  const fitrahAmilDesaNominal = toNum(
    fitrahAlloc?.amil?.village?.amount,
    Math.round((fitrahPenerimaan * fitrahAmilDesaPersen) / 100),
  );
  const fitrahAmilDaerahNominal = toNum(
    fitrahAlloc?.amil?.region?.amount,
    Math.round((fitrahPenerimaan * fitrahAmilDaerahPersen) / 100),
  );

  const maalPenerimaan = toNum(
    maalAlloc?.recipient?.amount,
    toNum(zakat.total_money_rp, 0),
  );
  const maalMustahiqPersen = toNum(maalAlloc?.recipient?.percent, 45);
  const maalMustahiqKelompokPersen = toNum(
    maalAlloc?.recipient?.group?.percent,
    80,
  );
  const maalMustahiqDaerahPersen = toNum(
    maalAlloc?.recipient?.region?.percent,
    20,
  );
  const maalSabilillahPersen = toNum(maalAlloc?.sabilillah?.percent, 40);
  const maalAmilPersen = toNum(maalAlloc?.amil?.percent, 15);
  const maalAmilKelompokPersen = toNum(maalAlloc?.amil?.group?.percent, 12);
  const maalAmilDesaPersen = toNum(maalAlloc?.amil?.village?.percent, 2);
  const maalAmilDaerahPersen = toNum(maalAlloc?.amil?.region?.percent, 1);

  const maalMustahiqNominal = toNum(
    maalAlloc?.recipient?.amount,
    Math.round((maalPenerimaan * maalMustahiqPersen) / 100),
  );
  const maalMustahiqKelompokNominal = toNum(
    maalAlloc?.recipient?.group?.amount,
    Math.round((maalMustahiqNominal * maalMustahiqKelompokPersen) / 100),
  );
  const maalMustahiqDaerahNominal = toNum(
    maalAlloc?.recipient?.region?.amount,
    Math.round((maalMustahiqNominal * maalMustahiqDaerahPersen) / 100),
  );
  const maalSabilillahNominal = toNum(
    maalAlloc?.sabilillah?.amount,
    Math.round((maalPenerimaan * maalSabilillahPersen) / 100),
  );
  const maalAmilNominal = toNum(
    maalAlloc?.amil?.amount,
    Math.round((maalPenerimaan * maalAmilPersen) / 100),
  );
  const maalAmilKelompokNominal = toNum(
    maalAlloc?.amil?.group?.amount,
    Math.round((maalPenerimaan * maalAmilKelompokPersen) / 100),
  );
  const maalAmilDesaNominal = toNum(
    maalAlloc?.amil?.village?.amount,
    Math.round((maalPenerimaan * maalAmilDesaPersen) / 100),
  );
  const maalAmilDaerahNominal = toNum(
    maalAlloc?.amil?.region?.amount,
    Math.round((maalPenerimaan * maalAmilDaerahPersen) / 100),
  );

  const totalSetorDesa = fitrahAmilDesaNominal + maalAmilDesaNominal;
  const totalSetorDaerah =
    maalMustahiqDaerahNominal + maalSabilillahNominal + maalAmilDaerahNominal;

  const categories = zakat.categories || [];
  const hasMaal =
    categories.includes("MAL") ||
    categories.includes("TIJAROH") ||
    categories.includes("ZURU") ||
    categories.includes("LIVESTOCK");
  const hasFitrah = categories.includes("FITRAH");

  const kategoriLabel =
    categories
      .map((c) =>
        c === "MAL"
          ? "Mal"
          : c === "FITRAH"
            ? "Fitrah"
            : c === "TIJAROH"
              ? "Tijaroh"
              : c === "ZURU"
                ? "Zuru'"
                : c === "LIVESTOCK"
                  ? "Ternak"
                  : c,
      )
      .join(" + ") || "Belum ada tipe";

  const sectionTitleClass = "print-rincian-section-title border rounded-t";
  const titleAmber = `${sectionTitleClass} bg-amber-100 text-amber-900 border-amber-200`;
  const titleLime = `${sectionTitleClass} bg-lime-100 text-lime-900 border-lime-200`;
  const titleSky = `${sectionTitleClass} bg-sky-100 text-sky-900 border-sky-200`;

  return (
    <>
      <div className="text-left mb-4">
        <h1 className="text-[15px] font-bold uppercase tracking-wide leading-tight">
          REKAP LAPORAN ZAKAT MAL-TIJAROH, ZURU', TERNAK DAN FITRAH
        </h1>
        <h2 className="text-[13px] font-bold uppercase mt-1">
          KELOMPOK : LATUKAN
        </h2>
        <p className="text-[12px] font-semibold uppercase mt-0.5">
          {zakat.title || kategoriLabel}
        </p>
      </div>

      <div className="space-y-3 text-[11px]">
        {hasFitrah && (
          <div className="print-rincian-section">
            <h4 className={titleAmber}>ZAKAT FITRAH</h4>
            <table className="print-rincian-table w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-slate-300">
                  <th className="border border-slate-300 p-1.5 text-center w-10">
                    NO
                  </th>
                  <th className="border border-slate-300 p-1.5 text-center">
                    URAIAN
                  </th>
                  <th className="border border-slate-300 p-1.5 text-center w-40">
                    JUMLAH
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-semibold">
                  <td className="border border-slate-300 p-1 text-center">1</td>
                  <td className="border border-slate-300 p-1">
                    JUMLAH PENERIMAAN ZAKAT FITRAH (100%)
                  </td>
                  <td className="border border-slate-300 p-1 text-right font-mono bg-amber-50 font-bold">
                    {fmt(fitrahPenerimaan)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 text-center">2</td>
                  <td className="border border-slate-300 p-1">
                    MUSTAHIQ ({fitrahMustahiqPersen}%)
                  </td>
                  <td className="border border-slate-300 p-1 text-right font-mono">
                    {fmt(fitrahMustahiqNominal)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 text-center">3</td>
                  <td className="border border-slate-300 p-1">
                    SABILILLAH ({fitrahSabilillahPersen}%)
                  </td>
                  <td className="border border-slate-300 p-1 text-right font-mono">
                    {fmt(fitrahSabilillahNominal)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 text-center">4</td>
                  <td className="border border-slate-300 p-1">
                    AMIL ({fitrahAmilPersen}%)
                  </td>
                  <td className="border border-slate-300 p-1 text-right font-mono">
                    {fmt(fitrahAmilNominal)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 text-center"></td>
                  <td className="border border-slate-300 p-1 pl-6">
                    * AMIL KELOMPOK ({fitrahAmilKelompokPersen}%)
                  </td>
                  <td className="border border-slate-300 p-1 text-right font-mono">
                    {fmt(fitrahAmilKelompokNominal)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 text-center"></td>
                  <td className="border border-slate-300 p-1 pl-6">
                    * AMIL DESA ({fitrahAmilDesaPersen}%)
                  </td>
                  <td className="border border-slate-300 p-1 text-right font-mono">
                    {fmt(fitrahAmilDesaNominal)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 text-center"></td>
                  <td className="border border-slate-300 p-1 pl-6">
                    * AMIL DAERAH ({fitrahAmilDaerahPersen}%)
                  </td>
                  <td className="border border-slate-300 p-1 text-right font-mono">
                    {fmt(fitrahAmilDaerahNominal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {hasMaal && (
          <div className="print-rincian-section mt-3">
            <h4 className={titleAmber}>
              ZAKAT MAAL &amp; TIJAROH, ZURU' DAN TERNAK
            </h4>
            <table className="print-rincian-table w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-slate-300">
                  <th className="border border-slate-300 p-1.5 text-center w-10">
                    NO
                  </th>
                  <th className="border border-slate-300 p-1.5 text-center">
                    URAIAN
                  </th>
                  <th className="border border-slate-300 p-1.5 text-center w-40">
                    JUMLAH
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-semibold">
                  <td className="border border-slate-300 p-1 text-center">1</td>
                  <td className="border border-slate-300 p-1">
                    JUMLAH PENERIMAAN ZAKAT MAAL &amp; TIJAROH, ZURU' DAN TERNAK
                    (100%)
                  </td>
                  <td className="border border-slate-300 p-1 text-right font-mono bg-amber-50 font-bold">
                    {fmt(maalPenerimaan)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 text-center">2</td>
                  <td className="border border-slate-300 p-1">
                    MUSTAHIQ ({maalMustahiqPersen}%)
                  </td>
                  <td className="border border-slate-300 p-1 text-right font-mono">
                    {fmt(maalMustahiqNominal)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 text-center"></td>
                  <td className="border border-slate-300 p-1 pl-6">
                    * MUSTAHIQ KELOMPOK ({maalMustahiqKelompokPersen}% dari
                    MUSTAHIQ)
                  </td>
                  <td className="border border-slate-300 p-1 text-right font-mono">
                    {fmt(maalMustahiqKelompokNominal)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 text-center"></td>
                  <td className="border border-slate-300 p-1 pl-6">
                    * MUSTAHIQ SE-DAERAH ({maalMustahiqDaerahPersen}% dari
                    MUSTAHIQ)
                  </td>
                  <td className="border border-slate-300 p-1 text-right font-mono">
                    {fmt(maalMustahiqDaerahNominal)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 text-center">3</td>
                  <td className="border border-slate-300 p-1">
                    SABILILLAH ({maalSabilillahPersen}%)
                  </td>
                  <td className="border border-slate-300 p-1 text-right font-mono">
                    {fmt(maalSabilillahNominal)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 text-center">4</td>
                  <td className="border border-slate-300 p-1">
                    AMIL ({maalAmilPersen}%)
                  </td>
                  <td className="border border-slate-300 p-1 text-right font-mono">
                    {fmt(maalAmilNominal)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 text-center"></td>
                  <td className="border border-slate-300 p-1 pl-6">
                    * AMIL KELOMPOK ({maalAmilKelompokPersen}%)
                  </td>
                  <td className="border border-slate-300 p-1 text-right font-mono">
                    {fmt(maalAmilKelompokNominal)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 text-center"></td>
                  <td className="border border-slate-300 p-1 pl-6">
                    * AMIL DESA ({maalAmilDesaPersen}%)
                  </td>
                  <td className="border border-slate-300 p-1 text-right font-mono">
                    {fmt(maalAmilDesaNominal)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 text-center"></td>
                  <td className="border border-slate-300 p-1 pl-6">
                    * AMIL DAERAH ({maalAmilDaerahPersen}%)
                  </td>
                  <td className="border border-slate-300 p-1 text-right font-mono">
                    {fmt(maalAmilDaerahNominal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="print-rincian-section mt-3">
          <h4 className={titleLime}>SETOR KE DESA</h4>
          <table className="print-rincian-table w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-slate-300">
                <th className="border border-slate-300 p-1.5 text-center w-10">
                  NO
                </th>
                <th className="border border-slate-300 p-1.5 text-center">
                  URAIAN
                </th>
                <th className="border border-slate-300 p-1.5 text-center w-40">
                  JUMLAH
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 p-1 text-center">1</td>
                <td className="border border-slate-300 p-1">
                  AMIL DESA ({maalAmilDesaPersen}%)
                </td>
                <td className="border border-slate-300 p-1 text-right font-mono"></td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1 text-center"></td>
                <td className="border border-slate-300 p-1 pl-6">
                  * % AMIL ZAKAT FITRAH
                </td>
                <td className="border border-slate-300 p-1 text-right font-mono">
                  {fmt(fitrahAmilDesaNominal)}
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-1 text-center"></td>
                <td className="border border-slate-300 p-1 pl-6">
                  * % AMIL ZAKAT MAAL &amp; TIJAROH, ZURU' DAN TERNAK
                </td>
                <td className="border border-slate-300 p-1 text-right font-mono">
                  {fmt(maalAmilDesaNominal)}
                </td>
              </tr>
              <tr className="bg-lime-50 font-bold">
                <td className="border border-slate-300 p-1 text-center"></td>
                <td className="border border-slate-300 p-1 text-center font-bold">
                  JUMLAH
                </td>
                <td className="border border-slate-300 p-1 text-right font-mono font-bold">
                  {fmt(totalSetorDesa)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {hasMaal && (
          <div className="print-rincian-section mt-3">
            <h4 className={titleSky}>SETOR KE DAERAH</h4>
            <table className="print-rincian-table w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-slate-300">
                  <th className="border border-slate-300 p-1.5 text-center w-10">
                    NO
                  </th>
                  <th className="border border-slate-300 p-1.5 text-center">
                    URAIAN
                  </th>
                  <th className="border border-slate-300 p-1.5 text-center w-40">
                    JUMLAH
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-1 text-center">1</td>
                  <td className="border border-slate-300 p-1">
                    MUSTAHIQ SE-DAERAH ({maalMustahiqDaerahPersen}% dari
                    MUSTAHIQ)
                  </td>
                  <td className="border border-slate-300 p-1 text-right font-mono">
                    {fmt(maalMustahiqDaerahNominal)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 text-center">2</td>
                  <td className="border border-slate-300 p-1">
                    SABILILLAH ({maalSabilillahPersen}%)
                  </td>
                  <td className="border border-slate-300 p-1 text-right font-mono">
                    {fmt(maalSabilillahNominal)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-300 p-1 text-center">3</td>
                  <td className="border border-slate-300 p-1">
                    AMIL DAERAH ({maalAmilDaerahPersen}%)
                  </td>
                  <td className="border border-slate-300 p-1 text-right font-mono">
                    {fmt(maalAmilDaerahNominal)}
                  </td>
                </tr>
                <tr className="bg-sky-50 font-bold">
                  <td className="border border-slate-300 p-1 text-center"></td>
                  <td className="border border-slate-300 p-1 text-center font-bold">
                    JUMLAH
                  </td>
                  <td className="border border-slate-300 p-1 text-right font-mono font-bold">
                    {fmt(totalSetorDaerah)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="print-rincian-signature mt-10">
          <div className="text-right mb-4 pr-4">
            <p className="text-[11px]">……………………………., …………………………</p>
          </div>
          <div className="flex justify-between px-2">
            <div className="w-1/2 text-center">
              <p className="mb-12 text-[11px]">KYAI KELOMPOK</p>
              <p className="text-[11px]">( ......................... )</p>
            </div>
            <div className="w-1/2 text-center">
              <p className="mb-12 text-[11px]">KU KELOMPOK</p>
              <p className="text-[11px]">( ......................... )</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ZakatPrintContent;
