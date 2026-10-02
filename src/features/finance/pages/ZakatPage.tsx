import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { financeApi, type ZakatItem, ZAKAT_CATEGORIES, zakatCategoryLabel } from "../api/financeApi";
import { formatRp } from "../../../utils/format";
import { useToast } from "../../../contexts/ToastContext";
import { usePermission } from "../../../hooks/usePermission";
import { AppLayout, Header, FloatingActionButton } from "../../../components/layout/AppLayout";
import {
  Button,
  Input,
  DateInput,
  FilterChip,
  GroupedList,
  ListRow,
  ChevronRow,
  BottomSheet,
  ConfirmDialog,
  EmptyState,
  ErrorState,
} from "../../../components/ui";
import { GroupedListSkeleton } from "../../../components/ui/Skeleton";
import { ScrollText as Scroll } from "../../../components/ui/FontAwesomeIcons";
import { useFinanceSync } from "../hooks/useFinanceSync";
import { useFinanceBack } from "../hooks/useFinanceBack";
import { ApiError } from "../../../services/api";
import {
  SectionTitle,
  StatusPill,
  HeaderActions,
  SyncHeaderButton,
  FilterHeaderButton,
  NoGroupEmpty,
  SheetFooter,
} from "../components/FinanceShared";
/**
 * Zakat list ringkas -> detail penuh di /finance/zakat/:id.
 * Detail berisi tab Muzaki/Rincian/Mustahik + sheet edit masing-masing + edit title.
 */
export const ZakatPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { assignedGroup, isSuperAdmin } = usePermission();
  const financeBack = useFinanceBack();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [zakatList, setZakatList] = useState<ZakatItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    soul_count: 1,
    total_rice_kg: 2.7,
    total_money_rp: 0,
    transaction_date: new Date().toISOString().slice(0, 10),
    location: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ZakatItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");
  const [draftType, setDraftType] = useState<string>("ALL");
  const [draftYear, setDraftYear] = useState<string>("all");
  const hasActiveFilter = statusFilter !== "ALL" || typeFilter !== "ALL" || yearFilter !== "all";
  const loadData = async () => {
    if (!assignedGroup) { setZakatList([]); setLoading(false); return; }
    setLoading(true); setLoadError(null);
    try {
      const res = await financeApi.getZakatList(assignedGroup);
      if (res?.data) setZakatList(res.data);
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : "Gagal memuat data zakat";
      setLoadError(msg); showToast(msg, "error");
    } finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, [assignedGroup]);
  const { syncing: syncingSheet, sync: syncSheet } = useFinanceSync(loadData);
  const handleSaveZakat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast("Judul zakat wajib diisi", "error"); return; }
    const payload = { ...form };
    setSaving(true);
    try {
      await financeApi.manageZakat(assignedGroup, "createZakat", payload);
      showToast("Data zakat baru berhasil dicatat", "success");
      setIsSheetOpen(false); loadData();
    } catch (err: any) {
      showToast(err instanceof ApiError ? err.message : "Gagal menyimpan zakat", "error");
    } finally { setSaving(false); }
  };
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await financeApi.manageZakat(assignedGroup, "deleteZakat", { zakat_id: deleteTarget.zakat_id });
      showToast("Catatan zakat berhasil dihapus", "success");
      setDeleteTarget(null); loadData();
    } catch (err: any) {
      showToast(err instanceof ApiError ? err.message : "Gagal menghapus zakat", "error");
    } finally { setDeleting(false); }
  };
  const filteredZakat = zakatList.filter((z) => {
    if (statusFilter !== "ALL" && (z.status || "ACTIVE").toUpperCase() !== statusFilter) return false;
    if (typeFilter !== "ALL" && !(z.categories || []).includes(typeFilter)) return false;
    if (yearFilter !== "all" && (z.transaction_date || "").slice(0, 4) !== yearFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return ((z.title || "") + " " + (z.categories || []).map((c) => zakatCategoryLabel(c)).join(" ")).toLowerCase().includes(q);
  });
  return (
    <AppLayout fab={<FloatingActionButton onClick={() => setIsSheetOpen(true)} label="Catat Zakat" />}>
      <Header
        title="Zakat" subtitle={`${filteredZakat.length} catatan`}
        onBack={() => navigate(financeBack.backTo)} backLabel={financeBack.backLabel} showSyncButton={false}
        right={
          <HeaderActions>
            {isSuperAdmin && (
              <SyncHeaderButton syncing={syncingSheet} onSync={() => syncSheet(assignedGroup)} />
            )}
            <FilterHeaderButton
              active={hasActiveFilter}
              testId="btn-open-zakat-filter"
              badgeTestId="zakat-filter-badge"
              onClick={() => {
                setDraftStatus(statusFilter);
                setDraftType(typeFilter);
                setDraftYear(yearFilter);
                setFilterSheetOpen(true);
              }}
            />
          </HeaderActions>
        }
      />
      <div className="py-4">
        {!assignedGroup ? (
          <NoGroupEmpty
            module="zakat"
            icon={<Scroll size={26} className="text-accent" />}
            isSuperAdmin={isSuperAdmin}
          />
        ) : loadError && zakatList.length === 0 ? (
          <ErrorState message={loadError} onRetry={loadData} />
        ) : (
          <>
            <section>
              <SectionTitle first>Catatan ({filteredZakat.length})</SectionTitle>
              <div className="px-4 mb-2.5"><Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari muzakki / judul…" /></div>
              {hasActiveFilter && (
                <div className="px-4 mt-2 flex gap-2 flex-wrap" data-testid="zakat-active-filters">
                  <button
                    className="px-2.5 py-1 rounded-full bg-surface-card2 text-surface-muted text-ios-caption font-bold"
                    onClick={() => { setStatusFilter("ALL"); setTypeFilter("ALL"); setYearFilter("all"); }}
                  >
                    Reset filter ×
                  </button>
                </div>
              )}
              {loading ? <GroupedListSkeleton rows={5} />
                : filteredZakat.length === 0 ? <EmptyState title="Belum ada catatan zakat" description="Catat via tombol +." />
                : (
                  <GroupedList>
                    {filteredZakat.map((z, idx) => (
                      <ListRow key={z.zakat_id || idx} onClick={() => navigate(`/finance/zakat/${z.zakat_id}`)} insetDivider={idx !== filteredZakat.length - 1}
                        leading={<span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent font-bold shrink-0">{(z.title || "?").charAt(0).toUpperCase()}</span>}>
                        <ChevronRow>
                          <div className="flex items-center justify-between gap-2 w-full">
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">{z.title || "Tanpa judul"}</p>
                              <p className="text-ios-caption text-surface-muted truncate">{(z.categories || []).map((c) => zakatCategoryLabel(c)).join(" + ") || "Belum ada tipe"}{(z.categories || []).includes("FITRAH") && z.soul_count > 0 ? ` · ${z.soul_count} jiwa` : ""}{z.total_money_rp ? ` · ${formatRp(z.total_money_rp)}` : ""}</p>
                            </div>
                            <StatusPill tone={z.status === "COMPLETED" ? "success" : "warning"}>
                              {z.status === "COMPLETED" ? "Tuntas" : "Proses"}
                            </StatusPill>
                          </div>
                        </ChevronRow>
                      </ListRow>
                    ))}
                  </GroupedList>
                )}
            </section>
          </>
        )}
      </div>
      {/* Filter sheet - pola sama dengan Shodaqoh: Status/Tipe/Tahun + Reset/Terapkan */}
      <BottomSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        title="Filter Zakat"
      >
        <div data-testid="zakat-filter-sheet">
          <p className="text-ios-footnote font-semibold px-1 mb-2">Status</p>
          <div className="flex gap-2 flex-wrap mb-4">
            {(["ALL", "ACTIVE", "COMPLETED"] as const).map((s) => (
              <FilterChip key={s} active={draftStatus === s} label={s === "ALL" ? "Semua" : s === "ACTIVE" ? "Proses" : "Tuntas"} onClick={() => setDraftStatus(s)} />
            ))}
          </div>
          <p className="text-ios-footnote font-semibold px-1 mb-2">Tipe</p>
          <div className="flex gap-2 flex-wrap mb-4">
            {[{ value: "ALL", label: "Semua" }, ...ZAKAT_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))].map((t) => (
              <FilterChip key={t.value} active={draftType === t.value} label={t.label} onClick={() => setDraftType(t.value)} />
            ))}
          </div>
          <p className="text-ios-footnote font-semibold px-1 mb-2">Tahun</p>
          <div className="flex gap-2 flex-wrap mb-4" data-testid="zakat-year-filter">
            {(["all", String(new Date().getFullYear()), String(new Date().getFullYear() - 1), String(new Date().getFullYear() - 2)] as const).map((y) => (
              <FilterChip key={y} active={draftYear === y} label={y === "all" ? "Semua Tahun" : y} onClick={() => setDraftYear(y)} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              variant="secondary"
              onClick={() => { setDraftStatus("ALL"); setDraftType("ALL"); setDraftYear("all"); }}
              data-testid="btn-reset-zakat-filter"
            >
              Reset
            </Button>
            <Button
              onClick={() => {
                setStatusFilter(draftStatus);
                setTypeFilter(draftType);
                setYearFilter(draftYear);
                setFilterSheetOpen(false);
              }}
              data-testid="btn-apply-zakat-filter"
            >
              Terapkan
            </Button>
          </div>
        </div>
      </BottomSheet>
      <BottomSheet open={isSheetOpen} onClose={() => setIsSheetOpen(false)} title="Catat Zakat">
        <form onSubmit={handleSaveZakat} data-testid="zakat-form-overlay">
          <Input label="Judul Zakat" placeholder="Zakat Fitrah 1447 H" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="zakat-form-title-input" required />
          <div className="grid grid-cols-2 gap-x-3">
            <DateInput label="Tanggal" value={form.transaction_date} onChange={(val) => setForm({ ...form, transaction_date: val })} />
            <Input label="Tempat" placeholder="Masjid / Musholla" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <Input label="Keterangan" placeholder="Catatan tambahan…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-3 gap-x-3">
            <Input label="Jiwa" type="number" min={0} value={form.soul_count} onChange={(e) => setForm({ ...form, soul_count: Number(e.target.value) })} />
            <Input label="Beras Kg" type="number" step="0.1" value={form.total_rice_kg || ""} onChange={(e) => setForm({ ...form, total_rice_kg: Number(e.target.value) })} />
            <Input label="Uang Rp" type="number" value={form.total_money_rp || ""} onChange={(e) => setForm({ ...form, total_money_rp: Number(e.target.value) })} />
          </div>
          <SheetFooter
            onCancel={() => setIsSheetOpen(false)}
            submitLabel="Simpan"
            saving={saving}
            cancelTestId="zakat-form-cancel"
            submitTestId="zakat-form-submit"
          />
        </form>
      </BottomSheet>
      <ConfirmDialog open={!!deleteTarget} title="Hapus catatan zakat?" description={`"${deleteTarget?.title}" akan dihapus permanen.`}
        confirmLabel="Ya, hapus" danger loading={deleting} onConfirm={handleConfirmDelete} onCancel={() => setDeleteTarget(null)} />
    </AppLayout>
  );
};
