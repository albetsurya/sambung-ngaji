import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  financeApi,
  type DueMember,
  type DuesDataResponse,
} from "../api/financeApi";
import { formatRp } from "../../../utils/format";
import { useToast } from "../../../contexts/ToastContext";
import { usePermission } from "../../../hooks/usePermission";
import { AppLayout, Header, FloatingActionButton } from "../../../components/layout/AppLayout";
import {
  Button,
  Input,
  FilterChip,
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
  Heart,
  Printer,
  RefreshCw,
  Sparkles,
} from "../../../components/common/FontAwesomeIcons";
import { useFinanceSync } from "../hooks/useFinanceSync";
import { MonthlyDuesPrintModal } from "../components/MonthlyDuesPrintModal";
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
  month: string; // YYYY-MM
  amount: number;
}

function formatCarryMonth(ym: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(ym || "");
  if (!m) return ym;
  try {
    return new Date(Number(m[1]), Number(m[2]) - 1, 1).toLocaleDateString("id-ID", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return ym;
  }
}

function formatCarrySummary(items: { month: string; amount: number }[]): string {
  if (!items.length) return "";
  const months = items.map((it) => formatCarryMonth(it.month)).join(", ");
  const total = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
  return `Susulan ${months} · ${formatRp(total)}`;
}

export const MonthlyDuesPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { assignedGroup, isSuperAdmin } = usePermission();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [data, setData] = useState<DuesDataResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${m}`;
  });
  const [statusFilter, setStatusFilter] = useState<"ALL" | "LUNAS" | "BELUM">("ALL");

  const [isMemberSheetOpen, setIsMemberSheetOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<DueMember | null>(null);
  const [memberName, setMemberName] = useState("");
  const [memberTarget, setMemberTarget] = useState(0);
  const [savingMember, setSavingMember] = useState(false);
  const [deleteMemberTarget, setDeleteMemberTarget] = useState<DueMember | null>(null);
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

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const loadData = async () => {
    if (!assignedGroup) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const res = await financeApi.getShodaqohData(assignedGroup, selectedMonth);
      setData(res);
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : "Gagal memuat data shodaqoh";
      setLoadError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth, assignedGroup]);

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
        await financeApi.updateDueMember(assignedGroup, editingMember.member_id, memberName, memberTarget);
        showToast("Anggota shodaqoh berhasil diperbarui", "success");
      } else {
        await financeApi.addDueMember(assignedGroup, memberName, memberTarget);
        showToast("Anggota shodaqoh berhasil ditambahkan", "success");
      }
      setIsMemberSheetOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err instanceof ApiError ? err.message : "Gagal menyimpan anggota", "error");
    } finally {
      setSavingMember(false);
    }
  };

  const handleConfirmDeleteMember = async () => {
    if (!deleteMemberTarget) return;
    setDeletingMember(true);
    try {
      await financeApi.deleteDueMember(assignedGroup, deleteMemberTarget.member_id);
      showToast("Anggota shodaqoh berhasil dihapus", "success");
      setDeleteMemberTarget(null);
      setIsMemberSheetOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err instanceof ApiError ? err.message : "Gagal menghapus anggota", "error");
    } finally {
      setDeletingMember(false);
    }
  };

  const handleOpenPaymentSheet = async (member: DueMember) => {
    setSelectedMember(member);
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
      const lastRes = await financeApi.getShodaqohLastNominals(assignedGroup, member.member_id);
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
            items.map((it: any) => ({ month: String(it.month || ""), amount: Number(it.amount) || 0 }))
          );
        }
      }
    } catch {
      /* fallback empty */
    }
    setIsPaymentSheetOpen(true);
  };

  const carryoverTotal = carryovers.reduce((s, r) => s + (Number(r.amount) || 0), 0);

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
    const cleanCarryovers = carryovers
      .filter((r) => r.month && (Number(r.amount) || 0) > 0)
      .map((r) => ({ month: r.month, amount: Number(r.amount) }));
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
      showToast(err instanceof ApiError ? err.message : "Gagal menyimpan pembayaran", "error");
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
            prev.length
              ? prev
              : [{ month: "", amount: aiIr }]
          );
          showToast("Nominal susulan terdeteksi — pilih bulannya manual", "warning");
        }
        setIsAiSheetOpen(false);
      } else {
        showToast(res.message || "Gagal membaca foto", "error");
      }
    } catch (err: any) {
      showToast(err instanceof ApiError ? err.message : "Gagal memproses AI OCR", "error");
    } finally {
      setAiExtracting(false);
    }
  };

  const membersList = data?.members || [];
  const paymentsList = data?.payments || [];
  const paidIds = new Set(
    paymentsList
      .filter((p) => p.status !== "INACTIVE" && p.total_amount > 0)
      .map((p) => p.member_id)
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
    ? new Date(Number(selectedMonth.slice(0, 4)), Number(selectedMonth.slice(5, 7)) - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
    : "";

  return (
    <AppLayout
      fab={
        <FloatingActionButton
          onClick={handleOpenAddMember}
          label="Tambah Anggota"
        />
      }
    >
      <Header
        title="Shodaqoh & Infaq"
        subtitle={monthLabel}
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
              onClick={() => setIsPrintModalOpen(true)}
              aria-label="Cetak matriks"
              title="Cetak matriks"
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
                ? "Pilih kelompok dulu di menu Kelompok Saya untuk membuka shodaqoh kelompok."
                : "Akun Anda belum dipetakan ke kelompok. Hubungi admin."
            }
            icon={<Heart size={26} className="text-accent" />}
            action={<Button size="sm" onClick={() => navigate("/lainnya")}>Ke Menu Lainnya</Button>}
          />
        ) : loadError && !data ? (
          <ErrorState message={loadError} onRetry={loadData} />
        ) : (
          <>
            {dashboard && (
              <section>
                <p className="px-4 mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-surface-muted">
                  Capaian Bulan Ini
                </p>
                <Card className="mx-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-ios-caption font-medium text-surface-muted">Target</p>
                      <p className="font-display text-ios-nav font-extrabold text-surface-text">
                        {formatRp(dashboard.target)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-ios-caption font-medium text-surface-muted">Terkumpul</p>
                      <p className="font-display text-ios-nav font-extrabold text-accent">
                        {formatRp(dashboard.received)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-surface-card2 overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="mt-2.5 flex items-center gap-2 text-ios-caption flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-accent-soft text-accent font-bold">
                      {progressPct}% tercapai
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-success-soft text-success font-bold">
                      {dashboard.paidCount} lunas
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-card2 text-surface-muted font-bold">
                      {dashboard.unpaidCount} belum
                    </span>
                    <span className="text-surface-muted font-medium ml-auto">
                      {dashboard.memberCount} anggota
                    </span>
                  </div>
                </Card>
              </section>
            )}

            <section>
              <p className="px-4 mb-2.5 mt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-surface-muted">
                Periode & Status
              </p>
              <div className="px-4 mb-2.5">
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  aria-label="Periode bulan"
                />
              </div>
              <div className="px-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {(["ALL", "LUNAS", "BELUM"] as const).map((s) => (
                  <FilterChip
                    key={s}
                    active={statusFilter === s}
                    label={s === "ALL" ? "Semua" : s === "LUNAS" ? "Lunas" : "Belum Lunas"}
                    onClick={() => setStatusFilter(s)}
                  />
                ))}
              </div>
              <div className="px-4 mt-2.5">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama anggota…"
                />
              </div>
            </section>

            <section>
              <p className="px-4 mb-2.5 mt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-surface-muted">
                Anggota ({visibleMembers.length})
              </p>
              {loading ? (
                <GroupedListSkeleton rows={5} />
              ) : visibleMembers.length === 0 ? (
                <EmptyState
                  title="Belum ada anggota"
                  description="Tambahkan anggota shodaqoh memakai tombol + di bawah."
                />
              ) : (
                <GroupedList>
                  {visibleMembers.map((m, idx) => {
                    const payment = paymentsList.find((p) => p.member_id === m.member_id);
                    const isInactive = payment?.status === "INACTIVE";
                    const hasPaid = Boolean(payment && !isInactive && payment.total_amount > 0);
                    const carrySummary = payment ? formatCarrySummary(payment.carryover_items || []) : "";
                    return (
                      <ListRow
                        key={m.member_id}
                        onClick={() => handleOpenPaymentSheet(m)}
                        insetDivider={idx !== visibleMembers.length - 1}
                        leading={
                          <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0 font-bold text-ios-body">
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
                                Target {formatRp(m.monthly_target)}
                                {hasPaid && payment ? ` · Terbayar ${formatRp(payment.total_amount)}` : ""}
                              </p>
                              {carrySummary && (
                                <p className="text-ios-caption text-accent truncate font-medium">
                                  {carrySummary}
                                </p>
                              )}
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                                isInactive
                                  ? "bg-surface-card2 text-surface-muted line-through"
                                  : hasPaid
                                    ? "bg-success-soft text-success"
                                    : "bg-surface-card2 text-surface-muted"
                              }`}
                            >
                              {isInactive ? "Nonaktif" : hasPaid ? "Lunas" : "Belum"}
                            </span>
                          </div>
                        </ChevronRow>
                      </ListRow>
                    );
                  })}
                </GroupedList>
              )}
            </section>
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
        title="Input Pembayaran"
      >
        {selectedMember && (
          <form onSubmit={handleSubmitPayment}>
            <p className="text-ios-footnote font-semibold text-accent mb-4 px-1">
              {selectedMember.member_name}
            </p>
            <Input
              label="Tanggal Pembayaran"
              type="date"
              value={paymentForm.payment_date}
              onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
              required
            />
            <div className="mb-1">
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-ios-footnote font-semibold text-surface-text">
                  Susulan IR (per bulan)
                </span>
                <button
                  type="button"
                  className="text-ios-footnote font-bold text-accent"
                  onClick={() => setCarryovers((prev) => [...prev, { month: "", amount: 0 }])}
                >
                  + Tambah bulan
                </button>
              </div>
              {carryovers.length === 0 ? (
                <p className="text-ios-caption text-surface-muted px-1 mb-2">
                  Tidak ada susulan. Ketuk “Tambah bulan” bila ada tunggakan bulan lalu.
                </p>
              ) : (
                <div className="space-y-2 mb-2">
                  {carryovers.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                      <Input
                        label={idx === 0 ? "Bulan" : undefined}
                        type="month"
                        value={row.month}
                        onChange={(e) =>
                          setCarryovers((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, month: e.target.value } : r))
                          )
                        }
                        aria-label={`Bulan susulan ${idx + 1}`}
                      />
                      <Input
                        label={idx === 0 ? "Nominal (Rp)" : undefined}
                        type="number"
                        value={row.amount || ""}
                        onChange={(e) =>
                          setCarryovers((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, amount: Number(e.target.value) } : r))
                          )
                        }
                        aria-label={`Nominal susulan ${idx + 1}`}
                      />
                      <button
                        type="button"
                        className="h-11 px-3 rounded-xl bg-danger-soft text-danger text-ios-body font-bold"
                        onClick={() => setCarryovers((prev) => prev.filter((_, i) => i !== idx))}
                        aria-label={`Hapus susulan ${idx + 1}`}
                        title="Hapus baris"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Card className="flex items-center justify-between !py-2.5 mb-1">
                <span className="text-ios-caption font-semibold text-surface-muted">Total susulan (otomatis)</span>
                <span className="font-display text-ios-body font-extrabold text-accent">
                  {formatRp(carryoverTotal)}
                </span>
              </Card>
            </div>
            <div className="grid grid-cols-2 gap-x-3">
              {PAYMENT_FIELDS.map((f) => (
                <Input
                  key={f.key}
                  label={f.label}
                  type="number"
                  value={(paymentForm as any)[f.key] || ""}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, [f.key]: Number(e.target.value) })
                  }
                />
              ))}
            </div>
            <Input
              label="Keterangan"
              placeholder="Catatan tambahan…"
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
            />
            <Card className="flex items-center justify-between !py-3 mb-4">
              <span className="text-ios-footnote font-semibold text-surface-muted">Total Realisasi</span>
              <span className="font-display text-ios-nav font-extrabold text-accent">
                {formatRp(paymentTotal)}
              </span>
            </Card>
            <Button type="submit" fullWidth disabled={savingPayment}>
              {savingPayment ? "Menyimpan…" : "Simpan Pembayaran"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              className="mt-2.5"
              onClick={() => setIsAiSheetOpen(true)}
            >
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={14} /> Scan Foto (AI OCR)
              </span>
            </Button>
          </form>
        )}
      </BottomSheet>

      <BottomSheet
        open={isAiSheetOpen}
        onClose={() => setIsAiSheetOpen(false)}
        title="Scan Foto via AI"
      >
        <p className="text-ios-footnote text-surface-muted mb-4 px-1">
          Tempel Base64 atau URL foto catatan shodaqoh untuk diekstraksi nominalnya otomatis.
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

      <MonthlyDuesPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        members={membersList}
        payments={paymentsList}
        periodLabel={selectedMonth}
      />
    </AppLayout>
  );
};
