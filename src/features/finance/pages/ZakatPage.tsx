import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { financeApi, type ZakatItem } from "../api/financeApi";
import { formatRp } from "../../../utils/format";
import { useToast } from "../../../contexts/ToastContext";
import { usePermission } from "../../../hooks/usePermission";
import { AppLayout, Header, FloatingActionButton } from "../../../components/layout/AppLayout";
import {
  Button,
  Input,
  Segmented,
  GroupedList,
  ListRow,
  ChevronRow,
  BottomSheet,
  ConfirmDialog,
  EmptyState,
  ErrorState,
} from "../../../components/common";
import { GroupedListSkeleton } from "../../../components/common/Skeleton";
import {
  ScrollText as Scroll,
  Printer,
} from "../../../components/common/FontAwesomeIcons";
import { ZakatPrintModal } from "../components/ZakatPrintModal";
import { ApiError } from "../../../services/api";

export const ZakatPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { assignedGroup, isSuperAdmin } = usePermission();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [zakatList, setZakatList] = useState<ZakatItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingZakat, setEditingZakat] = useState<ZakatItem | null>(null);
  const [form, setForm] = useState({
    zakat_type: "FITRAH" as "FITRAH" | "MAL",
    muzakki_name: "",
    soul_count: 1,
    total_rice_kg: 0,
    total_money_rp: 0,
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ZakatItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedPrintZakat, setSelectedPrintZakat] = useState<ZakatItem | null>(null);

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
    setLoadError(null);
    try {
      const res = await financeApi.getZakatList(assignedGroup);
      if (res && res.data) {
        setZakatList(res.data);
      }
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : "Gagal memuat data zakat";
      setLoadError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [assignedGroup]);

  const handleOpenAddSheet = () => {
    setEditingZakat(null);
    setForm({
      zakat_type: "FITRAH",
      muzakki_name: "",
      soul_count: 1,
      total_rice_kg: 2.7,
      total_money_rp: 0,
    });
    setIsSheetOpen(true);
  };

  const handleOpenEditSheet = (z: ZakatItem) => {
    setEditingZakat(z);
    setForm({
      zakat_type: z.zakat_type === "MAL" ? "MAL" : "FITRAH",
      muzakki_name: z.muzakki_name,
      soul_count: z.soul_count || 1,
      total_rice_kg: Number(z.total_rice_kg) || 0,
      total_money_rp: Number(z.total_money_rp) || 0,
    });
    setIsSheetOpen(true);
  };

  const handleSaveZakat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.muzakki_name.trim()) {
      showToast("Nama Muzakki wajib diisi", "error");
      return;
    }
    setSaving(true);
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
      setIsSheetOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err instanceof ApiError ? err.message : "Gagal menyimpan zakat", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await financeApi.manageZakat(assignedGroup, "deleteZakat", { zakat_id: deleteTarget.zakat_id });
      showToast("Catatan zakat berhasil dihapus", "success");
      setDeleteTarget(null);
      setDetailZakat(null);
      loadData();
    } catch (err: any) {
      showToast(err instanceof ApiError ? err.message : "Gagal menghapus zakat", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleCompleteZakat = async (zakatId: string) => {
    setCompletingId(zakatId);
    try {
      await financeApi.manageZakat(assignedGroup, "completeZakat", { zakat_id: zakatId });
      showToast("Status zakat berhasil diset Selesai / Tuntas", "success");
      setDetailZakat((prev) => (prev ? { ...prev, status: "COMPLETED" } : prev));
      loadData();
    } catch (err: any) {
      showToast(err instanceof ApiError ? err.message : "Gagal mengupdate status zakat", "error");
    } finally {
      setCompletingId(null);
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
    <AppLayout
      fab={
        <FloatingActionButton
          onClick={handleOpenAddSheet}
          label="Catat Zakat"
        />
      }
    >
      <Header
        title="Zakat"
        subtitle={`${zakatList.length} catatan`}
        onBack={() => navigate("/lainnya")}
        backLabel="Lainnya"
        showSyncButton={false}
      />

      <div className="py-4">
        {!assignedGroup ? (
          <EmptyState
            title="Kelompok belum dipilih"
            description={
              isSuperAdmin
                ? "Pilih kelompok dulu di menu Kelompok Saya untuk membuka zakat kelompok."
                : "Akun Anda belum dipetakan ke kelompok. Hubungi admin."
            }
            icon={<Scroll size={26} className="text-accent" />}
            action={<Button size="sm" onClick={() => navigate("/lainnya")}>Ke Menu Lainnya</Button>}
          />
        ) : loadError && zakatList.length === 0 ? (
          <ErrorState message={loadError} onRetry={loadData} />
        ) : (
          <>
            <section>
              <p className="px-4 mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-surface-muted">
                Ringkasan
              </p>
              <GroupedList>
                <ListRow>
                  <div className="flex items-center justify-between gap-2 w-full">
                    <p className="text-ios-body font-medium text-surface-text">Tanggungan Jiwa</p>
                    <p className="font-display text-ios-nav font-extrabold text-surface-text shrink-0">
                      {totalJiwa} <span className="text-ios-caption font-medium text-surface-muted">Orang</span>
                    </p>
                  </div>
                </ListRow>
                <ListRow>
                  <div className="flex items-center justify-between gap-2 w-full">
                    <p className="text-ios-body font-medium text-surface-text">Zakat Beras</p>
                    <p className="font-display text-ios-nav font-extrabold text-success shrink-0">
                      {totalBeras.toFixed(1)} <span className="text-ios-caption font-medium">Kg</span>
                    </p>
                  </div>
                </ListRow>
                <ListRow insetDivider={false}>
                  <div className="flex items-center justify-between gap-2 w-full">
                    <p className="text-ios-body font-medium text-surface-text">Zakat Uang</p>
                    <p className="font-display text-ios-nav font-extrabold text-info shrink-0">
                      {formatRp(totalUang)}
                    </p>
                  </div>
                </ListRow>
              </GroupedList>
            </section>

            <section>
              <p className="px-4 mb-2.5 mt-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-surface-muted">
                Catatan ({filteredZakat.length})
              </p>
              <div className="px-4 mb-2.5">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama muzakki…"
                />
              </div>
              {loading ? (
                <GroupedListSkeleton rows={5} />
              ) : filteredZakat.length === 0 ? (
                <EmptyState
                  title="Belum ada catatan zakat"
                  description="Catat penerimaan zakat memakai tombol + di bawah."
                />
              ) : (
                <GroupedList>
                  {filteredZakat.map((z, idx) => (
                    <ListRow
                      key={z.zakat_id || idx}
                      onClick={() => {
                        setDetailZakat(z);
                        setDetailTab("rincian");
                      }}
                      insetDivider={idx !== filteredZakat.length - 1}
                      leading={
                        <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0 font-bold text-ios-body">
                          {(z.muzakki_name || "?").charAt(0).toUpperCase()}
                        </span>
                      }
                    >
                      <ChevronRow>
                        <div className="flex items-center justify-between gap-2 w-full">
                          <div className="min-w-0 flex-1">
                            <p className="text-ios-body font-medium text-surface-text truncate">
                              {z.muzakki_name}
                            </p>
                            <p className="text-ios-caption text-surface-muted truncate">
                              {z.zakat_type || "FITRAH"} · {z.soul_count || 1} jiwa
                              {z.total_rice_kg ? ` · ${z.total_rice_kg} Kg` : ""}
                              {z.total_money_rp ? ` · ${formatRp(z.total_money_rp)}` : ""}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                              z.status === "COMPLETED"
                                ? "bg-success-soft text-success"
                                : "bg-warning-soft text-warning"
                            }`}
                          >
                            {z.status === "COMPLETED" ? "Tuntas" : "Proses"}
                          </span>
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

      <BottomSheet
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={editingZakat ? "Edit Zakat" : "Catat Zakat"}
      >
        <form onSubmit={handleSaveZakat}>
          <div className="mb-4">
            <p className="text-ios-footnote font-medium text-surface-muted mb-2 px-1">
              Tipe Zakat
            </p>
            <Segmented<"FITRAH" | "MAL">
              ariaLabel="Tipe zakat"
              value={form.zakat_type}
              onChange={(v) => setForm({ ...form, zakat_type: v })}
              options={[
                { value: "FITRAH", label: "Zakat Fitrah" },
                { value: "MAL", label: "Zakat Mal" },
              ]}
            />
          </div>
          <Input
            label="Nama Muzakki"
            placeholder="Nama pembayar zakat"
            value={form.muzakki_name}
            onChange={(e) => setForm({ ...form, muzakki_name: e.target.value })}
            required
          />
          <Input
            label="Jumlah Tanggungan Jiwa"
            type="number"
            min={1}
            value={form.soul_count}
            onChange={(e) => setForm({ ...form, soul_count: Number(e.target.value) })}
            required
          />
          <div className="grid grid-cols-2 gap-x-3">
            <Input
              label="Beras (Kg)"
              type="number"
              step="0.1"
              value={form.total_rice_kg || ""}
              onChange={(e) => setForm({ ...form, total_rice_kg: Number(e.target.value) })}
            />
            <Input
              label="Uang (Rp)"
              type="number"
              value={form.total_money_rp || ""}
              onChange={(e) => setForm({ ...form, total_money_rp: Number(e.target.value) })}
            />
          </div>
          <Button type="submit" fullWidth disabled={saving}>
            {saving ? "Menyimpan…" : editingZakat ? "Simpan Perubahan" : "Simpan Catatan"}
          </Button>
          {editingZakat && (
            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              {editingZakat.status !== "COMPLETED" && (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={completingId === editingZakat.zakat_id}
                  onClick={() => {
                    handleCompleteZakat(editingZakat.zakat_id);
                    setIsSheetOpen(false);
                  }}
                >
                  {completingId ? "Memproses…" : "Set Tuntas"}
                </Button>
              )}
              <Button
                type="button"
                variant="softDanger"
                onClick={() => {
                  setDeleteTarget(editingZakat);
                  setIsSheetOpen(false);
                }}
              >
                Hapus
              </Button>
            </div>
          )}
        </form>
      </BottomSheet>

      <BottomSheet
        open={!!detailZakat}
        onClose={() => setDetailZakat(null)}
        title={detailZakat?.muzakki_name || "Detail Zakat"}
      >
        {detailZakat && (
          <>
            <div className="flex items-center justify-between gap-2 mb-4 px-1">
              <p className="text-ios-footnote text-surface-muted">
                {detailZakat.zakat_type === "MAL" ? "Zakat Mal" : "Zakat Fitrah"} · {detailZakat.soul_count} jiwa
                {detailZakat.transaction_date ? ` · ${detailZakat.transaction_date}` : ""}
              </p>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                  detailZakat.status === "COMPLETED"
                    ? "bg-success-soft text-success"
                    : "bg-warning-soft text-warning"
                }`}
              >
                {detailZakat.status === "COMPLETED" ? "Tuntas" : "Proses"}
              </span>
            </div>

            <div className="mb-4">
              <Segmented<"muzaki" | "rincian" | "mustahik">
                ariaLabel="Tab detail zakat"
                value={detailTab}
                onChange={setDetailTab}
                size="sm"
                options={[
                  { value: "muzaki", label: "Muzaki" },
                  { value: "rincian", label: "Rincian" },
                  { value: "mustahik", label: "Mustahik" },
                ]}
              />
            </div>

            {detailTab === "rincian" && (() => {
              const r = rincian(detailZakat);
              const rows: Array<[string, string, number, boolean]> = [
                ["Total Dana", "", r.total, false],
                ["Mustahik", "45%", r.mustahik, false],
                ["Kelompok", "80% dari mustahik", r.mustahikKelompok, true],
                ["Daerah", "20% dari mustahik", r.mustahikDaerah, true],
                ["Sabilillah", "40%", r.sabilillah, false],
                ["Amil", "15%", r.amil, false],
                ["Amil Kelompok", "12%", r.amilKelompok, true],
                ["Amil Desa", "2%", r.amilDesa, true],
                ["Amil Daerah", "1%", r.amilDaerah, true],
              ];
              return (
                <GroupedList flush>
                  {rows.map(([label, pct, val, indent], i) => (
                    <ListRow key={label} insetDivider={i !== rows.length - 1}>
                      <div className={`flex items-center justify-between gap-2 w-full ${indent ? "pl-4" : ""}`}>
                        <p className="text-ios-body text-surface-text min-w-0">
                          {label}{" "}
                          {pct && <span className="text-ios-caption text-surface-muted font-medium">{pct}</span>}
                        </p>
                        <p className="font-mono text-ios-subhead font-bold text-surface-text shrink-0">
                          {formatRp(val)}
                        </p>
                      </div>
                    </ListRow>
                  ))}
                </GroupedList>
              );
            })()}

            {detailTab === "muzaki" && (
              (detailZakat.muzakki_list || []).length === 0 ? (
                <EmptyState title="Belum ada rincian muzakki" />
              ) : (
                <GroupedList flush>
                  {(detailZakat.muzakki_list || []).map((m: any, i: number) => (
                    <ListRow key={i} insetDivider={i !== (detailZakat.muzakki_list || []).length - 1}>
                      <div className="flex items-center justify-between gap-2 w-full">
                        <p className="text-ios-body font-medium text-surface-text truncate">
                          {m.nama || m.name || `Muzaki ${i + 1}`}
                        </p>
                        <p className="font-mono text-ios-subhead shrink-0">
                          {m.amount ? formatRp(m.amount) : ""}
                        </p>
                      </div>
                    </ListRow>
                  ))}
                </GroupedList>
              )
            )}

            {detailTab === "mustahik" && (
              (detailZakat.mustahik_list || []).length === 0 ? (
                <EmptyState title="Belum ada penyaluran mustahik" />
              ) : (
                <GroupedList flush>
                  {(detailZakat.mustahik_list || []).map((m: any, i: number) => (
                    <ListRow key={i} insetDivider={i !== (detailZakat.mustahik_list || []).length - 1}>
                      <div className="flex items-center justify-between gap-2 w-full">
                        <p className="text-ios-body font-medium text-surface-text truncate">
                          {m.nama || m.name || `Mustahik ${i + 1}`}
                        </p>
                        <p className="font-mono text-ios-subhead shrink-0">
                          {m.amount ? formatRp(m.amount) : ""}
                        </p>
                      </div>
                    </ListRow>
                  ))}
                </GroupedList>
              )
            )}

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <Button
                variant="secondary"
                onClick={() => {
                  if (!detailZakat) return;
                  setSelectedPrintZakat(detailZakat);
                  setDetailZakat(null);
                  setIsPrintModalOpen(true);
                }}
                leftIcon={<Printer size={14} />}
              >
                Kwitansi
              </Button>
              {detailZakat.status !== "COMPLETED" ? (
                <Button
                  disabled={completingId === detailZakat.zakat_id}
                  onClick={() => {
                    handleCompleteZakat(detailZakat.zakat_id);
                    setDetailZakat(null);
                  }}
                >
                  {completingId ? "Memproses…" : "Set Tuntas"}
                </Button>
              ) : (
                <Button
                  variant="softDanger"
                  onClick={() => {
                    setDeleteTarget(detailZakat);
                    setDetailZakat(null);
                  }}
                >
                  Hapus
                </Button>
              )}
            </div>
          </>
        )}
      </BottomSheet>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus catatan zakat?"
        description={`“${deleteTarget?.muzakki_name}” akan dihapus permanen.`}
        confirmLabel="Ya, hapus"
        danger
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ZakatPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        zakat={selectedPrintZakat}
        mode="kwitansi"
      />
    </AppLayout>
  );
};
