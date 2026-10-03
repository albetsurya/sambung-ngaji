import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  financeApi,
  type DueMember,
  type DuesDataResponse,
} from "../api/financeApi";
import { formatRp } from "../../../utils/format";
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
import { AnimatedNumber, AnimatedProgress, staggerStyle } from "../../../components/ui/Motion";
import {
  Heart,
  Printer,
  Sparkles,
  Copy,
  Send,
  CheckCircle2,
  X,
} from "../../../components/ui/FontAwesomeIcons";
import { useFinanceSync } from "../hooks/useFinanceSync";
import { useFinanceBack } from "../hooks/useFinanceBack";
import {
  SectionTitle,
  StatusPill,
  HeaderActions,
  HeaderIconButton,
  SyncHeaderButton,
  FilterHeaderButton,
  NoGroupEmpty,
  SheetFooter,
} from "../components/FinanceShared";
import { ApiError } from "../../../services/api";

const PAYMENT_FIELDS = [
  { key: "connecting_fund", label: "Uang Sambung" },
  { key: "community_dues", label: "Jimpitan" },
  { key: "outreach_fund", label: "Siar-Siar" },
  { key: "thousand_fund", label: "Seribuan" },
  { key: "funeral_fund", label: "Kafan" },
  { key: "ukhro_mt", label: "Ukhro MT" },
] as const;

interface CarryoverRow {
  month: string;
  amount: number;
}

function formatCarryMonth(ym: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(ym || "");
  if (!m) return ym;
  try {
    return new Date(Number(m[1]), Number(m[2]) - 1, 1).toLocaleDateString(
      "id-ID",
      {
        month: "short",
        year: "numeric",
      },
    );
  } catch {
    return ym;
  }
}

function formatCarrySummary(
  items: { month: string; amount: number }[],
): string {
  if (!items.length) return "";
  const months = items.map((it) => formatCarryMonth(it.month)).join(", ");
  const total = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
  return `Susulan ${months} · ${formatRp(total)}`;
}

export const MonthlyDuesPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { assignedGroup, isSuperAdmin } = usePermission();
  const financeBack = useFinanceBack();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [data, setData] = useState<DuesDataResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${m}`;
  });
  const [statusFilter, setStatusFilter] = useState<"ALL" | "LUNAS" | "BELUM">(
    "ALL",
  );
  const [isMemberSheetOpen, setIsMemberSheetOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<DueMember | null>(null);
  const [memberName, setMemberName] = useState("");
  const [memberTarget, setMemberTarget] = useState(0);
  const [savingMember, setSavingMember] = useState(false);
  const [deleteMemberTarget, setDeleteMemberTarget] =
    useState<DueMember | null>(null);
  const [deletingMember, setDeletingMember] = useState(false);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<DueMember | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    payment_id: "",
    payment_date: new Date().toISOString().slice(0, 10),
    connecting_fund: 0,
    community_dues: 0,
    outreach_fund: 0,
    thousand_fund: 0,
    funeral_fund: 0,
    ukhro_mt: 0,
    notes: "",
  });
  const [carryovers, setCarryovers] = useState<CarryoverRow[]>([]);
  const [savingPayment, setSavingPayment] = useState(false);
  const [isAiSheetOpen, setIsAiSheetOpen] = useState(false);
  const [aiPhotoUrl, setAiPhotoUrl] = useState("");
  const [aiExtracting, setAiExtracting] = useState(false);
  const [yearlyMembers, setYearlyMembers] = useState<DueMember[]>([]);
  const [yearlyPayments, setYearlyPayments] = useState<any[]>([]);
  const [yearlyLoading, setYearlyLoading] = useState(false);
  const [printMenuOpen, setPrintMenuOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [postStatus, setPostStatus] = useState<
    "unknown" | "posted" | "not-posted"
  >("unknown");
  const [shodTab, setShodTab] = useState<"overview" | "members" | "payments">(
    "overview",
  );
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [draftMonth, setDraftMonth] = useState("");
  const [draftStatus, setDraftStatus] = useState<"ALL" | "LUNAS" | "BELUM">(
    "ALL",
  );
  const [draftYear, setDraftYear] = useState<string>("all");
  const [memberActionTarget, setMemberActionTarget] =
    useState<DueMember | null>(null);
  const [memberDetailTarget, setMemberDetailTarget] =
    useState<DueMember | null>(null);
  const [paymentDetail, setPaymentDetail] = useState<any | null>(null);
  const [reversing, setReversing] = useState(false);
  const [payMethod, setPayMethod] = useState<"manual" | "upload">("manual");
  const [visibleCount, setVisibleCount] = useState(3);
  const overviewTopRef = useRef<HTMLDivElement>(null);
  const skipScrollRef = useRef(true);

  useEffect(() => {
    if (skipScrollRef.current) {
      skipScrollRef.current = false;
      return;
    }
    if (shodTab !== "overview") return;
    const el = overviewTopRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedMonth]);

  const loadData = async () => {
    if (!assignedGroup) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const res = await financeApi.getShodaqohData(
        assignedGroup,
        selectedMonth,
      );
      setData(res);
      try {
        const kas = await financeApi.getKasTransactions(assignedGroup, "main");
        const marker = `POSTED_SHODAQOH_${selectedMonth}`;
        const posted = (kas.transactions || []).some((t) =>
          (t.description || "").includes(marker),
        );
        setPostStatus(posted ? "posted" : "not-posted");
      } catch {
        setPostStatus("unknown");
      }
    } catch (err: any) {
      const msg =
        err instanceof ApiError ? err.message : "Gagal memuat data shodaqoh";
      setLoadError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth, assignedGroup]);

  useEffect(() => {
    if (!assignedGroup) {
      setYearlyMembers([]);
      setYearlyPayments([]);
      return;
    }
    let cancelled = false;
    setYearlyLoading(true);
    financeApi
      .getShodaqohYearly(assignedGroup)
      .then((r) => {
        if (!cancelled) {
          setYearlyMembers(r.members);
          setYearlyPayments(r.payments);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setYearlyMembers([]);
          setYearlyPayments([]);
        }
      })
      .finally(() => {
        if (!cancelled) setYearlyLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [assignedGroup]);

  const { syncing: syncingSheet, sync: syncSheet } = useFinanceSync(loadData);

  const handleOpenAddMember = () => {
    setEditingMember(null);
    setMemberName("");
    setMemberTarget(0);
    setIsMemberSheetOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) {
      showToast("Nama anggota wajib diisi", "error");
      return;
    }
    setSavingMember(true);
    try {
      if (editingMember) {
        await financeApi.updateDueMember(
          assignedGroup,
          editingMember.member_id,
          memberName,
          memberTarget,
        );
        showToast("Anggota shodaqoh berhasil diperbarui", "success");
      } else {
        await financeApi.addDueMember(assignedGroup, memberName, memberTarget);
        showToast("Anggota shodaqoh berhasil ditambahkan", "success");
      }
      setIsMemberSheetOpen(false);
      loadData();
    } catch (err: any) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menyimpan anggota",
        "error",
      );
    } finally {
      setSavingMember(false);
    }
  };

  const handleConfirmDeleteMember = async () => {
    if (!deleteMemberTarget) return;
    setDeletingMember(true);
    try {
      await financeApi.deleteDueMember(
        assignedGroup,
        deleteMemberTarget.member_id,
      );
      showToast("Anggota shodaqoh berhasil dihapus", "success");
      setDeleteMemberTarget(null);
      setIsMemberSheetOpen(false);
      loadData();
    } catch (err: any) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menghapus anggota",
        "error",
      );
    } finally {
      setDeletingMember(false);
    }
  };

  const handleOpenPaymentSheet = async (member: DueMember, existing?: any) => {
    setSelectedMember(member);
    setPayMethod("manual");
    if (existing) {
      setPaymentForm({
        payment_id: existing.payment_id || "",
        payment_date:
          existing.payment_date || new Date().toISOString().slice(0, 10),
        connecting_fund: Number(existing.connecting_fund) || 0,
        community_dues: Number(existing.community_dues) || 0,
        outreach_fund: Number(existing.outreach_fund) || 0,
        thousand_fund: Number(existing.thousand_fund) || 0,
        funeral_fund: Number(existing.funeral_fund) || 0,
        ukhro_mt: Number(existing.ukhro_mt) || 0,
        notes: existing.notes || "",
      });
      setCarryovers(
        (existing.carryover_items || []).map((it: any) => ({
          month: String(it.month || ""),
          amount: Number(it.amount) || 0,
        })),
      );
      setIsPaymentSheetOpen(true);
      return;
    }
    setPaymentForm({
      payment_id: "",
      payment_date: new Date().toISOString().slice(0, 10),
      connecting_fund: 0,
      community_dues: 0,
      outreach_fund: 0,
      thousand_fund: 0,
      funeral_fund: 0,
      ukhro_mt: 0,
      notes: "",
    });
    setCarryovers([]);
    try {
      const lastRes = await financeApi.getShodaqohLastNominals(
        assignedGroup,
        member.member_id,
      );
      if (lastRes && lastRes.success && lastRes.values) {
        const v = lastRes.values;
        setPaymentForm((prev) => ({
          ...prev,
          connecting_fund: Number(v.connecting_fund) || 0,
          community_dues: Number(v.community_dues) || 0,
          outreach_fund: Number(v.outreach_fund) || 0,
          thousand_fund: Number(v.thousand_fund) || 0,
          funeral_fund: Number(v.funeral_fund) || 0,
          ukhro_mt: Number(v.ukhro_mt) || 0,
        }));
        const items = Array.isArray(v.carryover_items) ? v.carryover_items : [];
        if (items.length) {
          setCarryovers(
            items.map((it: any) => ({
              month: String(it.month || ""),
              amount: Number(it.amount) || 0,
            })),
          );
        }
      }
    } catch {
      /* noop */
    }
    setIsPaymentSheetOpen(true);
  };

  const carryoverTotal = carryovers.reduce(
    (s, r) => s + (Number(r.amount) || 0),
    0,
  );

  const paymentTotal =
    carryoverTotal +
    paymentForm.connecting_fund +
    paymentForm.community_dues +
    paymentForm.outreach_fund +
    paymentForm.thousand_fund +
    paymentForm.funeral_fund +
    paymentForm.ukhro_mt;

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    for (const r of carryovers) {
      const amt = Number(r.amount) || 0;
      if (amt > 0 && !r.month) {
        showToast("Bulan susulan wajib diisi bila nominal > 0", "error");
        return;
      }
      if (r.month && amt <= 0) {
        showToast(
          `Nominal susulan bulan ${r.month} harus lebih besar dari 0`,
          "error",
        );
        return;
      }
    }
    const cleanCarryovers = carryovers
      .filter((r) => r.month && (Number(r.amount) || 0) > 0)
      .map((r) => {
        const m = /^(\d{2})-(\d{4})$/.exec(r.month);
        return {
          month: m ? `${m[2]}-${m[1]}` : r.month,
          amount: Number(r.amount),
        };
      });
    const seen = new Set<string>();
    for (const r of cleanCarryovers) {
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(r.month)) {
        showToast(`Bulan susulan tidak valid: ${r.month}`, "error");
        return;
      }
      if (seen.has(r.month)) {
        showToast(`Bulan susulan duplikat: ${r.month}`, "error");
        return;
      }
      seen.add(r.month);
    }
    if (paymentTotal <= 0) {
      showToast("Total pembayaran shodaqoh harus lebih besar dari 0", "error");
      return;
    }
    const payload = {
      payment_id: paymentForm.payment_id,
      member_id: selectedMember.member_id,
      payment_date: paymentForm.payment_date,
      total_amount: paymentTotal,
      carryover_items: cleanCarryovers,
      carryover_ir: carryoverTotal,
      connecting_fund: paymentForm.connecting_fund,
      community_dues: paymentForm.community_dues,
      outreach_fund: paymentForm.outreach_fund,
      thousand_fund: paymentForm.thousand_fund,
      funeral_fund: paymentForm.funeral_fund,
      ukhro_mt: paymentForm.ukhro_mt,
      notes: paymentForm.notes,
    };
    setSavingPayment(true);
    try {
      if (paymentForm.payment_id) {
        await financeApi.updateDuePayment(assignedGroup, payload);
        showToast("Pembayaran shodaqoh berhasil diupdate", "success");
      } else {
        await financeApi.createDuePayment(assignedGroup, payload);
        showToast("Pembayaran shodaqoh berhasil disimpan", "success");
      }
      setIsPaymentSheetOpen(false);
      loadData();
    } catch (err: any) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menyimpan pembayaran",
        "error",
      );
    } finally {
      setSavingPayment(false);
    }
  };

  const handleAiExtract = async () => {
    if (!aiPhotoUrl.trim()) {
      showToast("Masukkan Base64 atau URL foto terlebih dahulu", "error");
      return;
    }
    setAiExtracting(true);
    try {
      const res = await financeApi.extractShodaqohAi(aiPhotoUrl);
      if (res && res.success && res.data) {
        const d = res.data;
        showToast("Foto berhasil diekstraksi oleh AI!", "success");
        setPaymentForm((prev) => ({
          ...prev,
          connecting_fund: Number(d.connecting_fund) || 0,
          community_dues: Number(d.community_dues) || 0,
          outreach_fund: Number(d.outreach_fund) || 0,
          thousand_fund: Number(d.thousand_fund) || 0,
          funeral_fund: Number(d.funeral_fund) || 0,
          ukhro_mt: Number(d.ukhro_mt) || 0,
          notes: d.notes ?? prev.notes,
        }));
        const aiIr = Number(d.carryover_ir) || 0;
        if (aiIr > 0) {
          setCarryovers((prev) =>
            prev.length ? prev : [{ month: "", amount: aiIr }],
          );
          showToast(
            "Nominal susulan terdeteksi - pilih bulannya manual",
            "warning",
          );
        }
        setIsAiSheetOpen(false);
      } else {
        showToast(res.message || "Gagal membaca foto", "error");
      }
    } catch (err: any) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal memproses AI OCR",
        "error",
      );
    } finally {
      setAiExtracting(false);
    }
  };

  const membersList = data?.members || [];
  const paymentsList = data?.payments || [];
  const paidIds = new Set(
    paymentsList
      .filter((p) => p.status !== "INACTIVE" && p.total_amount > 0)
      .map((p) => p.member_id),
  );
  const statusVisible = membersList.filter((m) => {
    if (statusFilter === "ALL") return true;
    const paid = paidIds.has(m.member_id);
    return statusFilter === "LUNAS" ? paid : !paid;
  });
  const visibleMembers = statusVisible.filter((m) => {
    if (!searchQuery.trim()) return true;
    return m.member_name.toLowerCase().includes(searchQuery.toLowerCase());
  });
  const dashboard = data?.dashboard;
  const progressPct =
    dashboard && dashboard.target > 0
      ? Math.min(100, Math.round((dashboard.received / dashboard.target) * 100))
      : 0;
  const monthLabel = selectedMonth
    ? new Date(
        Number(selectedMonth.slice(0, 4)),
        Number(selectedMonth.slice(5, 7)) - 1,
        1,
      ).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
    : "";
  const allocationTotals = (() => {
    const t = {
      ir: 0,
      sambung: 0,
      jimpitan: 0,
      siar: 0,
      seribu: 0,
      kafan: 0,
      ukhro: 0,
    };
    for (const p of paymentsList) {
      if (p.status === "REVERSED" || p.status === "INACTIVE") continue;
      t.ir += Number(p.carryover_ir) || 0;
      t.sambung += Number(p.connecting_fund) || 0;
      t.jimpitan += Number(p.community_dues) || 0;
      t.siar += Number(p.outreach_fund) || 0;
      t.seribu += Number(p.thousand_fund) || 0;
      t.kafan += Number(p.funeral_fund) || 0;
      t.ukhro += Number(p.ukhro_mt) || 0;
    }
    return t;
  })();
  const yearlyYear = (selectedMonth || "").slice(0, 4);
  const yearlyMaxMonth = (() => {
    if (!yearlyYear) return 0;
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;
    const y = Number(yearlyYear);
    if (y < curYear) return 12;
    if (y === curYear) return curMonth;
    return 0;
  })();
  const monthlyRecap = (() => {
    if (!yearlyYear || yearlyMaxMonth < 1) return [];
    const activeTarget = yearlyMembers
      .filter((m) => m.status === "ACTIVE")
      .reduce((s, m) => s + (Number(m.monthly_target) || 0), 0);
    const rows: Array<{
      key: string;
      label: string;
      target: number;
      received: number;
      paid: number;
      future: boolean;
    }> = [];
    for (let m = 1; m <= yearlyMaxMonth; m++) {
      const key = `${yearlyYear}-${String(m).padStart(2, "0")}`;
      const label = new Date(Number(yearlyYear), m - 1, 1).toLocaleDateString(
        "id-ID",
        { month: "short" },
      );
      const mp = yearlyPayments.filter(
        (p: any) =>
          (p.payment_date || "").slice(0, 7) === key &&
          p.status !== "REVERSED" &&
          p.status !== "INACTIVE",
      );
      rows.push({
        key,
        label,
        target: activeTarget,
        received: mp.reduce(
          (s: number, p: any) => s + (Number(p.total_amount) || 0),
          0,
        ),
        paid: new Set(mp.map((p: any) => p.member_id)).size,
        future: false,
      });
    }
    return rows;
  })();
  const buildRekapText = () => {
    const lines = [
      `*Rekap Shodaqoh ${monthLabel}*`,
      `Target: ${formatRp(dashboard?.target || 0)}`,
      `Terkumpul: ${formatRp(dashboard?.received || 0)} (${dashboard?.paidCount || 0} lunas / ${dashboard?.unpaidCount || 0} belum)`,
      `- Rincian -`,
      `Susulan IR: ${formatRp(allocationTotals.ir)}`,
      `Uang Sambung: ${formatRp(allocationTotals.sambung)}`,
      `Jimpitan: ${formatRp(allocationTotals.jimpitan)}`,
      `Siar-Siar: ${formatRp(allocationTotals.siar)}`,
      `Seribuan: ${formatRp(allocationTotals.seribu)}`,
      `Kafan: ${formatRp(allocationTotals.kafan)}`,
      `Ukhro MT: ${formatRp(allocationTotals.ukhro)}`,
    ];
    return lines.join("\n");
  };
  const handleCopyRekap = async () => {
    try {
      await navigator.clipboard.writeText(buildRekapText());
      showToast("Rekap berhasil disalin", "success");
    } catch {
      showToast("Gagal menyalin rekap", "error");
    }
  };
  const handlePostToKas = async () => {
    setPosting(true);
    try {
      await financeApi.postShodaqohToKas(assignedGroup, selectedMonth);
      setPostStatus("posted");
      showToast(`Shodaqoh ${monthLabel} berhasil diposting ke kas`, "success");
    } catch (err: any) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal posting ke kas",
        "error",
      );
    } finally {
      setPosting(false);
    }
  };
  const handleCancelPost = async () => {
    setCancelling(true);
    try {
      await financeApi.cancelPostShodaqohToKas(assignedGroup, selectedMonth);
      setPostStatus("not-posted");
      showToast(`Posting ${monthLabel} berhasil dibatalkan`, "success");
    } catch (err: any) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal membatalkan posting",
        "error",
      );
    } finally {
      setCancelling(false);
    }
  };

  return (
    <AppLayout
      fab={
        <FloatingActionButton
          onClick={() => {
            if (membersList.length > 0) {
              handleOpenPaymentSheet(membersList[0]);
            } else {
              showToast("Belum ada anggota shodaqoh", "warning");
            }
          }}
          label="Input Pembayaran"
        />
      }
    >
      <Header
        title="Shodaqoh & Infaq"
        subtitle={monthLabel}
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
            <FilterHeaderButton
              active={statusFilter !== "ALL" || draftYear !== "all"}
              onClick={() => {
                setDraftMonth(selectedMonth);
                setDraftStatus(statusFilter);
                setDraftYear(selectedMonth.slice(0, 4));
                setFilterSheetOpen(true);
              }}
            />
            <HeaderIconButton
              onClick={() => setPrintMenuOpen((v) => !v)}
              label="Cetak rekap"
              testId="shod-btn-print"
            >
              <Printer size={16} />
            </HeaderIconButton>
            {printMenuOpen && (
              <div
                className="absolute right-0 top-9 z-50 w-52 rounded-2xl border border-surface-border bg-surface-card shadow-lg p-1.5 anim-dropdown"
                data-testid="shod-print-dropdown"
              >
                <button
                  className="w-full text-left px-3 py-2.5 rounded-xl text-ios-body active:bg-surface-card2"
                  onClick={() => {
                    navigate(`/finance/monthly-dues/print?variant=shodaqoh`);
                    setPrintMenuOpen(false);
                  }}
                  data-testid="btn-print-shodaqoh"
                >
                  Cetak Rekap Shodaqoh
                </button>
                <button
                  className="w-full text-left px-3 py-2.5 rounded-xl text-ios-body active:bg-surface-card2"
                  onClick={() => {
                    navigate(`/finance/monthly-dues/print?variant=infak-ir`);
                    setPrintMenuOpen(false);
                  }}
                  data-testid="btn-print-infak-ir"
                >
                  Cetak Rekap Infak IR
                </button>
              </div>
            )}
          </HeaderActions>
        }
      />

      <div className="py-4">
        {!assignedGroup ? (
          <NoGroupEmpty
            module="shodaqoh"
            icon={<Heart size={26} className="text-accent" />}
            isSuperAdmin={isSuperAdmin}
          />
        ) : loadError && !data ? (
          <ErrorState message={loadError} onRetry={loadData} />
        ) : (
          <>
            <div className="px-4" data-testid="shod-tabs-container">
              <Segmented<"overview" | "members" | "payments">
                ariaLabel="Tab shodaqoh"
                value={shodTab}
                onChange={setShodTab}
                size="sm"
                options={[
                  { value: "overview", label: "Overview" },
                  { value: "members", label: "Anggota" },
                  { value: "payments", label: "Riwayat" },
                ]}
              />
            </div>

            {shodTab === "overview" && (
              <div data-testid="shod-tab-overview" className="contents">
                <div ref={overviewTopRef} className="scroll-mt-20" />

                {monthlyRecap.length > 0 && (
                  <section className="mt-4">
                    <SectionTitle>Periode · {monthLabel}</SectionTitle>
                    <div className="px-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                      {monthlyRecap.map((r) => (
                        <FilterChip
                          key={r.key}
                          active={r.key === selectedMonth}
                          label={`${r.label} ${yearlyYear.slice(2)}`}
                          onClick={() => setSelectedMonth(r.key)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {dashboard && (
                  <section className="mt-4 anim-stagger">
                    <SectionTitle>Capaian · {monthLabel}</SectionTitle>
                    <div className="px-4">
                      <Card className="!p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-ios-caption font-medium text-surface-muted">
                              Terkumpul
                            </p>
                            <p className="font-display text-ios-nav font-extrabold text-accent tabular-nums">
                              <AnimatedNumber value={dashboard.received} format={formatRp} />
                            </p>
                            <p className="text-ios-caption text-surface-muted mt-0.5">
                              dari target {formatRp(dashboard.target)}
                            </p>
                          </div>
                          <StatusPill tone="accent">{progressPct}%</StatusPill>
                        </div>

                        <div className="mt-3">
                          <AnimatedProgress pct={progressPct} testId="shod-progress" />
                        </div>

                        <div className="mt-2.5 flex items-center gap-2 text-ios-caption flex-wrap">
                          <StatusPill tone="success">
                            {dashboard.paidCount} lunas
                          </StatusPill>
                          <StatusPill tone="muted">
                            {dashboard.unpaidCount} belum
                          </StatusPill>
                          <span className="text-surface-muted font-medium ml-auto">
                            {dashboard.memberCount} anggota
                          </span>
                        </div>
                      </Card>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {postStatus === "posted" ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<X size={14} />}
                            disabled={cancelling}
                            onClick={handleCancelPost}
                            data-testid="btn-cancel-post-card"
                          >
                            {cancelling ? "Batal…" : "Batal Post"}
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<CheckCircle2 size={14} />}
                            disabled={posting}
                            onClick={handlePostToKas}
                            data-testid="btn-post-kas-card"
                          >
                            {posting ? "Posting…" : "Post Kas"}
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Copy size={14} />}
                          onClick={async () => {
                            await handleCopyRekap();
                            showToast("Rekap disalin");
                          }}
                          data-testid="btn-copy-rekap-card"
                        >
                          Salin
                        </Button>
                        <Button
                          size="sm"
                          leftIcon={<Send size={14} />}
                          onClick={async () => {
                            await handleCopyRekap();
                            const text = `Rekap Shodaqoh ${monthLabel}\nTarget: ${formatRp(dashboard.target)}\nTerkumpul: ${formatRp(dashboard.received)}\n${progressPct}% tercapai`;
                            window.open(
                              `https://wa.me/?text=${encodeURIComponent(text)}`,
                              "_blank",
                            );
                          }}
                          data-testid="btn-share-wa-card"
                        >
                          Whatsapp
                        </Button>
                      </div>
                    </div>
                  </section>
                )}

                <section className="mt-5">
                  <SectionTitle>Alokasi Dana · {monthLabel}</SectionTitle>
                  <div className="px-4 mt-3">
                    <Card
                      className="flex items-center gap-2 !py-3"
                      data-testid="shod-post-status"
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          postStatus === "posted"
                            ? "bg-success"
                            : postStatus === "not-posted"
                              ? "bg-warning"
                              : "bg-surface-muted"
                        }`}
                      />
                      <p className="text-ios-footnote font-medium flex-1">
                        {postStatus === "posted"
                          ? `Sudah diposting ke Kas (${monthLabel})`
                          : postStatus === "not-posted"
                            ? `Belum diposting ke Kas (${monthLabel})`
                            : "Status posting belum diketahui"}
                      </p>
                    </Card>
                  </div>
                  <GroupedList>
                    {[
                      { label: "Susulan IR", value: allocationTotals.ir },
                      {
                        label: "Uang Sambung",
                        value: allocationTotals.sambung,
                      },
                      { label: "Jimpitan", value: allocationTotals.jimpitan },
                      { label: "Siar-Siar", value: allocationTotals.siar },
                      { label: "Seribuan", value: allocationTotals.seribu },
                      { label: "Kafan", value: allocationTotals.kafan },
                      { label: "Ukhro MT", value: allocationTotals.ukhro },
                    ].map((a, idx, arr) => (
                      <div key={a.label} className="anim-stagger contents" style={staggerStyle(idx)}>
                      <ListRow
                        insetDivider={idx !== arr.length - 1}
                      >
                        <div className="flex items-center justify-between gap-2 w-full">
                          <p className="text-ios-body text-surface-text">
                            {a.label}
                          </p>
                          <p className="font-bold text-surface-text shrink-0 tabular-nums">
                            <AnimatedNumber value={a.value} format={formatRp} />
                          </p>
                        </div>
                      </ListRow>
                      </div>
                    ))}
                  </GroupedList>
                </section>

                <section className="mt-5">
                  <SectionTitle>
                    Rincian {yearlyYear} (Jan-
                    {monthlyRecap.length > 0
                      ? monthlyRecap[monthlyRecap.length - 1].label
                      : "-"}
                    , {monthlyRecap.length} Bulan)
                  </SectionTitle>
                  <div data-testid="shodaqoh-yearly-table">
                    {yearlyLoading ? (
                      <GroupedListSkeleton rows={5} />
                    ) : (
                      <GroupedList>
                        {[...monthlyRecap]
                          .reverse()
                          .slice(0, visibleCount)
                          .map((r, idx, arr) => {
                            const done =
                              !r.future &&
                              r.received >= r.target &&
                              r.target > 0;
                            const active = r.key === selectedMonth;
                            return (
                              <ListRow
                                key={r.key}
                                onClick={() => {
                                  if (!r.future) setSelectedMonth(r.key);
                                }}
                                insetDivider={idx !== arr.length - 1}
                                className={active ? "bg-accent-soft/40" : ""}
                              >
                                <ChevronRow>
                                  <div className="flex items-center justify-between gap-2 w-full">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-ios-body font-semibold text-surface-text truncate">
                                        {r.label} {yearlyYear}
                                      </p>
                                      <p className="text-ios-caption text-surface-muted truncate">
                                        Target {formatRp(r.target)} · {r.paid}{" "}
                                        lunas
                                      </p>
                                    </div>
                                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                      <p className="text-ios-subhead font-bold text-accent tabular-nums">
                                        {formatRp(r.received)}
                                      </p>
                                      {done ? (
                                        <StatusPill tone="success">
                                          LUNAS
                                        </StatusPill>
                                      ) : r.received > 0 ? (
                                        <StatusPill tone="warning">
                                          SEBAGIAN
                                        </StatusPill>
                                      ) : (
                                        <StatusPill tone="muted">
                                          BELUM
                                        </StatusPill>
                                      )}
                                    </div>
                                  </div>
                                </ChevronRow>
                              </ListRow>
                            );
                          })}
                      </GroupedList>
                    )}
                    <div className="px-4 py-2 flex items-center justify-between gap-2">
                      <p className="text-ios-caption text-surface-muted">
                        Ketuk baris bulan untuk rinciannya.
                      </p>
                      {monthlyRecap.length > 3 && (
                        <div className="flex items-center gap-3 shrink-0">
                          {visibleCount > 3 && (
                            <button
                              onClick={() => setVisibleCount(3)}
                              className="text-ios-footnote font-semibold text-accent active:scale-[0.97]"
                            >
                              Lebih sedikit
                            </button>
                          )}
                          {visibleCount < monthlyRecap.length && (
                            <button
                              onClick={() =>
                                setVisibleCount(monthlyRecap.length)
                              }
                              className="text-ios-footnote font-semibold text-accent active:scale-[0.97]"
                            >
                              Lihat semua
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            )}

            {shodTab === "members" && (
              <div data-testid="shod-tab-members" className="contents">
                {statusFilter !== "ALL" && (
                  <div
                    className="px-4 mt-4 flex gap-2 flex-wrap"
                    data-testid="shodaqoh-active-filters"
                  >
                    <button
                      className="px-2.5 py-1 rounded-full bg-accent-soft text-accent text-ios-caption font-bold"
                      onClick={() => setStatusFilter("ALL")}
                    >
                      {statusFilter === "LUNAS" ? "Lunas ×" : "Belum ×"}
                    </button>
                  </div>
                )}

                <div className="px-4 mt-3">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama anggota…"
                    data-testid="shodaqoh-search"
                  />
                </div>

                <section className="mt-4">
                  <SectionTitle>
                    Anggota · {monthLabel} ({visibleMembers.length})
                  </SectionTitle>
                  {loading ? (
                    <GroupedListSkeleton rows={5} />
                  ) : visibleMembers.length === 0 ? (
                    <EmptyState
                      title="Belum ada data shodaqoh di kelompok ini"
                      description="Belum ada anggota shodaqoh yang terdaftar di kelompok ini. Tambahkan anggota memakai tombol + di bawah, lalu catat iuran bulanannya di sini."
                    />
                  ) : (
                    <GroupedList>
                      {visibleMembers.map((m, idx) => {
                        const payment = paymentsList.find(
                          (p) => p.member_id === m.member_id,
                        );
                        const hasPaid = Boolean(
                          payment &&
                          payment.status !== "INACTIVE" &&
                          (Number(payment.total_amount) || 0) > 0,
                        );
                        const carrySummary = payment
                          ? formatCarrySummary(payment.carryover_items || [])
                          : "";
                        const memberActive =
                          (m.status || "ACTIVE") === "ACTIVE";
                        return (
                          <ListRow
                            key={m.member_id}
                            onClick={() => setMemberActionTarget(m)}
                            insetDivider={idx !== visibleMembers.length - 1}
                            leading={
                              <span
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-ios-body ${
                                  hasPaid
                                    ? "bg-success-soft text-success"
                                    : "bg-accent-soft text-accent"
                                }`}
                              >
                                {(m.member_name || "?").charAt(0).toUpperCase()}
                              </span>
                            }
                          >
                            <ChevronRow>
                              <div className="flex items-center justify-between gap-2 w-full">
                                <div className="min-w-0 flex-1">
                                  <p className="text-ios-body font-medium text-surface-text truncate">
                                    {m.member_name}
                                  </p>
                                  <p className="text-ios-caption text-surface-muted truncate">
                                    {hasPaid && payment
                                      ? `Terbayar ${formatRp(payment.total_amount)}`
                                      : `Target ${formatRp(m.monthly_target)}`}
                                    {memberActive ? "" : " · Nonaktif"}
                                  </p>
                                  {carrySummary && (
                                    <p className="text-ios-caption text-accent truncate font-medium">
                                      {carrySummary}
                                    </p>
                                  )}
                                </div>
                                <StatusPill
                                  tone={hasPaid ? "success" : "muted"}
                                >
                                  {hasPaid ? "Lunas" : "Belum"}
                                </StatusPill>
                              </div>
                            </ChevronRow>
                          </ListRow>
                        );
                      })}
                    </GroupedList>
                  )}
                </section>
              </div>
            )}

            {shodTab === "payments" && (
              <div data-testid="shod-tab-payments" className="contents">
                <section className="mt-4">
                  <SectionTitle>
                    Riwayat Pembayaran · {monthLabel} ({paymentsList.length})
                  </SectionTitle>
                  {loading ? (
                    <GroupedListSkeleton rows={5} />
                  ) : paymentsList.length === 0 ? (
                    <EmptyState
                      title="Belum ada pembayaran bulan ini"
                      description="Belum ada iuran yang tercatat untuk periode ini di kelompok ini. Setiap pembayaran yang dicatat akan tampil di sini sebagai riwayat."
                    />
                  ) : (
                    <GroupedList>
                      {paymentsList.map((p, idx) => {
                        const m = membersList.find(
                          (x) => x.member_id === p.member_id,
                        );
                        return (
                          <ListRow
                            key={p.payment_id || idx}
                            onClick={() => setPaymentDetail(p)}
                            insetDivider={idx !== paymentsList.length - 1}
                            leading={
                              <span className="w-9 h-9 rounded-xl bg-success-soft flex items-center justify-center text-success shrink-0 font-bold text-ios-body">
                                {(m?.member_name || "?")
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            }
                          >
                            <ChevronRow>
                              <div className="flex items-center justify-between gap-2 w-full">
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-medium">
                                    {m?.member_name || p.member_id}
                                  </p>
                                  <p className="text-ios-caption text-surface-muted truncate">
                                    {p.payment_date}
                                    {p.notes ? ` · ${p.notes}` : ""}
                                  </p>
                                </div>
                                <p className="font-bold shrink-0 tabular-nums">
                                  {formatRp(p.total_amount)}
                                </p>
                              </div>
                            </ChevronRow>
                          </ListRow>
                        );
                      })}
                    </GroupedList>
                  )}
                </section>
              </div>
            )}
          </>
        )}
      </div>

      <BottomSheet
        open={isMemberSheetOpen}
        onClose={() => setIsMemberSheetOpen(false)}
        title={editingMember ? "Edit Anggota" : "Tambah Anggota"}
      >
        <form onSubmit={handleSaveMember}>
          <Input
            label="Nama Anggota"
            placeholder="Nama jamaah"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            required
          />
          <Input
            label="Target Bulanan (Rp)"
            type="number"
            placeholder="0"
            value={memberTarget || ""}
            onChange={(e) => setMemberTarget(Number(e.target.value))}
          />
          <Button type="submit" fullWidth disabled={savingMember}>
            {savingMember ? "Menyimpan…" : "Simpan Anggota"}
          </Button>
          {editingMember && (
            <Button
              type="button"
              variant="softDanger"
              fullWidth
              className="mt-2.5"
              onClick={() => setDeleteMemberTarget(editingMember)}
            >
              Hapus Anggota
            </Button>
          )}
        </form>
      </BottomSheet>

      <BottomSheet
        open={isPaymentSheetOpen}
        onClose={() => setIsPaymentSheetOpen(false)}
        title={paymentForm.payment_id ? "Edit Pembayaran" : "Input Pembayaran"}
      >
        {selectedMember && (
          <form
            onSubmit={handleSubmitPayment}
            data-testid="shodaqoh-payment-overlay"
          >
            <div className="space-y-4">
              <section className="rounded-2xl border border-surface-border bg-surface-card p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-surface-muted mb-2.5">
                  Informasi Pembayaran
                </p>
                <div className="space-y-3">
                  <Segmented<"manual" | "upload">
                    ariaLabel="Metode input"
                    value={payMethod}
                    onChange={setPayMethod}
                    size="sm"
                    options={[
                      { value: "manual", label: "Manual" },
                      { value: "upload", label: "Upload Bukti" },
                    ]}
                  />
                  {payMethod === "upload" && (
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-accent-soft border border-accent/20 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="text-ios-footnote font-semibold text-surface-text">
                          Punya foto bukti transfer?
                        </p>
                        <p className="text-ios-caption text-surface-muted mt-0.5">
                          Scan dengan AI untuk isi otomatis
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setIsAiSheetOpen(true)}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Sparkles size={13} /> Scan
                        </span>
                      </Button>
                    </div>
                  )}
                  <div>
                    <p className="text-ios-footnote font-medium text-surface-muted mb-1.5 px-1">
                      Anggota
                    </p>
                    <div className="rounded-xl border border-surface-border overflow-hidden">
                      <div className="max-h-40 overflow-y-auto divide-y divide-surface-border">
                        {membersList.map((m) => {
                          const active =
                            m.member_id === selectedMember.member_id;
                          return (
                            <button
                              key={m.member_id}
                              type="button"
                              onClick={() => handleOpenPaymentSheet(m)}
                              className={`w-full text-left px-3.5 py-2.5 text-ios-body transition-colors active:bg-surface-card2 ${
                                active
                                  ? "bg-accent-soft text-accent font-semibold"
                                  : "text-surface-text hover:bg-surface-card2"
                              }`}
                            >
                              <span className="inline-flex items-center gap-2">
                                {active && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                                )}
                                <span className="truncate">
                                  {m.member_name}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <DateInput
                    label="Tanggal Pembayaran"
                    value={paymentForm.payment_date}
                    onChange={(val) =>
                      setPaymentForm({
                        ...paymentForm,
                        payment_date: val,
                      })
                    }
                    required
                    data-testid="shod-payment-date"
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-surface-border bg-surface-card p-3.5">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-surface-muted">
                    Susulan IR
                  </p>
                  <button
                    type="button"
                    className="text-ios-footnote font-bold text-accent active:opacity-70"
                    onClick={() =>
                      setCarryovers((prev) => [
                        ...prev,
                        { month: "", amount: 0 },
                      ])
                    }
                  >
                    + Tambah bulan
                  </button>
                </div>
                {carryovers.length === 0 ? (
                  <div className="rounded-xl bg-surface-card2 border border-dashed border-surface-border px-3 py-4 text-center">
                    <p className="text-ios-caption text-surface-muted">
                      Tidak ada susulan. Ketuk “+ Tambah bulan” bila ada
                      tunggakan.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {carryovers.map((row, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-[110px_1fr_44px] gap-2 items-stretch rounded-xl bg-surface-card2 border border-surface-border p-2"
                      >
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="MM-YYYY"
                          maxLength={7}
                          value={
                            /^(\d{4})-(\d{2})$/.test(row.month)
                              ? `${row.month.slice(5, 7)}-${row.month.slice(0, 4)}`
                              : row.month
                          }
                          onChange={(e) => {
                            const digits = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6);
                            const mm = digits.slice(0, 2);
                            const yyyy = digits.slice(2, 6);
                            const formatted =
                              digits.length <= 2 ? mm : `${mm}-${yyyy}`;
                            setCarryovers((prev) =>
                              prev.map((r, i) =>
                                i === idx ? { ...r, month: formatted } : r,
                              ),
                            );
                          }}
                          aria-label={`Bulan susulan ${idx + 1}`}
                        />
                        <Input
                          type="number"
                          placeholder="0"
                          value={row.amount || ""}
                          onChange={(e) =>
                            setCarryovers((prev) =>
                              prev.map((r, i) =>
                                i === idx
                                  ? { ...r, amount: Number(e.target.value) }
                                  : r,
                              ),
                            )
                          }
                          aria-label={`Nominal susulan ${idx + 1}`}
                        />
                        <button
                          type="button"
                          className="w-12 h-12 rounded-xl bg-danger-soft text-danger flex items-center justify-center text-lg font-bold active:scale-95 transition-transform"
                          onClick={() =>
                            setCarryovers((prev) =>
                              prev.filter((_, i) => i !== idx),
                            )
                          }
                          aria-label={`Hapus susulan ${idx + 1}`}
                          title="Hapus baris"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center justify-between rounded-xl bg-accent-soft border border-accent/20 px-3.5 py-2.5">
                      <span className="text-ios-caption font-semibold text-surface-muted">
                        Total susulan
                      </span>
                      <span className="font-display text-ios-body font-extrabold text-accent tabular-nums">
                        {formatRp(carryoverTotal)}
                      </span>
                    </div>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-surface-border bg-surface-card p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-surface-muted mb-2.5">
                  Realisasi Pembayaran
                </p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  {PAYMENT_FIELDS.map((f) => (
                    <Input
                      key={f.key}
                      label={f.label}
                      type="number"
                      value={(paymentForm as any)[f.key] || ""}
                      onChange={(e) =>
                        setPaymentForm({
                          ...paymentForm,
                          [f.key]: Number(e.target.value),
                        })
                      }
                    />
                  ))}
                </div>
                <div className="mt-3">
                  <Input
                    label="Keterangan"
                    placeholder="Catatan tambahan…"
                    value={paymentForm.notes}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, notes: e.target.value })
                    }
                  />
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-accent-soft border border-accent/20 px-3.5 py-3">
                  <span className="text-ios-body font-semibold text-surface-text">
                    Total Realisasi
                  </span>
                  <span className="font-display text-ios-nav font-extrabold text-accent tabular-nums">
                    {formatRp(paymentTotal)}
                  </span>
                </div>
              </section>

              <section className="space-y-2.5">
                <SheetFooter
                  onCancel={() => setIsPaymentSheetOpen(false)}
                  submitLabel="Simpan"
                  saving={savingPayment}
                  cancelTestId="btn-cancel-shodaqoh-payment"
                  submitTestId="btn-submit-shodaqoh-payment"
                />
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setIsAiSheetOpen(true)}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles size={14} /> Scan Foto (AI OCR)
                  </span>
                </Button>
              </section>
            </div>
          </form>
        )}
      </BottomSheet>

      <BottomSheet
        open={isAiSheetOpen}
        onClose={() => setIsAiSheetOpen(false)}
        title="Scan Foto via AI"
      >
        <p className="text-ios-footnote text-surface-muted mb-4 px-1">
          Tempel Base64 atau URL foto catatan shodaqoh untuk diekstraksi
          nominalnya otomatis.
        </p>
        <Input
          label="Foto (Base64 / URL)"
          placeholder="data:image/jpeg;base64,…"
          value={aiPhotoUrl}
          onChange={(e) => setAiPhotoUrl(e.target.value)}
        />
        <Button fullWidth disabled={aiExtracting} onClick={handleAiExtract}>
          {aiExtracting ? "Mengekstraksi…" : "Ekstrak Foto"}
        </Button>
      </BottomSheet>

      <BottomSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        title="Filter Shodaqoh"
      >
        <div data-testid="shodaqoh-filter-sheet">
          <p className="text-ios-footnote font-semibold px-1 mb-2">Tahun</p>
          <div className="flex gap-2 flex-wrap mb-4">
            {[
              "all",
              String(new Date().getFullYear()),
              String(new Date().getFullYear() - 1),
              String(new Date().getFullYear() - 2),
            ].map((y) => (
              <FilterChip
                key={y}
                active={draftYear === y}
                label={y === "all" ? "Semua" : y}
                onClick={() => setDraftYear(y)}
              />
            ))}
          </div>
          <p className="text-ios-footnote font-semibold px-1 mb-2">
            Bulan periode
          </p>
          <div className="mb-4 px-1">
            <Input
              type="month"
              value={draftMonth}
              onChange={(e) => setDraftMonth(e.target.value)}
              aria-label="Bulan periode"
            />
          </div>
          <p className="text-ios-footnote font-semibold px-1 mb-2">Status</p>
          <div className="flex gap-2 flex-wrap mb-4">
            {(["ALL", "LUNAS", "BELUM"] as const).map((s) => (
              <FilterChip
                key={s}
                active={draftStatus === s}
                label={
                  s === "ALL" ? "Semua" : s === "LUNAS" ? "Lunas" : "Belum"
                }
                onClick={() => setDraftStatus(s)}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              variant="secondary"
              onClick={() => {
                const d = new Date();
                const cur = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                setDraftMonth(cur);
                setDraftStatus("ALL");
                setDraftYear("all");
              }}
              data-testid="btn-reset-shodaqoh-filter"
            >
              Reset
            </Button>
            <Button
              onClick={() => {
                if (draftMonth) {
                  if (
                    draftYear !== "all" &&
                    !draftMonth.startsWith(draftYear)
                  ) {
                    showToast(`Bulan harus di tahun ${draftYear}`, "error");
                    return;
                  }
                  setSelectedMonth(draftMonth);
                }
                setStatusFilter(draftStatus);
                setFilterSheetOpen(false);
              }}
              data-testid="btn-apply-shodaqoh-filter"
            >
              Terapkan
            </Button>
          </div>
        </div>
      </BottomSheet>

      <BottomSheet
        open={!!memberActionTarget}
        onClose={() => setMemberActionTarget(null)}
        title={memberActionTarget?.member_name || "Anggota"}
      >
        {memberActionTarget && (
          <div
            className="grid gap-2.5"
            data-testid="shod-member-action-overlay"
          >
            {(() => {
              const existingPay = paymentsList.find(
                (p) =>
                  p.member_id === memberActionTarget.member_id &&
                  p.status !== "INACTIVE" &&
                  (Number(p.total_amount) || 0) > 0,
              );
              return (
                <Button
                  variant="secondary"
                  fullWidth
                  data-testid="btn-member-action-pay"
                  onClick={() => {
                    const m = memberActionTarget;
                    setMemberActionTarget(null);
                    handleOpenPaymentSheet(m, existingPay);
                  }}
                >
                  {existingPay ? "Edit Pembayaran" : "Input Pembayaran"}
                </Button>
              );
            })()}
            <Button
              variant="secondary"
              fullWidth
              data-testid="btn-member-action-detail"
              onClick={() => {
                setMemberDetailTarget(memberActionTarget);
                setMemberActionTarget(null);
              }}
            >
              Detail Anggota
            </Button>
            <Button
              variant="secondary"
              fullWidth
              data-testid="btn-member-action-edit"
              onClick={() => {
                const m = memberActionTarget;
                setEditingMember(m);
                setMemberName(m.member_name);
                setMemberTarget(m.monthly_target);
                setMemberActionTarget(null);
                setIsMemberSheetOpen(true);
              }}
            >
              Edit Anggota
            </Button>
            <Button
              variant="softDanger"
              fullWidth
              data-testid="btn-member-action-delete"
              onClick={() => {
                setDeleteMemberTarget(memberActionTarget);
                setMemberActionTarget(null);
              }}
            >
              Hapus Anggota
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setMemberActionTarget(null)}
              data-testid="btn-member-action-cancel"
            >
              Batal
            </Button>
          </div>
        )}
      </BottomSheet>

      <BottomSheet
        open={!!memberDetailTarget}
        onClose={() => setMemberDetailTarget(null)}
        title={memberDetailTarget?.member_name || "Detail Anggota"}
      >
        {memberDetailTarget && (
          <div data-testid="shod-member-detail-overlay">
            {(() => {
              const lastKey =
                yearlyMaxMonth > 0
                  ? `${yearlyYear}-${String(yearlyMaxMonth).padStart(2, "0")}`
                  : selectedMonth;
              const src =
                yearlyPayments.length > 0 ? yearlyPayments : paymentsList;
              const mine = src.filter(
                (p: any) =>
                  p.member_id === memberDetailTarget.member_id &&
                  p.status !== "REVERSED" &&
                  p.status !== "INACTIVE" &&
                  (p.payment_date || "").slice(0, 4) === yearlyYear &&
                  (p.payment_date || "").slice(0, 7) <= lastKey,
              );
              const byMonth = new Map<string, any[]>();
              for (const p of mine) {
                const k = (p.payment_date || "").slice(0, 7);
                if (!byMonth.has(k)) byMonth.set(k, []);
                byMonth.get(k)!.push(p);
              }
              const sum = (arr: any[], f: (p: any) => number) =>
                arr.reduce((s, p) => s + (Number(f(p)) || 0), 0);
              const months: string[] = [];
              {
                const maxM =
                  yearlyMaxMonth > 0
                    ? yearlyMaxMonth
                    : Number((selectedMonth || "").slice(5, 7)) || 12;
                for (let i = 1; i <= maxM; i++)
                  months.push(`${yearlyYear}-${String(i).padStart(2, "0")}`);
              }
              const grand = {
                ir: 0,
                sambung: 0,
                jimpitan: 0,
                siar: 0,
                seribu: 0,
                kafan: 0,
                ukhro: 0,
                total: 0,
              };
              const mLabel = (k: string) =>
                new Date(
                  Number(k.slice(0, 4)),
                  Number(k.slice(5, 7)) - 1,
                  1,
                ).toLocaleDateString("id-ID", { month: "short" });
              return (
                <>
                  <div className="grid grid-cols-2 gap-2.5 mb-3">
                    <Card className="!p-3">
                      <p className="text-ios-caption text-surface-muted">
                        Target / bln
                      </p>
                      <p className="font-extrabold">
                        {formatRp(memberDetailTarget.monthly_target)}
                      </p>
                    </Card>
                    <Card className="!p-3">
                      <p className="text-ios-caption text-surface-muted">
                        Total Jan-
                        {months.length > 0
                          ? mLabel(months[months.length - 1])
                          : "-"}
                      </p>
                      <p className="font-extrabold text-accent">
                        {formatRp(sum(mine, (p) => p.total_amount))}
                      </p>
                    </Card>
                  </div>
                  <GroupedList>
                    {months.map((k, idx) => {
                      const arr = byMonth.get(k) || [];
                      const v = {
                        ir: sum(arr, (p) => p.carryover_ir),
                        sambung: sum(arr, (p) => p.connecting_fund),
                        jimpitan: sum(arr, (p) => p.community_dues),
                        siar: sum(arr, (p) => p.outreach_fund),
                        seribu: sum(arr, (p) => p.thousand_fund),
                        kafan: sum(arr, (p) => p.funeral_fund),
                        ukhro: sum(arr, (p) => p.ukhro_mt),
                        total: sum(arr, (p) => p.total_amount),
                      };
                      grand.ir += v.ir;
                      grand.sambung += v.sambung;
                      grand.jimpitan += v.jimpitan;
                      grand.siar += v.siar;
                      grand.seribu += v.seribu;
                      grand.kafan += v.kafan;
                      grand.ukhro += v.ukhro;
                      grand.total += v.total;
                      const irMonths = [
                        ...new Set(
                          arr
                            .flatMap((p: any) =>
                              (p.carryover_items || []).map((it: any) =>
                                String(it.month || ""),
                              ),
                            )
                            .filter(Boolean),
                        ),
                      ]
                        .map((mm) => formatCarryMonth(mm))
                        .join(", ");
                      const empty = arr.length === 0;
                      const parts = [
                        v.ir > 0 ? `IR ${formatRp(v.ir)}` : "",
                        v.sambung > 0 ? `Sambung ${formatRp(v.sambung)}` : "",
                        v.jimpitan > 0
                          ? `Jimpitan ${formatRp(v.jimpitan)}`
                          : "",
                        v.siar > 0 ? `Siar ${formatRp(v.siar)}` : "",
                        v.seribu > 0 ? `Seribu ${formatRp(v.seribu)}` : "",
                        v.kafan > 0 ? `Kafan ${formatRp(v.kafan)}` : "",
                        v.ukhro > 0 ? `Ukhro ${formatRp(v.ukhro)}` : "",
                      ].filter(Boolean);
                      return (
                        <ListRow
                          key={k}
                          onClick={() => {
                            if (arr.length > 0) {
                              setMemberDetailTarget(null);
                              setPaymentDetail(arr[arr.length - 1]);
                            } else {
                              setSelectedMonth(k);
                              setMemberDetailTarget(null);
                            }
                          }}
                          insetDivider={idx !== months.length - 1}
                          className={`${k === selectedMonth ? "bg-accent-soft/40" : ""} ${empty ? "opacity-50" : ""}`}
                        >
                          <ChevronRow>
                            <div className="flex items-center justify-between gap-2 w-full">
                              <div className="min-w-0 flex-1">
                                <p className="text-ios-body font-semibold text-surface-text truncate">
                                  {mLabel(k)} {yearlyYear}
                                </p>
                                {empty ? (
                                  <p className="text-ios-caption text-surface-muted truncate">
                                    Belum ada pembayaran
                                  </p>
                                ) : (
                                  <>
                                    <p className="text-ios-caption text-surface-muted truncate">
                                      {parts.join(" · ")}
                                    </p>
                                    {irMonths ? (
                                      <p className="text-ios-caption text-accent truncate font-medium">
                                        Susulan: {irMonths}
                                      </p>
                                    ) : null}
                                  </>
                                )}
                              </div>
                              <p className="font-bold text-accent shrink-0">
                                {v.total > 0 ? formatRp(v.total) : "-"}
                              </p>
                            </div>
                          </ChevronRow>
                        </ListRow>
                      );
                    })}
                    <ListRow
                      insetDivider={false}
                      className="bg-surface-card2/60"
                    >
                      <div className="flex items-center justify-between gap-2 w-full">
                        <div className="min-w-0 flex-1">
                          <p className="text-ios-body font-bold text-surface-text truncate">
                            Total Jan-
                            {months.length > 0
                              ? mLabel(months[months.length - 1])
                              : "-"}
                          </p>
                          <p className="text-ios-caption text-surface-muted truncate">
                            IR {formatRp(grand.ir)} · Sambung{" "}
                            {formatRp(grand.sambung)} · Jimpitan{" "}
                            {formatRp(grand.jimpitan)}
                          </p>
                        </div>
                        <p className="font-extrabold text-accent shrink-0">
                          {formatRp(grand.total)}
                        </p>
                      </div>
                    </ListRow>
                  </GroupedList>
                  <p className="px-1 py-2 text-ios-caption text-surface-muted">
                    Ketuk bulan yang sudah bayar untuk melihat rinciannya. Baris
                    IR mencantumkan bulan susulan yang dibayar.
                  </p>
                  <Button
                    fullWidth
                    variant="secondary"
                    className="mt-3"
                    onClick={() => setMemberDetailTarget(null)}
                    data-testid="btn-close-shod-member-detail"
                  >
                    Tutup
                  </Button>
                </>
              );
            })()}
          </div>
        )}
      </BottomSheet>

      <BottomSheet
        open={!!paymentDetail}
        onClose={() => setPaymentDetail(null)}
        title="Rincian Pembayaran"
      >
        {paymentDetail && (
          <div data-testid="shod-payment-detail-overlay">
            {(() => {
              const m = membersList.find(
                (x) => x.member_id === paymentDetail.member_id,
              );
              const rows: Array<[string, number]> = [
                ["Susulan IR", Number(paymentDetail.carryover_ir) || 0],
                ["Uang Sambung", Number(paymentDetail.connecting_fund) || 0],
                ["Jimpitan", Number(paymentDetail.community_dues) || 0],
                ["Siar-Siar", Number(paymentDetail.outreach_fund) || 0],
                ["Seribuan", Number(paymentDetail.thousand_fund) || 0],
                ["Kafan", Number(paymentDetail.funeral_fund) || 0],
                ["Ukhro MT", Number(paymentDetail.ukhro_mt) || 0],
              ];
              return (
                <>
                  <p className="text-ios-footnote font-semibold px-1 mb-2">
                    {m?.member_name || paymentDetail.member_id} ·{" "}
                    {paymentDetail.payment_date}
                  </p>
                  <GroupedList flush>
                    {rows.map(([l, v]) => (
                      <ListRow key={l} insetDivider>
                        <div className="flex items-center justify-between w-full">
                          <p className="text-ios-body">{l}</p>
                          <p className="font-bold">{formatRp(v)}</p>
                        </div>
                      </ListRow>
                    ))}
                    <ListRow insetDivider={false}>
                      <div className="flex items-center justify-between w-full">
                        <p className="font-bold">Total</p>
                        <p className="font-extrabold text-accent">
                          {formatRp(paymentDetail.total_amount)}
                        </p>
                      </div>
                    </ListRow>
                  </GroupedList>
                  {paymentDetail.notes && (
                    <p className="text-ios-caption text-surface-muted px-1 mt-2">
                      Catatan: {paymentDetail.notes}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2.5 mt-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const pay = paymentDetail;
                        setPaymentDetail(null);
                        if (m) {
                          setSelectedMember(m);
                          setPaymentForm({
                            payment_id: pay.payment_id || "",
                            payment_date:
                              pay.payment_date ||
                              new Date().toISOString().slice(0, 10),
                            connecting_fund: Number(pay.connecting_fund) || 0,
                            community_dues: Number(pay.community_dues) || 0,
                            outreach_fund: Number(pay.outreach_fund) || 0,
                            thousand_fund: Number(pay.thousand_fund) || 0,
                            funeral_fund: Number(pay.funeral_fund) || 0,
                            ukhro_mt: Number(pay.ukhro_mt) || 0,
                            notes: pay.notes || "",
                          });
                          setCarryovers(
                            (pay.carryover_items || []).map((it: any) => ({
                              month: String(it.month || ""),
                              amount: Number(it.amount) || 0,
                            })),
                          );
                          setIsPaymentSheetOpen(true);
                        }
                      }}
                      data-testid="btn-shod-edit-payment"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="softDanger"
                      disabled={reversing}
                      onClick={async () => {
                        setReversing(true);
                        try {
                          await financeApi.reverseDuePayment(
                            assignedGroup,
                            paymentDetail.payment_id,
                          );
                          showToast(
                            "Pembayaran dibatalkan (reverse)",
                            "success",
                          );
                          setPaymentDetail(null);
                          loadData();
                        } catch (err: any) {
                          showToast(
                            err instanceof ApiError
                              ? err.message
                              : "Gagal membatalkan",
                            "error",
                          );
                        } finally {
                          setReversing(false);
                        }
                      }}
                      data-testid="btn-shod-reverse-payment"
                    >
                      {reversing ? "Proses…" : "Batalkan"}
                    </Button>
                  </div>
                  <Button
                    fullWidth
                    variant="ghost"
                    className="mt-2.5"
                    onClick={() => setPaymentDetail(null)}
                    data-testid="btn-close-shod-payment-detail"
                  >
                    Tutup
                  </Button>
                </>
              );
            })()}
          </div>
        )}
      </BottomSheet>

      <ConfirmDialog
        open={!!deleteMemberTarget}
        title="Hapus anggota?"
        description={`“${deleteMemberTarget?.member_name}” akan dihapus dari daftar shodaqoh beserta riwayat pembayarannya.`}
        confirmLabel="Ya, hapus"
        danger
        loading={deletingMember}
        onConfirm={handleConfirmDeleteMember}
        onCancel={() => setDeleteMemberTarget(null)}
      />
    </AppLayout>
  );
};
