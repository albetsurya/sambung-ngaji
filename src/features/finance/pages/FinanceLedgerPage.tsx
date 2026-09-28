import React, { useState, useEffect } from "react";
import { financeApi, type Transaction, type KasDataResponse } from "../api/financeApi";
import { formatRp } from "../../../utils/format";
import { useToast } from "../../../contexts/ToastContext";
import { KasPrintModal } from "../components/KasPrintModal";

export const FinanceLedgerPage: React.FC = () => {
  const { showToast } = useToast();

  const [kasType, setKasType] = useState<"main" | "kas_amil">("main");
  const [loading, setLoading] = useState(true);
  const [kasData, setKasData] = useState<KasDataResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [txForm, setTxForm] = useState({
    transaction_date: new Date().toISOString().slice(0, 10),
    account_name: "",
    description: "",
    transaction_type: "DEBIT" as "DEBIT" | "CREDIT",
    amount: 0,
  });

  // Carry Forward State
  const [isCarryModalOpen, setIsCarryModalOpen] = useState(false);
  const [carryMonth, setCarryMonth] = useState("");

  // Print State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printMode, setPrintMode] = useState<"rincian" | "rekap">("rincian");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await financeApi.getKasTransactions(kasType);
      setKasData(res);
    } catch (err: any) {
      showToast(err.message || "Gagal memuat data kas", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [kasType]);

  const handleOpenAddModal = () => {
    setEditingTx(null);
    setTxForm({
      transaction_date: new Date().toISOString().slice(0, 10),
      account_name: "",
      description: "",
      transaction_type: "DEBIT",
      amount: 0,
    });
    setIsTxModalOpen(true);
  };

  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    const deb = Number(tx.debit) || 0;
    const kre = Number(tx.credit) || 0;
    setTxForm({
      transaction_date: tx.transaction_date || new Date().toISOString().slice(0, 10),
      account_name: tx.account_name || "",
      description: tx.description || "",
      transaction_type: deb > 0 ? "DEBIT" : "CREDIT",
      amount: deb > 0 ? deb : kre,
    });
    setIsTxModalOpen(true);
  };

  const handleSubmitTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm.description.trim()) {
      showToast("Keterangan wajib diisi", "error");
      return;
    }
    if (txForm.amount <= 0) {
      showToast("Jumlah nominal harus lebih besar dari 0", "error");
      return;
    }

    try {
      const deb = txForm.transaction_type === "DEBIT" ? txForm.amount : 0;
      const kre = txForm.transaction_type === "CREDIT" ? txForm.amount : 0;

      if (editingTx && editingTx.no) {
        await financeApi.editTransaction(
          {
            no: editingTx.no,
            transaction_date: txForm.transaction_date,
            account_name: txForm.account_name,
            description: txForm.description,
            transaction_type: txForm.transaction_type,
            debit: deb,
            credit: kre,
          },
          kasType
        );
        showToast("Transaksi berhasil diperbarui", "success");
      } else {
        await financeApi.addTransaction(
          {
            transaction_date: txForm.transaction_date,
            account_name: txForm.account_name,
            description: txForm.description,
            transaction_type: txForm.transaction_type,
            debit: deb,
            credit: kre,
          },
          kasType
        );
        showToast("Transaksi berhasil ditambahkan", "success");
      }
      setIsTxModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || "Gagal menyimpan transaksi", "error");
    }
  };

  const handleDeleteTx = async (txNo: number) => {
    if (!window.confirm("Yakin ingin menghapus transaksi ini?")) return;
    try {
      await financeApi.deleteTransaction(txNo, kasType);
      showToast("Transaksi berhasil dihapus", "success");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Gagal menghapus transaksi", "error");
    }
  };

  const handleCarryForward = async () => {
    if (!carryMonth) {
      showToast("Pilih bulan target terlebih dahulu", "error");
      return;
    }
    try {
      const res = await financeApi.carryForwardBalance(carryMonth, kasType);
      if (res.success) {
        showToast(res.message || "Saldo awal berhasil dibawa ke bulan berikutnya", "success");
        setIsCarryModalOpen(false);
        loadData();
      } else {
        showToast(res.message || "Gagal membuat saldo awal", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Gagal membawa saldo", "error");
    }
  };

  const filteredTransactions = (kasData?.transactions || []).filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.description || "").toLowerCase().includes(q) ||
      (t.account_name || "").toLowerCase().includes(q) ||
      (t.transaction_date || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Kas Type Segmented Switch */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setKasType("main")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              kasType === "main"
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Kas Utama
          </button>
          <button
            onClick={() => setKasType("kas_amil")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              kasType === "kas_amil"
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Kas Amil
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
          >
            <span>+ Tambah Transaksi</span>
          </button>
          <button
            onClick={() => setIsCarryModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"
          >
            Bawa Saldo Awal
          </button>
          <button
            onClick={() => {
              setPrintMode("rekap");
              setIsPrintModalOpen(true);
            }}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"
          >
            Cetak Rekap
          </button>
          <button
            onClick={() => {
              setPrintMode("rincian");
              setIsPrintModalOpen(true);
            }}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium transition-colors"
          >
            Cetak Rincian
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Saldo Awal</p>
          <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">
            {formatRp(kasData?.initial_balance || 0)}
          </h4>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Penerimaan (Debet)</p>
          <h4 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatRp(kasData?.total_debit || 0)}
          </h4>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-rose-500">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Pengeluaran (Kredit)</p>
          <h4 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {formatRp(kasData?.total_credit || 0)}
          </h4>
        </div>
        <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-5 rounded-2xl shadow-md">
          <p className="text-xs font-medium text-emerald-200">Saldo Akhir</p>
          <h4 className="text-xl font-bold text-white mt-1">
            {formatRp(kasData?.ending_balance || 0)}
          </h4>
        </div>
      </div>

      {/* Search & Transaction Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Cari transaksi atau akun..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-sm px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border-0 focus:ring-2 focus:ring-emerald-500"
          />
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Total: {filteredTransactions.length} transaksi
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Memuat data kas...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">Tidak ada transaksi ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-center w-12">No</th>
                  <th className="px-4 py-3 w-28">Tanggal</th>
                  <th className="px-4 py-3 w-36">Akun / Kategori</th>
                  <th className="px-4 py-3">Keterangan</th>
                  <th className="px-4 py-3 text-right">Debet</th>
                  <th className="px-4 py-3 text-right">Kredit</th>
                  <th className="px-4 py-3 text-right">Saldo</th>
                  <th className="px-4 py-3 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredTransactions.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-center text-slate-400 font-mono text-xs">{idx + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{t.transaction_date}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{t.account_name || "Lainnya"}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{t.description}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">
                      {Number(t.debit) > 0 ? formatRp(Number(t.debit)) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-rose-600 dark:text-rose-400">
                      {Number(t.credit) > 0 ? formatRp(Number(t.credit)) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                      {formatRp(Number(t.balance) || 0)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(t)}
                          className="text-emerald-600 hover:text-emerald-700 font-medium text-xs"
                        >
                          Edit
                        </button>
                        {t.no && (
                          <button
                            onClick={() => handleDeleteTx(t.no!)}
                            className="text-rose-600 hover:text-rose-700 font-medium text-xs"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add/Edit Transaction */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {editingTx ? "Edit Transaksi Kas" : "Tambah Transaksi Kas Baru"}
            </h3>
            <form onSubmit={handleSubmitTx} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={txForm.transaction_date}
                  onChange={(e) => setTxForm({ ...txForm, transaction_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border-0"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Jenis Transaksi</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-emerald-600 cursor-pointer">
                    <input
                      type="radio"
                      name="jenis"
                      value="DEBIT"
                      checked={txForm.transaction_type === "DEBIT"}
                      onChange={() => setTxForm({ ...txForm, transaction_type: "DEBIT" })}
                    />
                    <span>Penerimaan (Debet)</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-rose-600 cursor-pointer">
                    <input
                      type="radio"
                      name="jenis"
                      value="CREDIT"
                      checked={txForm.transaction_type === "CREDIT"}
                      onChange={() => setTxForm({ ...txForm, transaction_type: "CREDIT" })}
                    />
                    <span>Pengeluaran (Kredit)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Akun / Kategori</label>
                <input
                  type="text"
                  placeholder="Contoh: Infaq Jamaah, Listrik, Konsumsi"
                  value={txForm.account_name}
                  onChange={(e) => setTxForm({ ...txForm, account_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border-0"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Keterangan Detail</label>
                <input
                  type="text"
                  placeholder="Uraian transaksi lengkap"
                  value={txForm.description}
                  onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border-0"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={txForm.amount || ""}
                  onChange={(e) => setTxForm({ ...txForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border-0 font-mono font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Carry Forward Modal */}
      {isCarryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Bawa Saldo Awal ke Bulan Berikutnya</h3>
            <p className="text-xs text-slate-500">
              Sistem akan otomatis menghitung saldo akhir bulan ini dan mencatatnya sebagai "SALDO AWAL" di bulan yang dipilih.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Bulan Target (YYYY-MM)</label>
              <input
                type="month"
                value={carryMonth}
                onChange={(e) => setCarryMonth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border-0 font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setIsCarryModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl text-sm font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCarryForward}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold"
              >
                Proses Saldo Awal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      <KasPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        transactions={kasData?.transactions || []}
        initial_balance={kasData?.initial_balance || 0}
        ending_balance={kasData?.ending_balance || 0}
        period_label={new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
        kas_type_label={kasType === "kas_amil" ? "Kas Amil" : "Kas Utama"}
        mode={printMode}
      />
    </div>
  );
};
