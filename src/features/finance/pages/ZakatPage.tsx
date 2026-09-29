import React, { useState, useEffect } from "react";
import { financeApi, type ZakatItem } from "../api/financeApi";
import { formatRp } from "../../../utils/format";
import { useToast } from "../../../contexts/ToastContext";
import { usePermission } from "../../../hooks/usePermission";
import { ZakatPrintModal } from "../components/ZakatPrintModal";

export const ZakatPage: React.FC = () => {
  const { showToast } = useToast();
  const { assignedGroup, isSuperAdmin } = usePermission();

  const [loading, setLoading] = useState(true);
  const [zakatList, setZakatList] = useState<ZakatItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZakat, setEditingZakat] = useState<ZakatItem | null>(null);

  const [form, setForm] = useState({
    zakat_type: "FITRAH" as "FITRAH" | "MAL",
    muzakki_name: "",
    soul_count: 1,
    total_rice_kg: 0,
    total_money_rp: 0,
  });

  // Print Modal
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedPrintZakat, setSelectedPrintZakat] = useState<ZakatItem | null>(null);

  // Detail Sheet
  const [detailZakat, setDetailZakat] = useState<ZakatItem | null>(null);
  const [detailTab, setDetailTab] = useState<"muzaki" | "rincian" | "mustahik">("rincian");

  const rincian = (z: ZakatItem | null) => {
    const total = Number(z?.total_money_rp) || 0;
    const mustahik = total * 0.45;
    const sabilillah = total * 0.4;
    const amil = total * 0.15;
    return {
      total,
      mustahik,
      mustahikKelompok: mustahik * 0.8,
      mustahikDaerah: mustahik * 0.2,
      sabilillah,
      amil,
      amilKelompok: amil * 0.8,
      amilDesa: amil * 0.1333,
      amilDaerah: amil * 0.0667,
    };
  };

  const loadData = async () => {
    if (!assignedGroup) {
      setZakatList([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await financeApi.getZakatList(assignedGroup);
      if (res && res.data) {
        setZakatList(res.data);
      }
    } catch (err: any) {
      showToast(err.message || "Gagal memuat data zakat", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [assignedGroup]);

  const handleOpenAddModal = () => {
    setEditingZakat(null);
    setForm({
      zakat_type: "FITRAH",
      muzakki_name: "",
      soul_count: 1,
      total_rice_kg: 2.7,
      total_money_rp: 0,
    });
    setIsModalOpen(true);
  };

  const handleSaveZakat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.muzakki_name.trim()) {
      showToast("Nama Muzakki wajib diisi", "error");
      return;
    }

    try {
      if (editingZakat) {
        await financeApi.manageZakat(assignedGroup, "updateZakat", {
          zakat_id: editingZakat.zakat_id,
          ...form,
        });
        showToast("Data zakat berhasil diperbarui", "success");
      } else {
        await financeApi.manageZakat(assignedGroup, "createZakat", form);
        showToast("Data zakat baru berhasil dicatat", "success");
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || "Gagal menyimpan zakat", "error");
    }
  };

  const handleDeleteZakat = async (zakatId: string) => {
    if (!window.confirm("Yakin ingin menghapus catatan zakat ini?")) return;
    try {
      await financeApi.manageZakat(assignedGroup, "deleteZakat", { zakat_id: zakatId });
      showToast("Catatan zakat berhasil dihapus", "success");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Gagal menghapus zakat", "error");
    }
  };

  const handleCompleteZakat = async (zakatId: string) => {
    try {
      await financeApi.manageZakat(assignedGroup, "completeZakat", { zakat_id: zakatId });
      showToast("Status zakat berhasil diset Selesai / Tuntas", "success");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Gagal mengupdate status zakat", "error");
    }
  };

  const filteredZakat = zakatList.filter((z) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (z.muzakki_name || "").toLowerCase().includes(q) ||
      (z.zakat_type || "").toLowerCase().includes(q)
    );
  });

  const totalJiwa = zakatList.reduce((sum, z) => sum + (Number(z.soul_count) || 1), 0);
  const totalBeras = zakatList.reduce((sum, z) => sum + (Number(z.total_rice_kg) || 0), 0);
  const totalUang = zakatList.reduce((sum, z) => sum + (Number(z.total_money_rp) || 0), 0);

  return (
    <div className="space-y-6">
      {!assignedGroup && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-sm text-amber-800 dark:text-amber-200">
          {isSuperAdmin
            ? "Pilih kelompok dulu (menu Lainnya → Kelompok Saya) untuk membuka zakat kelompok."
            : "Akun Anda belum dipetakan ke kelompok. Hubungi admin."}
        </div>
      )}
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Tanggungan Jiwa</p>
          <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
            {totalJiwa} <span className="text-xs text-slate-500 font-normal">Orang</span>
          </h4>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Zakat Beras</p>
          <h4 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {totalBeras.toFixed(1)} <span className="text-xs font-normal">Kg</span>
          </h4>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-teal-500">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Zakat Uang</p>
          <h4 className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">
            {formatRp(totalUang)}
          </h4>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Cari nama Muzakki..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-sm px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border-0 focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            + Catat Penerimaan Zakat
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Memuat data zakat...</div>
        ) : filteredZakat.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">Belum ada catatan zakat.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-center w-12">No</th>
                  <th className="px-4 py-3">Muzakki</th>
                  <th className="px-4 py-3 text-center w-24">Tipe Zakat</th>
                  <th className="px-4 py-3 text-center w-20">Jiwa</th>
                  <th className="px-4 py-3 text-right">Zakat Beras</th>
                  <th className="px-4 py-3 text-right">Zakat Uang</th>
                  <th className="px-4 py-3 text-center w-28">Status</th>
                  <th className="px-4 py-3 text-center w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredZakat.map((z, idx) => (
                  <tr key={z.zakat_id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-center text-slate-400 font-mono text-xs">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-100">{z.muzakki_name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {z.zakat_type || "FITRAH"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-semibold">{z.soul_count || 1}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">
                      {z.total_rice_kg ? `${z.total_rice_kg} Kg` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-teal-600 dark:text-teal-400">
                      {z.total_money_rp ? formatRp(z.total_money_rp) : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          z.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {z.status === "COMPLETED" ? "Tuntas" : "Proses"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <button
                          onClick={() => {
                            setDetailZakat(z);
                            setDetailTab("rincian");
                          }}
                          className="text-slate-600 dark:text-slate-300 font-medium hover:underline"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPrintZakat(z);
                            setIsPrintModalOpen(true);
                          }}
                          className="text-emerald-600 font-medium hover:underline"
                        >
                          Kwitansi
                        </button>
                        {z.status !== "COMPLETED" && (
                          <button
                            onClick={() => handleCompleteZakat(z.zakat_id)}
                            className="text-teal-600 font-medium hover:underline"
                          >
                            Set Tuntas
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteZakat(z.zakat_id)}
                          className="text-rose-500 font-medium hover:underline"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add Zakat */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Catat Penerimaan Zakat Baru</h3>
            <form onSubmit={handleSaveZakat} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tipe Zakat</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="tipeZakat"
                      value="FITRAH"
                      checked={form.zakat_type === "FITRAH"}
                      onChange={() => setForm({ ...form, zakat_type: "FITRAH" })}
                    />
                    <span>Zakat Fitrah</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="tipeZakat"
                      value="MAL"
                      checked={form.zakat_type === "MAL"}
                      onChange={() => setForm({ ...form, zakat_type: "MAL" })}
                    />
                    <span>Zakat Mal</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nama Muzakki</label>
                <input
                  type="text"
                  placeholder="Nama Pembayar Zakat"
                  value={form.muzakki_name}
                  onChange={(e) => setForm({ ...form, muzakki_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border-0"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Jumlah Tanggungan Jiwa</label>
                <input
                  type="number"
                  min={1}
                  value={form.soul_count}
                  onChange={(e) => setForm({ ...form, soul_count: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border-0 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Total Beras (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.total_rice_kg || ""}
                    onChange={(e) => setForm({ ...form, total_rice_kg: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border-0 font-mono font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Total Uang (Rp)</label>
                  <input
                    type="number"
                    value={form.total_money_rp || ""}
                    onChange={(e) => setForm({ ...form, total_money_rp: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border-0 font-mono font-bold text-teal-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold"
                >
                  Simpan Catatan Zakat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Sheet */}
      {detailZakat && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm" onClick={() => setDetailZakat(null)}>
          <div
            className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto sm:hidden" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                  {detailZakat.muzakki_name}
                </h3>
                <p className="text-xs text-slate-500">
                  {detailZakat.zakat_type === "MAL" ? "Zakat Mal" : "Zakat Fitrah"} · {detailZakat.soul_count} jiwa
                  {detailZakat.transaction_date ? ` · ${detailZakat.transaction_date}` : ""}
                </p>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ${
                  detailZakat.status === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                }`}
              >
                {detailZakat.status === "COMPLETED" ? "Tuntas" : "Proses"}
              </span>
            </div>

            <div className="flex gap-2">
              {(["muzaki", "rincian", "mustahik"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setDetailTab(t)}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
                    detailTab === t
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {t === "muzaki" ? "Muzaki" : t === "rincian" ? "Rincian" : "Mustahik"}
                </button>
              ))}
            </div>

            {detailTab === "rincian" && (() => {
              const r = rincian(detailZakat);
              const row = (label: string, pct: string, val: number, indent = false) => (
                <div className={`flex items-center justify-between py-2 ${indent ? "pl-4" : ""} border-b border-slate-100 dark:border-slate-800 last:border-0`}>
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {label} <span className="text-xs text-slate-400 font-semibold">{pct}</span>
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-100">{formatRp(val)}</span>
                </div>
              );
              return (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-1">
                  <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-bold">Total Dana</span>
                    <span className="font-mono font-extrabold text-emerald-600">{formatRp(r.total)}</span>
                  </div>
                  {row("Mustahik", "45%", r.mustahik)}
                  {row("Kelompok", "80% dari mustahik", r.mustahikKelompok, true)}
                  {row("Daerah", "20% dari mustahik", r.mustahikDaerah, true)}
                  {row("Sabilillah", "40%", r.sabilillah)}
                  {row("Amil", "15%", r.amil)}
                  {row("Amil Kelompok", "12%", r.amilKelompok, true)}
                  {row("Amil Desa", "2%", r.amilDesa, true)}
                  {row("Amil Daerah", "1%", r.amilDaerah, true)}
                </div>
              );
            })()}

            {detailTab === "muzaki" && (
              <div className="space-y-2">
                {(detailZakat.muzakki_list || []).length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">Belum ada rincian muzakki.</p>
                ) : (
                  (detailZakat.muzakki_list || []).map((m: any, i: number) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm">
                      <span className="font-semibold">{m.nama || m.name || `Muzaki ${i + 1}`}</span>
                      <span className="font-mono">{m.amount ? formatRp(m.amount) : ""}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {detailTab === "mustahik" && (
              <div className="space-y-2">
                {(detailZakat.mustahik_list || []).length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">Belum ada penyaluran mustahik.</p>
                ) : (
                  (detailZakat.mustahik_list || []).map((m: any, i: number) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm">
                      <span className="font-semibold">{m.nama || m.name || `Mustahik ${i + 1}`}</span>
                      <span className="font-mono">{m.amount ? formatRp(m.amount) : ""}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            <button
              onClick={() => setDetailZakat(null)}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Kwitansi Print Modal */}
      <ZakatPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        zakat={selectedPrintZakat}
        mode="kwitansi"
      />
    </div>
  );
};
