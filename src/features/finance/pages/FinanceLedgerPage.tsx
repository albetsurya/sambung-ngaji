import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { financeApi, type Transaction, type KasDataResponse, type CashType } from "../api/financeApi";
import { formatRp } from "../../../utils/format";
import { useToast } from "../../../contexts/ToastContext";
import { usePermission } from "../../../hooks/usePermission";
import { AppLayout, Header, FloatingActionButton } from "../../../components/layout/AppLayout";
import {
  Button,
  Input,
  FilterChip,
  Segmented,
  GroupedList,
  ListRow,
  ChevronRow,
  BottomSheet,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Card,
} from "../../../components/common";
import { GroupedListSkeleton } from "../../../components/common/Skeleton";
import {
  Plus,
  Minus,
  Printer,
  RefreshCw,
  Search,
  Landmark,
} from "../../../components/common/FontAwesomeIcons";
import { useFinanceSync } from "../hooks/useFinanceSync";
import { KasPrintModal } from "../components/KasPrintModal";
import { ApiError } from "../../../services/api";

export const FinanceLedgerPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { assignedGroup, isSuperAdmin } = usePermission();

  const [cashType, setCashType] = useState<CashType>("main");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [kasData, setKasData] = useState<KasDataResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [showAllTx, setShowAllTx] = useState(false);

  const [isTxSheetOpen, setIsTxSheetOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [txForm, setTxForm] = useState({
    transaction_date: new Date().toISOString().slice(0, 10),
    account_name: "",
    description: "",
    transaction_type: "DEBIT" as "DEBIT" | "CREDIT",
    amount: 0,
  });
  const [savingTx, setSavingTx] = useState(false);

  const [isCarrySheetOpen, setIsCarrySheetOpen] = useState(false);
  const [carryMonth, setCarryMonth] = useState("");
  const [carryingOver, setCarryingOver] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printMode, setPrintMode] = useState<"rincian" | "rekap">("rincian");

  const loadData = async () => {
    if (!assignedGroup) {
      setKasData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const res = await financeApi.getKasTransactions(assignedGroup, cashType);
      setKasData(res);
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : "Gagal memuat data kas";
      setLoadError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [cashType, assignedGroup]);

  const { syncing: syncingSheet, sync: syncSheet } = useFinanceSync(loadData);

  const handleOpenAddSheet = () => {
    setEditingTx(null);
    setTxForm({
      transaction_date: new Date().toISOString().slice(0, 10),
      account_name: "",
      description: "",
      transaction_type: "DEBIT",
      amount: 0,
    });
    setIsTxSheetOpen(true);
  };

  const handleOpenEditSheet = (tx: Transaction) => {
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
    setIsTxSheetOpen(true);
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
    setSavingTx(true);
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
      setIsTxSheetOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err instanceof ApiError ? err.message : "Gagal menyimpan transaksi", "error");
    } finally {
      setSavingTx(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.cash_id) return;
    setDeleting(true);
    try {
      await financeApi.deleteTransaction(assignedGroup, deleteTarget.cash_id, cashType);
      showToast("Transaksi berhasil dihapus", "success");
      setDeleteTarget(null);
      setIsTxSheetOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err instanceof ApiError ? err.message : "Gagal menghapus transaksi", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleCarryForward = async () => {
    if (!carryMonth) {
      showToast("Pilih bulan target terlebih dahulu", "error");
      return;
    }
    setCarryingOver(true);
    try {
      const res = await financeApi.carryForwardBalance(assignedGroup, carryMonth, cashType);
      if (res.success) {
        showToast(res.message || "Saldo awal berhasil dibawa ke bulan berikutnya", "success");
        setIsCarrySheetOpen(false);
        loadData();
      } else {
        showToast(res.message || "Gagal membuat saldo awal", "error");
      }
    } catch (err: any) {
      showToast(err instanceof ApiError ? err.message : "Gagal membawa saldo", "error");
    } finally {
      setCarryingOver(false);
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

  const scopeData = useMemo(() => {
    if (selectedMonth === "all") {
      return {
        awal: kasData?.initial_balance || 0,
        debet: kasData?.total_debit || 0,
        kredit: kasData?.total_credit || 0,
        akhir: kasData?.ending_balance || 0,
        list: allTx,
      };
    }
    const isSaldoAwalRow = (t: Transaction) =>
      (t.account_name || "").trim().toUpperCase() === "SALDO AWAL";

    const monthTx = allTx.filter(
      (t) => (t.transaction_date || "").slice(0, 7) === selectedMonth
    );
    const before = allTx.filter(
      (t) => (t.transaction_date || "").slice(0, 7) < selectedMonth
    );

    const awal =
      before.length > 0
        ? Number(before[before.length - 1].balance) || 0
        : kasData?.initial_balance || 0;

    let debet = 0;
    let kredit = 0;
    monthTx.forEach((t) => {
      if (!isSaldoAwalRow(t)) {
        debet += Number(t.debit) || 0;
        kredit += Number(t.credit) || 0;
      }
    });

    const akhir =
      monthTx.length > 0 ? Number(monthTx[monthTx.length - 1].balance) || awal : awal;

    return {
      awal,
      debet,
      kredit,
      akhir,
      list: monthTx,
    };
  }, [selectedMonth, allTx, kasData]);

  const sumDebit = scopeData.debet;
  const sumCredit = scopeData.kredit;
  const openingBalance = scopeData.awal;
  const heroBalance = scopeData.akhir;
  const surplus = sumDebit - sumCredit;
  const periodTx = scopeData.list;

  const [fabOpen, setFabOpen] = useState(false);

  const filteredTransactions = periodTx.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.description || "").toLowerCase().includes(q) ||
      (t.account_name || "").toLowerCase().includes(q) ||
      (t.transaction_date || "").toLowerCase().includes(q)
    );
  });
  const visibleTx = showAllTx ? filteredTransactions : [...filteredTransactions].slice(-5).reverse();

  return (
    <AppLayout
      fab={
        <FloatingActionButton
          onClick={handleOpenAddSheet}
          label="Tambah Transaksi"
        />
      }
    >
      <Header
        title={cashType === "amil" ? "Kas Amil" : "Kas Utama"}
        subtitle={monthLabel(selectedMonth)}
        onBack={() => navigate("/lainnya")}
        backLabel="Lainnya"
        showSyncButton={false}
        right={
          <div className="flex items-center gap-1">
            {isSuperAdmin && (
              <Button
                variant="ghost"
                size="xs"
                iconOnly
                onClick={() => syncSheet(assignedGroup)}
                disabled={syncingSheet}
                aria-label="Sync dari spreadsheet"
                title="Sync dari spreadsheet"
              >
                <RefreshCw size={16} className={syncingSheet ? "animate-spin" : ""} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="xs"
              iconOnly
              onClick={() => {
                setPrintMode("rincian");
                setIsPrintModalOpen(true);
              }}
              aria-label="Cetak laporan"
              title="Cetak laporan"
            >
              <Printer size={16} />
            </Button>
          </div>
        }
      />

      <div className="py-4">
        {!assignedGroup ? (
          <EmptyState
            title="Kelompok belum dipilih"
            description={
              isSuperAdmin
                ? "Pilih kelompok dulu di menu Kelompok Saya untuk membuka kas kelompok."
                : "Akun Anda belum dipetakan ke kelompok. Hubungi admin."
            }
            icon={<Landmark size={26} className="text-accent" />}
            action={<Button size="sm" onClick={() => navigate("/lainnya")}>Ke Menu Lainnya</Button>}
          />
        ) : loadError && !kasData ? (
          <ErrorState message={loadError} onRetry={loadData} />
        ) : (
          <>
            <div className="px-4 mb-2.5">
              <Segmented<CashType>
                ariaLabel="Jenis kas"
                value={cashType}
                onChange={(v) => {
                  setCashType(v);
                  setSelectedMonth("all");
                }}
                options={[
                  { value: "main", label: "Kas Utama" },
                  { value: "amil", label: "Kas Amil" },
                ]}
              />
            </div>

            <section>
              <p className="px-4 mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-surface-muted">
                Periode
              </p>
              <div className="px-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {["all", ...monthOptions].map((m) => (
                  <FilterChip
                    key={m}
                    active={selectedMonth === m}
                    label={m === "all" ? "Semua Periode" : monthShort(m)}
                    onClick={() => setSelectedMonth(m)}
                  />
                ))}
              </div>
            </section>

            <section>
              <p className="px-4 mb-2.5 mt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-surface-muted">
                Ringkasan
              </p>
              <Card className="mx-4">
                <p className="text-ios-caption font-semibold uppercase tracking-wider text-surface-muted">
                  Saldo Kas {cashType === "amil" ? "Amil" : "Utama"}
                </p>
                <p className="font-display text-[30px] font-extrabold mt-1 leading-none text-surface-text">
                  {formatRp(heroBalance)}
                </p>
                <p className="text-ios-footnote mt-2 font-medium text-surface-muted">
                  {monthLabel(selectedMonth)}
                  <span className="mx-1.5 text-surface-muted/50">·</span>
                  <span className="font-bold text-surface-text">{periodTx.length} transaksi</span>
                </p>
                <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-surface-border">
                  <span className="text-ios-footnote font-medium text-surface-muted">
                    {selectedMonth === "all" ? "Saldo Awal (Awal Tahun)" : "Saldo Awal (Awal Bulan)"}
                  </span>
                  <span className="text-ios-footnote font-bold text-surface-text ml-auto">
                    {formatRp(selectedMonth === "all" ? kasData?.initial_balance || 0 : openingBalance)}
                  </span>
                </div>
              </Card>

              <div className="px-4 mt-2.5 grid grid-cols-2 gap-2.5">
                <Card className="!p-3.5">
                  <p className="text-ios-caption font-semibold uppercase tracking-wider text-success">Pemasukan</p>
                  <p className="font-display text-ios-nav font-extrabold mt-0.5 text-success">
                    {formatRp(sumDebit)}
                  </p>
                </Card>
                <Card className="!p-3.5">
                  <p className="text-ios-caption font-semibold uppercase tracking-wider text-danger">Pengeluaran</p>
                  <p className="font-display text-ios-nav font-extrabold mt-0.5 text-danger">
                    {formatRp(sumCredit)}
                  </p>
                </Card>
              </div>

              <GroupedList>
                <ListRow insetDivider={false}>
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div className="min-w-0">
                      <p className="text-ios-body font-medium text-surface-text">Surplus Periode Ini</p>
                      <p className="font-display text-ios-nav font-extrabold text-surface-text">
                        {formatRp(surplus)}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-ios-caption font-bold shrink-0 ${
                        surplus >= 0
                          ? "bg-success-soft text-success"
                          : "bg-danger-soft text-danger"
                      }`}
                    >
                      {surplus >= 0 ? "Surplus" : "Defisit"}
                    </span>
                  </div>
                </ListRow>
              </GroupedList>
            </section>

            <section>
              <div className="px-4 mb-2.5 mt-5 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-surface-muted">
                  {showAllTx ? "Riwayat Transaksi" : "Transaksi Terbaru"}
                </p>
                <button
                  onClick={() => setShowAllTx((v) => !v)}
                  className="text-ios-footnote font-semibold text-accent active:scale-[0.97]"
                >
                  {showAllTx ? "Tutup" : "Lihat semua"}
                </button>
              </div>

              {showAllTx && (
                <div className="px-4 mb-2.5">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari tanggal, kategori, keterangan…"
                  />
                </div>
              )}

              {loading ? (
                <GroupedListSkeleton rows={5} />
              ) : visibleTx.length === 0 ? (
                <EmptyState
                  title="Belum ada transaksi"
                  description={
                    searchQuery
                      ? "Tidak ada transaksi yang cocok dengan pencarian."
                      : "Catat transaksi pertama memakai tombol + di bawah."
                  }
                />
              ) : (
                <GroupedList>
                  {visibleTx.map((t, idx) => {
                    const isIn = (Number(t.debit) || 0) > 0;
                    return (
                      <ListRow
                        key={t.cash_id || idx}
                        onClick={() => handleOpenEditSheet(t)}
                        insetDivider={idx !== visibleTx.length - 1}
                        leading={
                          <span
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isIn
                                ? "bg-success-soft text-success"
                                : "bg-danger-soft text-danger"
                            }`}
                          >
                            {isIn ? <Plus size={15} /> : <Minus size={15} />}
                          </span>
                        }
                      >
                        <ChevronRow>
                          <div className="flex items-center justify-between gap-2 w-full">
                            <div className="min-w-0 flex-1">
                              <p className="text-ios-body font-medium text-surface-text truncate">
                                {t.description || "—"}
                              </p>
                              <p className="text-ios-caption text-surface-muted truncate">
                                {t.transaction_date}
                                {t.account_name ? ` · ${t.account_name}` : ""}
                              </p>
                            </div>
                            <p
                              className={`font-mono text-ios-subhead font-bold shrink-0 ${
                                isIn ? "text-success" : "text-danger"
                              }`}
                            >
                              {isIn ? "+" : "−"}
                              {formatRp(isIn ? Number(t.debit) : Number(t.credit))}
                            </p>
                          </div>
                        </ChevronRow>
                      </ListRow>
                    );
                  })}
                </GroupedList>
              )}

              <div className="px-4 mt-2.5 grid grid-cols-2 gap-2.5">
                <Button variant="secondary" size="sm" onClick={() => setIsCarrySheetOpen(true)}>
                  Bawa Saldo Awal
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setPrintMode("rekap");
                    setIsPrintModalOpen(true);
                  }}
                >
                  Cetak Rekap
                </Button>
              </div>
            </section>
          </>
        )}
      </div>

      <BottomSheet
        open={isTxSheetOpen}
        onClose={() => setIsTxSheetOpen(false)}
        title={editingTx ? "Edit Transaksi" : "Tambah Transaksi"}
      >
        <form onSubmit={handleSubmitTx}>
          <Input
            label="Tanggal"
            type="date"
            value={txForm.transaction_date}
            onChange={(e) => setTxForm({ ...txForm, transaction_date: e.target.value })}
            required
          />
          <div className="mb-4">
            <p className="text-ios-footnote font-medium text-surface-muted mb-2 px-1">
              Jenis Transaksi
            </p>
            <Segmented<"DEBIT" | "CREDIT">
              ariaLabel="Jenis transaksi"
              value={txForm.transaction_type}
              onChange={(v) => setTxForm({ ...txForm, transaction_type: v })}
              options={[
                { value: "DEBIT", label: "Penerimaan" },
                { value: "CREDIT", label: "Pengeluaran" },
              ]}
            />
          </div>
          <Input
            label="Akun / Kategori"
            placeholder="Contoh: Infaq Jamaah, Listrik, Konsumsi"
            value={txForm.account_name}
            onChange={(e) => setTxForm({ ...txForm, account_name: e.target.value })}
          />
          <Input
            label="Keterangan"
            placeholder="Uraian transaksi"
            value={txForm.description}
            onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
            required
          />
          <Input
            label="Nominal (Rp)"
            type="number"
            placeholder="0"
            value={txForm.amount || ""}
            onChange={(e) => setTxForm({ ...txForm, amount: Number(e.target.value) })}
            required
          />
          <Button type="submit" fullWidth disabled={savingTx}>
            {savingTx ? "Menyimpan…" : editingTx ? "Simpan Perubahan" : "Simpan Transaksi"}
          </Button>
          {editingTx?.cash_id && (
            <Button
              type="button"
              variant="softDanger"
              fullWidth
              className="mt-2.5"
              onClick={() => setDeleteTarget(editingTx)}
            >
              Hapus Transaksi
            </Button>
          )}
        </form>
      </BottomSheet>

      <BottomSheet
        open={isCarrySheetOpen}
        onClose={() => setIsCarrySheetOpen(false)}
        title="Bawa Saldo Awal"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCarryForward();
          }}
        >
          <p className="text-ios-footnote text-surface-muted mb-4 px-1">
            Saldo akhir bulan ini dicatat otomatis sebagai “SALDO AWAL” di bulan target.
          </p>
          <Input
            label="Bulan Target (YYYY-MM)"
            type="month"
            value={carryMonth}
            onChange={(e) => setCarryMonth(e.target.value)}
            required
          />
          <Button type="submit" fullWidth disabled={carryingOver}>
            {carryingOver ? "Memproses…" : "Proses Saldo Awal"}
          </Button>
        </form>
      </BottomSheet>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus transaksi?"
        description={`“${deleteTarget?.description}” (${deleteTarget ? formatRp(Number(deleteTarget.debit) || Number(deleteTarget.credit)) : ""}) akan dihapus permanen.`}
        confirmLabel="Ya, hapus"
        danger
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <KasPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        transactions={periodTx}
        initial_balance={openingBalance}
        ending_balance={heroBalance}
        period_label={monthLabel(selectedMonth)}
        cash_type_label={cashType === "amil" ? "Kas Amil" : "Kas Utama"}
        mode={printMode}
      />
    </AppLayout>
  );
};
