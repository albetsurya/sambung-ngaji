import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  financeApi,
  type Transaction,
  type KasDataResponse,
  type CashType,
} from "../api/financeApi";
import { formatRp, formatDateShort, toTitleCase } from "../../../utils/format";
import { useToast } from "../../../contexts/ToastContext";
import { usePermission } from "../../../hooks/usePermission";
import {
  AppLayout,
  Header,
  FloatingActionButton,
} from "../../../components/layout/AppLayout";
import {
  Button,
  Input,
  Select,
  DateInput,
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
} from "../../../components/ui";
import { GroupedListSkeleton } from "../../../components/ui/Skeleton";
import { Check, Landmark } from "../../../components/ui/FontAwesomeIcons";
import { useFinanceSync } from "../hooks/useFinanceSync";
import {
  SectionTitle,
  HeaderActions,
  SyncHeaderButton,
  PrintHeaderButton,
  NoGroupEmpty,
  SheetFooter,
} from "../components/FinanceShared";
import {
  cashAccountOptions,
  isShodaqohPostedAccount,
} from "../components/cashAccounts";
import { ApiError } from "../../../services/api";

type BreakdownTab = "overview" | "in" | "out";

const isSaldoAwal = (t: Transaction) =>
  (t.account_name || "").trim().toUpperCase() === "SALDO AWAL";

const accountOf = (t: Transaction) =>
  (t.account_name || "").trim() || "Tanpa Kategori";

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

export const KasBreakdownPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { showToast } = useToast();
  const { assignedGroup, isSuperAdmin } = usePermission();
  const [cashType, setCashType] = useState<CashType>(
    params.get("cash") === "amil" ? "amil" : "main",
  );
  const [selectedMonth, setSelectedMonth] = useState(
    params.get("month") || "latest",
  );
  const [tab, setTab] = useState<BreakdownTab>("overview");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [kasData, setKasData] = useState<KasDataResponse | null>(null);
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(
    new Set(),
  );
  const [printMenuOpen, setPrintMenuOpen] = useState(false);
  const [isCarrySheetOpen, setIsCarrySheetOpen] = useState(false);
  const [carryMonth, setCarryMonth] = useState("");
  const [carryingOver, setCarryingOver] = useState(false);

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
      const msg =
        err instanceof ApiError ? err.message : "Gagal memuat data kas";
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

  const allTx = kasData?.transactions || [];
  const monthOptions = useMemo(
    () =>
      Array.from(
        new Set(
          allTx.map((t) => (t.transaction_date || "").slice(0, 7)).filter(Boolean),
        ),
      ).sort(),
    [allTx],
  );

  const activeMonth =
    selectedMonth !== "latest" && monthOptions.includes(selectedMonth)
      ? selectedMonth
      : monthOptions[monthOptions.length - 1] || "";

  const monthTx = useMemo(
    () =>
      allTx.filter(
        (t) =>
          (t.transaction_date || "").slice(0, 7) === activeMonth &&
          !isSaldoAwal(t),
      ),
    [allTx, activeMonth],
  );

  const incomeTx = useMemo(
    () => monthTx.filter((t) => (Number(t.debit) || 0) > 0),
    [monthTx],
  );
  const expenseTx = useMemo(
    () => monthTx.filter((t) => (Number(t.credit) || 0) > 0),
    [monthTx],
  );

  const incomeAccounts = useMemo(
    () => Array.from(new Set(incomeTx.map(accountOf))).sort(),
    [incomeTx],
  );
  const expenseAccounts = useMemo(
    () => Array.from(new Set(expenseTx.map(accountOf))).sort(),
    [expenseTx],
  );

  // Ganti tab: reset ke kategori tab baru, KECUALI akun pindahan shodaqoh
  // (jurnal otomatis posting tidak dicentang default agar tidak tercampur
  // transaksi manual; user bisa mengetuk chip-nya untuk menyertakan).
  // Ganti bulan/jenis kas: pilihan dipertahankan, yang tak ada bulan ini dibuang.
  useEffect(() => {
    const pool = tab === "out" ? expenseAccounts : incomeAccounts;
    setSelectedAccounts(
      new Set(pool.filter((a) => !isShodaqohPostedAccount(a))),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);
  useEffect(() => {
    const pool = new Set(tab === "out" ? expenseAccounts : incomeAccounts);
    setSelectedAccounts((prev) => {
      const kept = [...prev].filter((a) => pool.has(a));
      if (kept.length === prev.size) return prev;
      return new Set(kept);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMonth, cashType]);
  // Pilihan baris tidak dibawa pindah tab/bulan.
  useEffect(() => {
    setSelectedIds(new Set());
    setSelectMode(false);
  }, [tab, activeMonth, cashType]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  // Mode pilih (centang banyak) vs mode aksi (ketuk = sheet edit/hapus/duplikat).
  // Default mode aksi agar konsisten dengan halaman Kas; mode pilih hanya aktif
  // lewat tombol "Pilih" dan otomatis mati saat pindah tab/bulan/jenis kas.
  const [selectMode, setSelectMode] = useState(false);
  const [actionTx, setActionTx] = useState<Transaction | null>(null);
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
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const txKey = (t: Transaction, idx: number) => t.cash_id || `row-${idx}`;
  const toggleSelect = (key: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const toggleAccount = (name: string) =>
    setSelectedAccounts((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const handleCarryForward = async () => {
    if (!carryMonth) {
      showToast("Pilih bulan target terlebih dahulu", "error");
      return;
    }
    setCarryingOver(true);
    try {
      const res = await financeApi.carryForwardBalance(
        assignedGroup,
        carryMonth,
        cashType,
      );
      if (res.success) {
        showToast(
          res.message || "Saldo awal berhasil dibawa ke bulan berikutnya",
          "success",
        );
        setIsCarrySheetOpen(false);
        loadData();
      } else {
        showToast(res.message || "Gagal membuat saldo awal", "error");
      }
    } catch (err: any) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal membawa saldo",
        "error",
      );
    } finally {
      setCarryingOver(false);
    }
  };

  // Tanggal default transaksi baru mengikuti bulan yang sedang dirinci:
  // bulan berjalan = hari ini, bulan lain = tanggal 1 bulan tersebut.
  const defaultTxDate = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (!activeMonth) return today;
    if (activeMonth === today.slice(0, 7)) return today;
    return `${activeMonth}-01`;
  };

  const handleOpenAddSheet = () => {
    setEditingTx(null);
    setTxForm({
      transaction_date: defaultTxDate(),
      account_name: "",
      description: "",
      transaction_type: tab === "out" ? "CREDIT" : "DEBIT",
      amount: 0,
    });
    setIsTxSheetOpen(true);
  };

  const handleOpenEditSheet = (tx: Transaction) => {
    setEditingTx(tx);
    const deb = Number(tx.debit) || 0;
    const kre = Number(tx.credit) || 0;
    setTxForm({
      transaction_date:
        tx.transaction_date || new Date().toISOString().slice(0, 10),
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
    if (!txForm.account_name.trim()) {
      showToast("Kategori wajib dipilih", "error");
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
      if (editingTx?.cash_id) {
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
          cashType,
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
          cashType,
        );
        showToast("Transaksi berhasil ditambahkan", "success");
      }
      setIsTxSheetOpen(false);
      setEditingTx(null);
      setSelectMode(false);
      setSelectedIds(new Set());
      loadData();
    } catch (err: any) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menyimpan transaksi",
        "error",
      );
    } finally {
      setSavingTx(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.cash_id) return;
    setDeleting(true);
    try {
      await financeApi.deleteTransaction(
        assignedGroup,
        deleteTarget.cash_id,
        cashType,
      );
      showToast("Transaksi berhasil dihapus", "success");
      setDeleteTarget(null);
      setSelectMode(false);
      setSelectedIds(new Set());
      loadData();
    } catch (err: any) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menghapus transaksi",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicateTx = async (tx?: Transaction | null) => {
    const target = tx || editingTx;
    if (!target?.cash_id) return;
    setDuplicating(true);
    try {
      await financeApi.duplicateTransaction(assignedGroup, target, cashType);
      showToast("Transaksi berhasil diduplikat", "success");
      setSelectMode(false);
      setSelectedIds(new Set());
      loadData();
    } catch (err: any) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menduplikat transaksi",
        "error",
      );
    } finally {
      setDuplicating(false);
    }
  };

  const backToBreakdown = `/finance/ledger/breakdown?cash=${cashType}&month=${activeMonth || "latest"}`;
  const printUrl = (mode: "rincian" | "rekap") =>
    `/finance/ledger/print?mode=${mode}&cash=${cashType}&bulan=${activeMonth}&back=${encodeURIComponent(backToBreakdown)}`;

  const overview = useMemo(() => {
    const map = new Map<string, { masuk: number; keluar: number }>();
    for (const t of monthTx) {
      const cur = map.get(accountOf(t)) || { masuk: 0, keluar: 0 };
      cur.masuk += Number(t.debit) || 0;
      cur.keluar += Number(t.credit) || 0;
      map.set(accountOf(t), cur);
    }
    return [...map.entries()].sort(
      (a, b) => b[1].masuk + b[1].keluar - (a[1].masuk + a[1].keluar),
    );
  }, [monthTx]);

  const totalMasuk = overview.reduce((s, [, v]) => s + v.masuk, 0);
  const totalKeluar = overview.reduce((s, [, v]) => s + v.keluar, 0);

  const shownIncome = useMemo(() => {
    const list = incomeTx.filter((t) => selectedAccounts.has(accountOf(t)));
    return sortDir === "desc" ? list.slice().reverse() : list;
  }, [incomeTx, selectedAccounts, sortDir]);
  const shownExpense = useMemo(() => {
    const list = expenseTx.filter((t) => selectedAccounts.has(accountOf(t)));
    return sortDir === "desc" ? list.slice().reverse() : list;
  }, [expenseTx, selectedAccounts, sortDir]);
  const totalShownIncome = shownIncome.reduce(
    (s, t) => s + (Number(t.debit) || 0),
    0,
  );
  const totalShownExpense = shownExpense.reduce(
    (s, t) => s + (Number(t.credit) || 0),
    0,
  );

  const chipAccounts = tab === "out" ? expenseAccounts : incomeAccounts;
  const shownList = tab === "out" ? shownExpense : shownIncome;
  const shownTotal = tab === "out" ? totalShownExpense : totalShownIncome;
  const isOut = tab === "out";
  const selectedTotal = shownList.reduce((s, t, idx) => {
    if (!selectedIds.has(txKey(t, idx))) return s;
    return s + (isOut ? Number(t.credit) || 0 : Number(t.debit) || 0);
  }, 0);
  const selectedCount = shownList.filter((t, idx) =>
    selectedIds.has(txKey(t, idx)),
  ).length;
  const accountOptions = useMemo(
    () => cashAccountOptions(allTx, txForm.account_name),
    [allTx, txForm.account_name],
  );

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
        title="Rincian Kas"
        subtitle={`${cashType === "amil" ? "Kas Amil" : "Kas Utama"} · ${activeMonth ? monthLabel(activeMonth) : "-"}`}
        onBack={() => navigate("/finance/ledger")}
        backLabel="Kas"
        showSyncButton={false}
        right={
          <HeaderActions>
            {isSuperAdmin && (
              <SyncHeaderButton
                syncing={syncingSheet}
                onSync={() => syncSheet(assignedGroup)}
              />
            )}
            <div className="relative">
              <PrintHeaderButton onClick={() => setPrintMenuOpen((v) => !v)} />
              {printMenuOpen && (
                <div
                  className="absolute right-0 top-9 z-50 w-56 rounded-2xl border border-surface-border bg-surface-card shadow-lg p-1.5 anim-dropdown"
                  data-testid="kas-print-dropdown"
                >
                  <button
                    className="w-full text-left px-3 py-2.5 rounded-xl text-ios-body active:bg-surface-card2"
                    onClick={() => {
                      navigate(printUrl("rincian"));
                      setPrintMenuOpen(false);
                    }}
                    data-testid="btn-print-transaksi"
                  >
                    Cetak per transaksi
                  </button>
                  <button
                    className="w-full text-left px-3 py-2.5 rounded-xl text-ios-body active:bg-surface-card2"
                    onClick={() => {
                      navigate(printUrl("rekap"));
                      setPrintMenuOpen(false);
                    }}
                    data-testid="btn-print-kategori"
                  >
                    Cetak per kategori
                  </button>
                </div>
              )}
            </div>
          </HeaderActions>
        }
      />
      <div className="py-4">
        {!assignedGroup ? (
          <NoGroupEmpty
            module="kas"
            icon={<Landmark size={26} className="text-accent" />}
            isSuperAdmin={isSuperAdmin}
          />
        ) : loadError && !kasData ? (
          <ErrorState message={loadError} onRetry={loadData} />
        ) : (
          <>
            <div className="px-4 mb-2.5">
              <Segmented<CashType>
                ariaLabel="Jenis kas"
                value={cashType}
                onChange={(v) => setCashType(v)}
                options={[
                  { value: "main", label: "Kas Utama" },
                  { value: "amil", label: "Kas Amil" },
                ]}
              />
            </div>
            <section>
              <SectionTitle first>Bulan</SectionTitle>
              <div className="px-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {monthOptions.map((m) => (
                  <FilterChip
                    key={m}
                    active={activeMonth === m}
                    label={monthShort(m)}
                    onClick={() => setSelectedMonth(m)}
                  />
                ))}
              </div>
              <div className="px-4 mt-2.5">
                <Button
                  variant="secondary"
                  fullWidth
                  size="sm"
                  onClick={() => setIsCarrySheetOpen(true)}
                >
                  Jadikan Saldo Awal
                </Button>
              </div>
            </section>
            <div className="px-4 mt-2.5">
              <Segmented<BreakdownTab>
                ariaLabel="Jenis rincian"
                value={tab}
                onChange={setTab}
                options={[
                  { value: "overview", label: "Overview" },
                  { value: "in", label: "Pemasukan" },
                  { value: "out", label: "Pengeluaran" },
                ]}
              />
            </div>

            {loading ? (
              <GroupedListSkeleton rows={5} />
            ) : !activeMonth || monthTx.length === 0 ? (
              <EmptyState
                title="Belum ada transaksi"
                description={`Tidak ada pemasukan atau pengeluaran pada ${activeMonth ? monthLabel(activeMonth) : "bulan ini"}.`}
              />
            ) : tab === "overview" ? (
              <section>
                <SectionTitle>
                  Per Kategori · {monthLabel(activeMonth)}
                </SectionTitle>
                <GroupedList>
                  {overview.map(([name, v]) => (
                    <ListRow key={name} insetDivider={true}>
                      <div className="w-full">
                        <p className="text-ios-body font-semibold text-surface-text">
                          {toTitleCase(name)}
                        </p>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className="text-ios-caption text-success font-medium">
                            Masuk {formatRp(v.masuk)}
                          </p>
                          <p className="text-ios-caption text-danger font-medium">
                            Keluar {formatRp(v.keluar)}
                          </p>
                        </div>
                      </div>
                    </ListRow>
                  ))}
                  <ListRow insetDivider={false}>
                    <div className="w-full rounded-xl bg-surface-card2 px-3 py-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-ios-body font-extrabold text-surface-text">
                          Total
                        </p>
                        <p className="text-ios-caption font-bold text-surface-muted">
                          {overview.length} kategori
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className="text-ios-subhead font-extrabold text-success">
                          {formatRp(totalMasuk)}
                        </p>
                        <p className="text-ios-subhead font-extrabold text-danger">
                          {formatRp(totalKeluar)}
                        </p>
                      </div>
                      <p className="text-ios-caption text-surface-muted mt-1">
                        Net {formatRp(totalMasuk - totalKeluar)}
                      </p>
                    </div>
                  </ListRow>
                </GroupedList>
              </section>
            ) : (
              <section>
                <SectionTitle>
                  {isOut ? "Pengeluaran" : "Pemasukan"} ·{" "}
                  {monthLabel(activeMonth)}
                </SectionTitle>
                <div className="px-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {chipAccounts.map((a) => (
                    <FilterChip
                      key={a}
                      active={selectedAccounts.has(a)}
                      label={toTitleCase(a)}
                      onClick={() => toggleAccount(a)}
                    />
                  ))}
                </div>
                {/* Mode aksi (default): ketuk baris = sheet edit/hapus/duplikat.
                    Mode pilih: ketuk baris = centang untuk hitung subtotal. */}
                <div className="px-4 mt-1.5 flex items-center justify-between gap-2">
                  <p
                    className={`truncate ${selectMode ? "text-ios-footnote font-semibold text-accent" : "text-ios-footnote text-surface-muted"}`}
                  >
                    {selectMode
                      ? selectedCount > 0
                        ? `${selectedCount} dipilih · ${formatRp(selectedTotal)}`
                        : "Ketuk baris untuk memilih"
                      : `${shownList.length} transaksi · ketuk untuk aksi`}
                  </p>
                  <div className="flex items-center gap-3 shrink-0">
                    {selectMode ? (
                      <>
                        <button
                          onClick={() => setSelectedIds(new Set())}
                          className="text-ios-footnote font-semibold text-surface-muted active:scale-[0.97]"
                        >
                          Bersihkan
                        </button>
                        <button
                          onClick={() => {
                            setSelectMode(false);
                            setSelectedIds(new Set());
                          }}
                          className="text-ios-footnote font-semibold text-accent active:scale-[0.97]"
                        >
                          Selesai
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setSelectMode(true)}
                        className="text-ios-footnote font-semibold text-accent active:scale-[0.97]"
                        data-testid="btn-bd-select-mode"
                      >
                        Pilih
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setSortDir((d) => (d === "desc" ? "asc" : "desc"))
                      }
                      className="text-ios-footnote font-semibold text-accent active:scale-[0.97]"
                      aria-label="Ubah urutan tanggal"
                    >
                      {sortDir === "desc" ? "Terbaru ↓" : "Terlama ↑"}
                    </button>
                  </div>
                </div>
                {shownList.length === 0 ? (
                  <EmptyState
                    title="Tidak ada rincian"
                    description={
                      chipAccounts.length === 0
                        ? `Tidak ada ${isOut ? "pengeluaran" : "pemasukan"} pada bulan ini.`
                        : "Pilih minimal satu kategori untuk melihat rinciannya."
                    }
                  />
                ) : (
                  <GroupedList>
                    {shownList.map((t, idx) => {
                      const nominal = isOut
                        ? Number(t.credit) || 0
                        : Number(t.debit) || 0;
                      const checked = selectedIds.has(txKey(t, idx));
                      return (
                        // ponytail: key memuat status centang agar browser
                        // me-remount baris (repaint dijamin) tiap toggle.
                        <ListRow
                          key={`${t.cash_id || `row-${idx}`}-${checked ? "on" : "off"}`}
                          insetDivider={true}
                          onClick={() =>
                            selectMode
                              ? toggleSelect(txKey(t, idx))
                              : setActionTx(t)
                          }
                          data-testid="bd-tx-item"
                          className={selectMode && checked ? "bg-accent-soft" : ""}
                          style={
                            selectMode && checked
                              ? {
                                  backgroundColor:
                                    "rgb(var(--c-accent-light))",
                                }
                              : undefined
                          }
                          leading={
                            selectMode ? (
                              <span
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border-2 ${
                                  checked
                                    ? "bg-accent border-accent text-white"
                                    : "bg-surface-card border-surface-border text-transparent"
                                }`}
                              >
                                <Check size={15} strokeWidth={2.5} />
                              </span>
                            ) : undefined
                          }
                        >
                          {selectMode ? (
                            <div className="flex items-center justify-between gap-2 w-full">
                              <div className="min-w-0 flex-1">
                                <p className="text-ios-body font-medium text-surface-text truncate">
                                  {t.description || "-"}
                                </p>
                                <p className="text-ios-caption text-surface-muted truncate">
                                  {formatDateShort(t.transaction_date)}
                                  {t.account_name ? ` · ${toTitleCase(t.account_name)}` : ""}
                                </p>
                              </div>
                              <p
                                className={`text-ios-subhead font-bold shrink-0 ${
                                  isOut ? "text-danger" : "text-success"
                                }`}
                              >
                                {isOut ? "−" : "+"}
                                {formatRp(nominal)}
                              </p>
                            </div>
                          ) : (
                            <ChevronRow>
                              <div className="flex items-center justify-between gap-2 w-full">
                                <div className="min-w-0 flex-1">
                                  <p className="text-ios-body font-medium text-surface-text truncate">
                                    {t.description || "-"}
                                  </p>
                                  <p className="text-ios-caption text-surface-muted truncate">
                                    {formatDateShort(t.transaction_date)}
                                    {t.account_name ? ` · ${toTitleCase(t.account_name)}` : ""}
                                  </p>
                                </div>
                                <p
                                  className={`text-ios-subhead font-bold shrink-0 ${
                                    isOut ? "text-danger" : "text-success"
                                  }`}
                                >
                                  {isOut ? "−" : "+"}
                                  {formatRp(nominal)}
                                </p>
                              </div>
                            </ChevronRow>
                          )}
                        </ListRow>
                      );
                    })}
                    <ListRow insetDivider={false}>
                      <div className="w-full rounded-xl bg-surface-card2 px-3 py-2.5 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-ios-body font-extrabold text-surface-text">
                            Total
                          </p>
                          <p className="text-ios-caption text-surface-muted">
                            {selectedAccounts.size} dari {chipAccounts.length}{" "}
                            kategori · {shownList.length} transaksi
                          </p>
                        </div>
                        <p
                          className={`text-ios-nav font-display font-extrabold shrink-0 ${
                            isOut ? "text-danger" : "text-success"
                          }`}
                        >
                          {formatRp(shownTotal)}
                        </p>
                      </div>
                    </ListRow>
                  </GroupedList>
                )}
              </section>
            )}
            <Card className="mx-4 mt-3">
              <p className="text-ios-caption text-surface-muted leading-relaxed">
                Total dihitung dari kategori yang dipilih pada chip. Baris
                “SALDO AWAL” tidak dihitung sebagai pemasukan maupun
                pengeluaran. Kategori pindahan shodaqoh (Infak IR, Uang
                Sambung, Jimpitan, Siar-Siar, Seribuan, Kafan, Ukhro MT, Dana
                Kesehatan) otomatis tidak dicentang — ketuk chip-nya bila
                ingin menyertakan. Ketuk baris untuk edit/duplikat/hapus,
                atau pakai tombol Pilih untuk menandai beberapa transaksi.
              </p>
            </Card>
          </>
        )}
      </div>
      <BottomSheet
        open={isCarrySheetOpen}
        onClose={() => setIsCarrySheetOpen(false)}
        title="Jadikan Saldo Awal"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCarryForward();
          }}
        >
          <p className="text-ios-footnote text-surface-muted mb-4 px-1">
            Saldo akhir bulan ini dicatat otomatis sebagai “SALDO AWAL” di bulan
            target.
          </p>
          <Input
            label="Bulan Target (YYYY-MM)"
            type="month"
            value={carryMonth}
            onChange={(e) => setCarryMonth(e.target.value)}
            required
          />
          <SheetFooter
            onCancel={() => setIsCarrySheetOpen(false)}
            submitLabel={carryingOver ? "Memproses…" : "Proses Saldo Awal"}
            saving={carryingOver}
          />
        </form>
      </BottomSheet>
      {/* Sheet aksi per transaksi (pemasukan & pengeluaran): detail + edit/duplikat/hapus */}
      <BottomSheet
        open={!!actionTx}
        onClose={() => setActionTx(null)}
        title={actionTx?.description || "Aksi Transaksi"}
      >
        {actionTx && (
          <div className="grid gap-2.5" data-testid="bd-tx-action-overlay">
            <div className="rounded-xl bg-surface-card2 border border-surface-border px-3.5 py-2.5 mb-1">
              <p className="text-ios-caption text-surface-muted">
                {formatDateShort(actionTx.transaction_date)}
                {actionTx.account_name
                  ? ` · ${toTitleCase(actionTx.account_name)}`
                  : ""}
              </p>
              <p
                className={`text-ios-nav font-display font-extrabold mt-0.5 ${
                  (Number(actionTx.debit) || 0) > 0
                    ? "text-success"
                    : "text-danger"
                }`}
              >
                {(Number(actionTx.debit) || 0) > 0 ? "+" : "−"}
                {formatRp(
                  (Number(actionTx.debit) || 0) > 0
                    ? Number(actionTx.debit)
                    : Number(actionTx.credit),
                )}
              </p>
            </div>
            <Button
              variant="secondary"
              fullWidth
              data-testid="btn-bd-action-edit"
              onClick={() => {
                const t = actionTx;
                setActionTx(null);
                handleOpenEditSheet(t);
              }}
            >
              Edit Transaksi
            </Button>
            <Button
              variant="secondary"
              fullWidth
              data-testid="btn-bd-action-duplicate"
              disabled={duplicating}
              onClick={async () => {
                const t = actionTx;
                setActionTx(null);
                await handleDuplicateTx(t);
              }}
            >
              {duplicating ? "Menduplikat…" : "Duplikat Transaksi"}
            </Button>
            <Button
              variant="softDanger"
              fullWidth
              data-testid="btn-bd-action-delete"
              onClick={() => {
                setDeleteTarget(actionTx);
                setActionTx(null);
              }}
            >
              Hapus Transaksi
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setActionTx(null)}>
              Batal
            </Button>
          </div>
        )}
      </BottomSheet>
      <BottomSheet
        open={isTxSheetOpen}
        onClose={() => setIsTxSheetOpen(false)}
        title={editingTx ? "Edit Transaksi" : "Tambah Transaksi"}
      >
        <form onSubmit={handleSubmitTx}>
          <DateInput
            label="Tanggal"
            value={txForm.transaction_date}
            onChange={(val) =>
              setTxForm({ ...txForm, transaction_date: val })
            }
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
          <Select
            label="Akun / Kategori"
            value={txForm.account_name}
            onChange={(e) =>
              setTxForm({ ...txForm, account_name: e.target.value })
            }
            required
            data-testid="bd-tx-account-select"
          >
            <option value="">— Pilih kategori —</option>
            {accountOptions.map((a) => (
              <option key={a} value={a}>
                {toTitleCase(a)}
              </option>
            ))}
          </Select>
          <Input
            label="Keterangan"
            placeholder="Uraian transaksi"
            value={txForm.description}
            onChange={(e) =>
              setTxForm({ ...txForm, description: e.target.value })
            }
            required
          />
          <Input
            label="Nominal (Rp)"
            type="number"
            placeholder="0"
            value={txForm.amount || ""}
            onChange={(e) =>
              setTxForm({ ...txForm, amount: Number(e.target.value) })
            }
            required
          />
          <SheetFooter
            onCancel={() => setIsTxSheetOpen(false)}
            submitLabel="Simpan"
            saving={savingTx}
            cancelTestId="btn-bd-cancel-tx"
            submitTestId="btn-bd-submit-tx"
          />
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
    </AppLayout>
  );
};

export default KasBreakdownPage;
