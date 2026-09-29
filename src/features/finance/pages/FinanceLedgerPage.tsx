import React, { useState, useEffect } from "react";
import { financeApi, type Transaction, type KasDataResponse, type CashType } from "../api/financeApi";
import { formatRp } from "../../../utils/format";
import { useToast } from "../../../contexts/ToastContext";
import { usePermission } from "../../../hooks/usePermission";
import { KasPrintModal } from "../components/KasPrintModal";

export const FinanceLedgerPage: React.FC = () => {
  const { showToast } = useToast();
  const { assignedGroup, isSuperAdmin } = usePermission();

  const [cashType, setKasType] = useState<CashType>("main");
  const [loading, setLoading] = useState(true);
  const [kasData, setKasData] = useState<KasDataResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");

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
    if (!assignedGroup) {
      setKasData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await financeApi.getKasTransactions(assignedGroup, cashType);
      setKasData(res);
    } catch (err: any) {
      showToast(err.message || "Gagal memuat data kas", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [cashType, assignedGroup]);

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

      if (editingTx && editingTx.cash_id) {
        await financeApi.editTransaction(
          assignedGroup,
          {
            cash_id: editingTx.cash_id,
            transaction_date: txForm.transaction_date,
            account_name: txForm.account_name,
            description: txForm.description,
            transaction_type: txForm.transaction_type,
            debit: deb,
            credit: kre,
          },
          cashType
        );
        showToast("Transaksi berhasil diperbarui", "success");
      } else {
        await financeApi.addTransaction(
          assignedGroup,
          {
            transaction_date: txForm.transaction_date,
            account_name: txForm.account_name,
            description: txForm.description,
            transaction_type: txForm.transaction_type,
            debit: deb,
            credit: kre,
          },
          cashType
        );
        showToast("Transaksi berhasil ditambahkan", "success");
      }
      setIsTxModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || "Gagal menyimpan transaksi", "error");
    }
  };

  const handleDeleteTx = async (tx: Transaction) => {
    if (!tx.cash_id) return;
    if (!window.confirm("Yakin ingin menghapus transaksi ini?")) return;
    try {
      await financeApi.deleteTransaction(assignedGroup, tx.cash_id, cashType);
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
      const res = await financeApi.carryForwardBalance(assignedGroup, carryMonth, cashType);
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

  const monthOptions = Array.from(
    new Set(
      (kasData?.transactions || [])
        .map((t) => (t.transaction_date || "").slice(0, 7))
        .filter(Boolean)
    )
  ).sort();

  const monthLabel = (key: string) => {
    if (key === "all") return "Semua Periode";
    const [y, m] = key.split("-");
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
  };
  const monthShort = (key: string) => {
    if (key === "all") return "Semua";
    const [y, m] = key.split("-");
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("id-ID", {
      month: "short",
      year: "2-digit",
    });
  };

  const allTx = kasData?.transactions || [];
  const periodTx =
    selectedMonth === "all"
      ? allTx
      : allTx.filter((t) => (t.transaction_date || "").slice(0, 7) === selectedMonth);
  const sumDebit = periodTx.reduce((s, t) => s + (Number(t.debit) || 0), 0);
  const sumCredit = periodTx.reduce((s, t) => s + (Number(t.credit) || 0), 0);
  const openingBalance = (() => {
    if (selectedMonth === "all" || periodTx.length === 0) return 0;
    const firstId = periodTx[0].cash_id;
    const idx = allTx.findIndex((t) => t.cash_id === firstId);
    if (idx <= 0) return 0;
    return Number(allTx[idx - 1].balance) || 0;
  })();
  const periodEnding = openingBalance + sumDebit - sumCredit;
  const surplus = sumDebit - sumCredit;

  const [showAllTx, setShowAllTx] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  const filteredTransactions = (kasData?.transactions || []).filter((t) => {
    if (selectedMonth !== "all" && (t.transaction_date || "").slice(0, 7) !== selectedMonth)
      return false;
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
              cashType === "main"
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Kas Utama
          </button>
          <button
            onClick={() => setKasType("amil")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              cashType === "amil"
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

      {/* Period Filter */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Periode
        </span>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="ml-auto px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold text-slate-800 dark:text-slate-100 border-0"
          aria-label="Pilih periode"
        >
          <option value="all">Semua Periode</option>
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
        </select>
      </div>

      {/* Hero: Saldo Kas */}
      <div className="bg-white dark:bg-slate-900 px-6 pt-6 pb-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <p className="font-bold text-xs tracking-wider uppercase text-slate-500 dark:text-slate-400">
          Saldo Kas {cashType === "amil" ? "Amil" : "Utama"}
        </p>
        <p className="font-mono text-3xl font-extrabold mt-1.5 leading-none text-slate-900 dark:text-white">
          {formatRp(selectedMonth === "all" ? kasData?.ending_balance || 0 : periodEnding)}
        </p>
        <p className="text-xs mt-2 font-semibold tracking-wide text-slate-500 dark:text-slate-400">
          <span>{monthLabel(selectedMonth)}</span>
          <span className="mx-1 text-slate-300">·</span>
          <span className="font-extrabold text-slate-800 dark:text-slate-100">
            {periodTx.length} transaksi
          </span>
        </p>
        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {selectedMonth === "all" ? "Saldo Awal (Awal Tahun)" : "Saldo Awal (Awal Bulan)"}
          </span>
          <span className="text-xs text-slate-300">·</span>
          <span className="font-mono text-sm font-extrabold text-slate-800 dark:text-slate-100">
            {formatRp(selectedMonth === "all" ? 0 : openingBalance)}
          </span>
        </div>
      </div>

      {/* Pemasukan / Pengeluaran */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Pemasukan</p>
          <p className="font-mono text-base font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">
            {formatRp(sumDebit)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Pengeluaran</p>
          <p className="font-mono text-base font-extrabold mt-1 text-rose-600 dark:text-rose-400">
            {formatRp(sumCredit)}
          </p>
        </div>
      </div>

      {/* Surplus */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Surplus Periode Ini
          </p>
          <p className="font-mono text-base font-extrabold mt-1 text-slate-800 dark:text-slate-100">
            {formatRp(surplus)}
          </p>
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            surplus >= 0
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
          }`}
        >
          {surplus >= 0 ? "Surplus" : "Defisit"}
        </span>
      </div>

      {!assignedGroup && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-sm text-amber-800 dark:text-amber-200">
          {isSuperAdmin
            ? "Pilih kelompok dulu (menu Lainnya → Kelompok Saya) untuk membuka kas kelompok."
            : "Akun Anda belum dipetakan ke kelompok. Hubungi admin."}
        </div>
      )}

      {/* Transaksi Terbaru */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
            {showAllTx ? "Riwayat Transaksi" : "Transaksi Terbaru"}
          </h2>
          <button
            onClick={() => setShowAllTx((v) => !v)}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400"
          >
            {showAllTx ? "Tutup" : "Lihat semua"}
          </button>
        </div>

        {showAllTx && (
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <input
              type="text"
              placeholder="Cari tanggal, kategori, keterangan…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-sm px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border-0 focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              Total: {filteredTransactions.length} transaksi
            </span>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Memuat data kas...</div>
        ) : (showAllTx ? filteredTransactions : [...filteredTransactions].slice(-5).reverse()).length === 0 ? (
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
                {(showAllTx ? filteredTransactions : [...filteredTransactions].slice(-5).reverse()).map((t, idx) => (
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
                        {t.cash_id && (
                          <button
                            onClick={() => handleDeleteTx(t)}
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

      {/* FAB Speed-dial */}
      <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-2">
        {fabOpen && (
          <>
            <button
              onClick={() => {
                setFabOpen(false);
                setIsCarryModalOpen(true);
              }}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 shadow-lg"
            >
              Bawa Saldo Awal
            </button>
            <button
              onClick={() => {
                setFabOpen(false);
                setPrintMode("rincian");
                setIsPrintModalOpen(true);
              }}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 shadow-lg"
            >
              Cetak Laporan
            </button>
            <button
              onClick={() => {
                setFabOpen(false);
                handleOpenAddModal();
              }}
              className="px-4 py-2.5 bg-emerald-600 rounded-full text-xs font-bold text-white shadow-lg"
            >
              + Tambah Transaksi
            </button>
          </>
        )}
        <button
          onClick={() => setFabOpen((v) => !v)}
          aria-label="Menu cepat kas"
          className={`w-14 h-14 rounded-full text-2xl font-bold text-white shadow-xl transition-transform ${
            fabOpen ? "bg-slate-700 rotate-45" : "bg-emerald-600"
          }`}
        >
          +
        </button>
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
        cash_type_label={cashType === "amil" ? "Kas Amil" : "Kas Utama"}
        mode={printMode}
      />
    </div>
  );
};
