import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  financeApi,
  type Transaction,
  type KasDataResponse,
  type CashType,
} from "../api/financeApi";
import { formatRp, formatDateShort } from "../../../utils/format";
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
import {
  Plus,
  Minus,
  Search,
  Landmark,
} from "../../../components/ui/FontAwesomeIcons";
import { useFinanceSync } from "../hooks/useFinanceSync";
import { useFinanceBack } from "../hooks/useFinanceBack";
import {
  SectionTitle,
  StatusPill,
  HeaderActions,
  SyncHeaderButton,
  PrintHeaderButton,
  NoGroupEmpty,
  SheetFooter,
} from "../components/FinanceShared";
import { ApiError } from "../../../services/api";
const KasArusChart: React.FC<{
  data: Array<[string, { debet: number; kredit: number; count: number }]>;
  max: number;
  monthShort: (k: string) => string;
}> = ({ data, max, monthShort }) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const W = 600;
  const H = 180;
  const padL = 8;
  const padR = 8;
  const padT = 12;
  const padB = 24;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const step = innerW / Math.max(data.length, 1);
  const barW = Math.max(6, Math.min(14, step * 0.28));
  const baseY = padT + innerH;
  const maxV = Math.max(
    max,
    ...data.map(([, v]) => Math.max(v.debet, v.kredit)),
    1,
  );
  const minNet = Math.min(0, ...data.map(([, v]) => v.debet - v.kredit));
  const maxNet = Math.max(0, ...data.map(([, v]) => v.debet - v.kredit));
  const netSpan = Math.max(maxNet - minNet, 1);
  const cx = (i: number) => padL + step * i + step / 2;
  const yBar = (v: number) => padT + innerH - (v / maxV) * innerH;
  const yNet = (v: number) => padT + innerH - ((v - minNet) / netSpan) * innerH;
  const netPts = data.map(
    ([, v], i) => [cx(i), yNet(v.debet - v.kredit)] as const,
  );
  const netPath = netPts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`)
    .join(" ");
  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.max(
      0,
      Math.min(data.length - 1, Math.floor((px - padL) / step)),
    );
    setHoverIdx(i);
  };
  const hovered = hoverIdx !== null ? data[hoverIdx] : null;
  const hoveredNet = hovered ? hovered[1].debet - hovered[1].kredit : 0;
  const tooltipLeftPct = hovered
    ? Math.max(12, Math.min(88, (cx(hoverIdx!) / W) * 100))
    : 50;
  return (
    <div className="relative pt-14">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full h-[180px] overflow-visible cursor-crosshair select-none"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="kasBarDebet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(34 197 94)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="rgb(34 197 94)" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="kasBarKredit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(239 68 68)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="rgb(239 68 68)" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        {/* Grid horizontal */}
        {[0, 0.25, 0.5, 0.75, 1].map((g, i) => {
          const gy = padT + innerH * (1 - g);
          return (
            <line
              key={i}
              x1={padL}
              x2={W - padR}
              y1={gy}
              y2={gy}
              stroke="currentColor"
              className="text-surface-border"
              strokeWidth="1"
              strokeDasharray={g === 0 ? "0" : "3 4"}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
        {/* Grid vertikal */}
        {data.map((_, i) => (
          <line
            key={i}
            x1={cx(i)}
            x2={cx(i)}
            y1={padT}
            y2={padT + innerH}
            stroke="currentColor"
            className="text-surface-border"
            strokeWidth="1"
            strokeDasharray="3 4"
            opacity="0.35"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {/* Bars */}
        {data.map(([k, v], i) => {
          const c = cx(i);
          const gap = 2;
          const dh = v.debet > 0 ? Math.max(2, baseY - yBar(v.debet)) : 0;
          const kh = v.kredit > 0 ? Math.max(2, baseY - yBar(v.kredit)) : 0;
          const dim = hoverIdx !== null && hoverIdx !== i;
          return (
            <g
              key={k}
              opacity={dim ? 0.35 : 1}
              style={{ transition: "opacity 120ms" }}
            >
              {dh > 0 && (
                <rect
                  x={c - barW - gap / 2}
                  y={baseY - dh}
                  width={barW}
                  height={dh}
                  rx="2"
                  fill="url(#kasBarDebet)"
                />
              )}
              {kh > 0 && (
                <rect
                  x={c + gap / 2}
                  y={baseY - kh}
                  width={barW}
                  height={kh}
                  rx="2"
                  fill="url(#kasBarKredit)"
                />
              )}
            </g>
          );
        })}
        {/* Zero net line */}
        <line
          x1={padL}
          x2={W - padR}
          y1={yNet(0)}
          y2={yNet(0)}
          stroke="currentColor"
          className="text-surface-muted"
          strokeWidth="1"
          strokeDasharray="2 3"
          opacity="0.5"
          vectorEffect="non-scaling-stroke"
        />
        {/* Net line */}
        <path
          d={netPath}
          fill="none"
          stroke="rgb(59 130 246)"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* Net dots */}
        {netPts.map(([px, py], i) => (
          <circle
            key={i}
            cx={px}
            cy={py}
            r={hoverIdx === i ? 5 : 3.5}
            fill="rgb(59 130 246)"
            stroke="white"
            strokeWidth="1.5"
            style={{ transition: "r 120ms" }}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {/* Hover vertical line */}
        {hoverIdx !== null && (
          <line
            x1={cx(hoverIdx)}
            x2={cx(hoverIdx)}
            y1={padT}
            y2={padT + innerH}
            stroke="rgb(59 130 246)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.75"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      {/* Month labels */}
      <div className="flex mt-0.5">
        {data.map(([k], i) => (
          <span
            key={k}
            className={`flex-1 text-[10px] font-semibold text-center truncate transition-colors ${
              hoverIdx === i ? "text-accent" : "text-surface-muted"
            }`}
          >
            {monthShort(k)}
          </span>
        ))}
      </div>
      {/* Tooltip */}
      {hovered && (
        <div
          className="pointer-events-none absolute top-0 z-10 rounded-xl bg-surface-card border border-surface-border shadow-lg px-3 py-2 text-ios-caption whitespace-nowrap"
          style={{
            left: `${tooltipLeftPct}%`,
            transform: "translateX(-50%)",
          }}
        >
          <p className="font-bold text-surface-text mb-1">
            {monthShort(hovered[0])}
          </p>
          <p className="text-success font-medium">
            Masuk{" "}
            <span className="">{formatRp(hovered[1].debet)}</span>
          </p>
          <p className="text-danger font-medium">
            Keluar{" "}
            <span className="">{formatRp(hovered[1].kredit)}</span>
          </p>
          <p className="text-blue-500 font-medium">
            Net <span className="">{formatRp(hoveredNet)}</span>
          </p>
        </div>
      )}
    </div>
  );
};
export const FinanceLedgerPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { assignedGroup, isSuperAdmin } = usePermission();
  const financeBack = useFinanceBack();
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
  const [actionTx, setActionTx] = useState<Transaction | null>(null);
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
      setIsTxSheetOpen(false);
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
  const [duplicating, setDuplicating] = useState(false);
  const handleDuplicateTx = async (tx?: Transaction) => {
    const target = tx || editingTx;
    if (!target?.cash_id) return;
    setDuplicating(true);
    try {
      await financeApi.duplicateTransaction(assignedGroup, target, cashType);
      showToast("Transaksi berhasil diduplikat", "success");
      setIsTxSheetOpen(false);
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
  const monthOptions = Array.from(
    new Set(
      (kasData?.transactions || [])
        .map((t) => (t.transaction_date || "").slice(0, 7))
        .filter(Boolean),
    ),
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
      (t) => (t.transaction_date || "").slice(0, 7) === selectedMonth,
    );
    const before = allTx.filter(
      (t) => (t.transaction_date || "").slice(0, 7) < selectedMonth,
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
      monthTx.length > 0
        ? Number(monthTx[monthTx.length - 1].balance) || awal
        : awal;
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
  const recapByMonth = useMemo(() => {
    const map = new Map<
      string,
      { debet: number; kredit: number; count: number }
    >();
    for (const t of allTx) {
      const k = (t.transaction_date || "").slice(0, 7);
      if (!k) continue;
      const isAwal =
        (t.account_name || "").trim().toUpperCase() === "SALDO AWAL";
      const cur = map.get(k) || { debet: 0, kredit: 0, count: 0 };
      if (!isAwal) {
        cur.debet += Number(t.debit) || 0;
        cur.kredit += Number(t.credit) || 0;
      }
      cur.count += 1;
      map.set(k, cur);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [allTx]);
  const chartMonths = useMemo(
    () => recapByMonth.slice(0, 6).reverse(),
    [recapByMonth],
  );
  const chartMax = useMemo(
    () =>
      Math.max(1, ...chartMonths.map(([, v]) => Math.max(v.debet, v.kredit))),
    [chartMonths],
  );
  const filteredTransactions = periodTx.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.description || "").toLowerCase().includes(q) ||
      (t.account_name || "").toLowerCase().includes(q) ||
      (t.transaction_date || "").toLowerCase().includes(q)
    );
  });
  const visibleTx = showAllTx
    ? filteredTransactions
    : [...filteredTransactions].slice(-5).reverse();
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
        onBack={() => navigate(financeBack.backTo)}
        backLabel={financeBack.backLabel}
        showSyncButton={false}
        right={
          <HeaderActions>
            {isSuperAdmin && (
              <SyncHeaderButton
                syncing={syncingSheet}
                onSync={() => syncSheet(assignedGroup)}
              />
            )}
            <PrintHeaderButton
              onClick={() => {
                navigate(`/finance/ledger/print?mode=rincian`);
              }}
            />
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
              <SectionTitle first>Periode</SectionTitle>
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
              <SectionTitle>Ringkasan</SectionTitle>
              <Card className="mx-4" data-testid="hero-card">
                <p className="text-ios-caption font-semibold uppercase tracking-wider text-surface-muted">
                  Saldo Kas {cashType === "amil" ? "Amil" : "Utama"}
                </p>
                <p
                  className="font-display text-[30px] font-extrabold mt-1 leading-none text-surface-text"
                  data-testid="home-saldo-akhir"
                >
                  {formatRp(heroBalance)}
                </p>
                <p
                  className="text-ios-footnote mt-2 font-medium text-surface-muted"
                  data-testid="home-periode-text"
                >
                  {monthLabel(selectedMonth)}
                  <span className="mx-1.5 text-surface-muted/50">·</span>
                  <span
                    className="font-bold text-surface-text"
                    data-testid="home-total-tx"
                  >
                    {periodTx.length} transaksi
                  </span>
                </p>
                <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-surface-border">
                  <span className="text-ios-footnote font-medium text-surface-muted">
                    {selectedMonth === "all"
                      ? "Saldo Awal (Awal Tahun)"
                      : "Saldo Awal (Awal Bulan)"}
                  </span>
                  <span
                    className="text-ios-footnote font-bold text-surface-text ml-auto"
                    data-testid="home-saldo-awal"
                  >
                    {formatRp(
                      selectedMonth === "all"
                        ? kasData?.initial_balance || 0
                        : openingBalance,
                    )}
                  </span>
                </div>
              </Card>
              <div className="px-4 mt-2.5 grid grid-cols-2 gap-2.5">
                <Card className="!p-3.5">
                  <p className="text-ios-caption font-semibold uppercase tracking-wider text-success">
                    Pemasukan
                  </p>
                  <p
                    className="font-display text-ios-nav font-extrabold mt-0.5 text-success"
                    data-testid="home-debet"
                  >
                    {formatRp(sumDebit)}
                  </p>
                </Card>
                <Card className="!p-3.5">
                  <p className="text-ios-caption font-semibold uppercase tracking-wider text-danger">
                    Pengeluaran
                  </p>
                  <p
                    className="font-display text-ios-nav font-extrabold mt-0.5 text-danger"
                    data-testid="home-kredit"
                  >
                    {formatRp(sumCredit)}
                  </p>
                </Card>
              </div>
              <GroupedList>
                <ListRow insetDivider={false}>
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div className="min-w-0">
                      <p className="text-ios-body font-medium text-surface-text">
                        Surplus Periode Ini
                      </p>
                      <p
                        className="font-display text-ios-nav font-extrabold text-surface-text"
                        data-testid="home-surplus"
                      >
                        {formatRp(surplus)}
                      </p>
                    </div>
                    <StatusPill
                      tone={surplus >= 0 ? "success" : "danger"}
                      testId="home-surplus-badge"
                    >
                      {surplus >= 0 ? "Surplus" : "Defisit"}
                    </StatusPill>
                  </div>
                </ListRow>
              </GroupedList>
            </section>
            {chartMonths.length > 0 && (
              <section>
                <SectionTitle>Grafik Arus Kas (6 Bulan)</SectionTitle>
                <Card className="mx-4 !p-3">
                  <KasArusChart
                    data={chartMonths}
                    max={chartMax}
                    monthShort={monthShort}
                  />
                  <div className="mt-2 pt-2 border-t border-surface-border flex flex-wrap items-center gap-x-3 gap-y-1 text-ios-caption text-surface-muted">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-success" /> Masuk{" "}
                      {formatRp(
                        chartMonths.reduce((s, [, v]) => s + v.debet, 0),
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-danger" /> Keluar{" "}
                      {formatRp(
                        chartMonths.reduce((s, [, v]) => s + v.kredit, 0),
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500" /> Net
                    </span>
                  </div>
                </Card>
              </section>
            )}
            {recapByMonth.length > 0 && (
              <section>
                <SectionTitle>Rekap Bulanan</SectionTitle>
                <GroupedList>
                  {recapByMonth.slice(0, 6).map(([k, v], idx, arr) => (
                    <ListRow
                      key={k}
                      onClick={() => setSelectedMonth(k)}
                      insetDivider={idx !== arr.length - 1}
                    >
                      <ChevronRow>
                        <div className="w-full">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-ios-body font-semibold text-surface-text">
                              {monthLabel(k)}
                            </p>
                            <p
                              className={` text-ios-subhead font-bold ${v.debet - v.kredit >= 0 ? "text-success" : "text-danger"}`}
                            >
                              {formatRp(v.debet - v.kredit)}
                            </p>
                          </div>
                          <p className="text-ios-caption text-surface-muted mt-0.5">
                            Masuk {formatRp(v.debet)} · Keluar{" "}
                            {formatRp(v.kredit)} · {v.count} tx
                          </p>
                        </div>
                      </ChevronRow>
                    </ListRow>
                  ))}
                </GroupedList>
              </section>
            )}
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
                    data-testid="search-input"
                  />
                </div>
              )}
              {loading ? (
                <GroupedListSkeleton rows={5} />
              ) : visibleTx.length === 0 ? (
                <EmptyState
                  title="Kas kelompok ini masih kosong"
                  description={
                    searchQuery
                      ? "Tidak ada transaksi yang cocok dengan pencarian. Coba kata kunci lain."
                      : "Belum ada pemasukan atau pengeluaran yang tercatat di kelompok ini. Catat transaksi pertama memakai tombol + di bawah, semua tercatat rapi per kelompok."
                  }
                />
              ) : (
                <GroupedList>
                  {visibleTx.map((t, idx) => {
                    const isIn = (Number(t.debit) || 0) > 0;
                    return (
                      <ListRow
                        key={t.cash_id || idx}
                        onClick={() => setActionTx(t)}
                        insetDivider={idx !== visibleTx.length - 1}
                        data-testid="tx-item"
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
                                {t.description || "-"}
                              </p>
                              <p className="text-ios-caption text-surface-muted truncate">
                                {formatDateShort(t.transaction_date)}
                                {t.account_name ? ` · ${t.account_name}` : ""}
                              </p>
                            </div>
                            <p
                              className={` text-ios-subhead font-bold shrink-0 ${
                                isIn ? "text-success" : "text-danger"
                              }`}
                            >
                              {isIn ? "+" : "−"}
                              {formatRp(
                                isIn ? Number(t.debit) : Number(t.credit),
                              )}
                            </p>
                          </div>
                        </ChevronRow>
                      </ListRow>
                    );
                  })}
                </GroupedList>
              )}
              <div className="px-4 mt-2.5 grid grid-cols-2 gap-2.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCarrySheetOpen(true)}
                >
                  Bawa Saldo Awal
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    navigate(`/finance/ledger/print?mode=rekap`);
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
          <Input
            label="Akun / Kategori"
            placeholder="Contoh: Infaq Jamaah, Listrik, Konsumsi"
            value={txForm.account_name}
            onChange={(e) =>
              setTxForm({ ...txForm, account_name: e.target.value })
            }
          />
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
            cancelTestId="btn-cancel-tx"
            submitTestId="btn-submit-tx"
          />
        </form>
      </BottomSheet>
      {/* Action overlay spek #txActionOverlay: Edit / Duplikat / Hapus / Batal */}
      <BottomSheet
        open={!!actionTx}
        onClose={() => setActionTx(null)}
        title={actionTx?.description || "Aksi Transaksi"}
      >
        {actionTx && (
          <div className="grid gap-2.5" data-testid="tx-action-overlay">
            <Button
              variant="secondary"
              fullWidth
              data-testid="btn-action-edit"
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
              data-testid="btn-action-duplicate"
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
              data-testid="btn-action-delete"
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
    </AppLayout>
  );
};
