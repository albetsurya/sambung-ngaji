import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { financeApi, type ZakatItem } from "../api/financeApi";
import { formatRp } from "../../../utils/format";
import { useToast } from "../../../contexts/ToastContext";
import { usePermission } from "../../../hooks/usePermission";
import { AppLayout, Header, FloatingActionButton } from "../../../components/layout/AppLayout";
import {
  Button,
  Input,
  DateInput,
  Segmented,
  FilterChip,
  GroupedList,
  ListRow,
  BottomSheet,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Card,
} from "../../../components/ui";
import {
  ZAKAT_CATEGORIES,
  normZakatCategory,
  zakatCategoryLabel,
} from "../api/financeApi";
import { GroupedListSkeleton } from "../../../components/ui/Skeleton";
import { Pencil, MoreVertical } from "../../../components/ui/FontAwesomeIcons";
import {
  SectionTitle,
  StatusPill,
  HeaderActions,
  HeaderIconButton,
} from "../components/FinanceShared";
import { ApiError } from "../../../services/api";
type Tab = "muzaki" | "rincian" | "mustahik";
/**
 * Hitung tampilan rincian ala kas-latukan-web (mustahik 45 / sabilillah 40 / amil 15).
 * Tahan terhadap 2 kondisi kosong yang bikin tab Rincian tampak tidak tampil:
 * 1. Alokasi belum pernah disimpan -> tampilkan pratinjau default (isPreview).
 * 2. Nominal tersimpan 0 (header total 0 / hanya pengisi muzaki) -> hitung ulang
 *    dari persen × total efektif (total header atau jumlah nominal muzaki).
 */
function calcRincian(z: ZakatItem | null, category: string) {
  const payers = z?.payer_list || (z?.muzakki_list as any[]) || [];
  const catPayers = payers.filter((p: any) => normZakatCategory(p.zakat_category) === category);
  const catSum = catPayers.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);
  const payerSum = payers.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);
  const total = catSum || Number(z?.total_money_rp) || payerSum;
  const alloc = z?.allocations?.by_category?.[category]
    ?? (category === "FITRAH" ? z?.allocations?.fitrah : z?.allocations?.maal);
  const hasAlloc = Boolean(alloc) && ((alloc?.recipient?.percent || 0) + (alloc?.sabilillah?.percent || 0) + (alloc?.amil?.percent || 0) > 0);
  const pct = (v: number | undefined, d: number) => (typeof v === "number" && v > 0 ? v : d);
  const amt = (v: number | undefined, p: number) => (typeof v === "number" && v > 0 ? v : Math.round((total * p) / 100));
  if (!hasAlloc) {
    const pM = 45, pS = 40, pA = 15;
    const mustahik = Math.round((total * pM) / 100);
    const sabilillah = Math.round((total * pS) / 100);
    const amil = total - mustahik - sabilillah;
    return {
      total, mustahik, sabilillah, amil,
      pMustahik: pM, pSabilillah: pS, pAmil: pA,
      mustahikKelompok: Math.round((mustahik * 80) / 100), mustahikDaerah: mustahik - Math.round((mustahik * 80) / 100),
      amilKelompok: Math.round((total * 12) / 100), amilDesa: Math.round((total * 2) / 100),
      amilDaerah: Math.max(0, amil - Math.round((total * 12) / 100) - Math.round((total * 2) / 100)),
      isPreview: true,
    };
  }
  const pM = pct(alloc?.recipient?.percent, 45);
  const pS = pct(alloc?.sabilillah?.percent, 40);
  const pA = pct(alloc?.amil?.percent, 15);
  const mustahik = amt(alloc?.recipient?.amount, pM);
  const sabilillah = amt(alloc?.sabilillah?.amount, pS);
  const amil = amt(alloc?.amil?.amount, pA);
  const mKel = alloc?.recipient?.group?.amount || Math.round((mustahik * 80) / 100);
  const mDae = alloc?.recipient?.region?.amount || (mustahik - mKel);
  const aKel = alloc?.amil?.group?.amount || Math.round((total * 12) / 100);
  const aDes = alloc?.amil?.village?.amount || Math.round((total * 2) / 100);
  const aDae = alloc?.amil?.region?.amount || Math.max(0, amil - aKel - aDes);
  return {
    total, mustahik, sabilillah, amil,
    pMustahik: pM, pSabilillah: pS, pAmil: pA,
    mustahikKelompok: mKel, mustahikDaerah: mDae,
    amilKelompok: aKel, amilDesa: aDes, amilDaerah: aDae,
    isPreview: false,
  };
}
export const ZakatDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { assignedGroup } = usePermission();
  const [data, setData] = useState<ZakatItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("rincian");
  const [headerOpen, setHeaderOpen] = useState(false);
  const [headerForm, setHeaderForm] = useState({ title: "", location: "", transaction_date: "", description: "" });
  const [savingHeader, setSavingHeader] = useState(false);
  const [muzakiOpen, setMuzakiOpen] = useState(false);
  const [editingPayer, setEditingPayer] = useState<any | null>(null);
  const [payerForm, setPayerForm] = useState({
    name: "", amount: 0, family_members_count: 1,
    zakat_category: "FITRAH" as "FITRAH" | "MAL" | "TIJAROH" | "ZURU" | "LIVESTOCK" | "OTHER",
  });
  const [savingPayer, setSavingPayer] = useState(false);
  const [mustahikOpen, setMustahikOpen] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<any | null>(null);
  const [recipientForm, setRecipientForm] = useState({ name: "", amount: 0 });
  const [savingRecipient, setSavingRecipient] = useState(false);
  const [rincianOpen, setRincianOpen] = useState(false);
  const [rincianCategory, setRincianCategory] = useState<string>("FITRAH");
  const [rincianForm, setRincianForm] = useState({ pMustahik: 45, pSabilillah: 40, pAmil: 15 });
  const [savingRincian, setSavingRincian] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ kind: string; id?: string; label: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const load = async () => {
    if (!assignedGroup || !id) { setLoading(false); return; }
    setLoading(true); setLoadError(null);
    try {
      const d = await financeApi.getZakatDetail(assignedGroup, id);
      setData(d);
    } catch (err: any) {
      setLoadError(err instanceof ApiError ? err.message : "Gagal memuat detail zakat");
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [assignedGroup, id]);
  const openHeader = () => {
    if (!data) return;
    setHeaderForm({
      title: data.title || "",
      location: data.location || "", transaction_date: data.transaction_date || "",
      description: data.description || "",
    });
    setHeaderOpen(true);
  };
  const saveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSavingHeader(true);
    try {
      await financeApi.manageZakat(assignedGroup, "updateZakat", { zakat_id: data.zakat_id, ...headerForm });
      showToast("Data zakat diperbarui", "success");
      setHeaderOpen(false); load();
    } catch (err: any) {
      showToast(err instanceof ApiError ? err.message : "Gagal menyimpan", "error");
    } finally { setSavingHeader(false); }
  };
  const openPayer = (p?: any) => {
    const cat = (p?.zakat_category ? normZakatCategory(p.zakat_category) : "FITRAH") as "FITRAH" | "MAL" | "TIJAROH" | "ZURU" | "LIVESTOCK" | "OTHER";
    setEditingPayer(p || null);
    setPayerForm(p
      ? { name: p.name || "", amount: Number(p.amount) || 0, family_members_count: Number(p.family_members_count) || 1, zakat_category: cat }
      : { name: "", amount: 0, family_members_count: 1, zakat_category: cat });
    setMuzakiOpen(true);
  };
  const savePayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !payerForm.name.trim()) { showToast("Nama muzakki wajib diisi", "error"); return; }
    const payload = {
      ...payerForm,
      family_members_count: payerForm.zakat_category === "FITRAH" ? (Number(payerForm.family_members_count) || 1) : 0,
    };
    setSavingPayer(true);
    try {
      const cur = [...(data.payer_list || [])];
      if (editingPayer?.payer_id) {
        const i = cur.findIndex((x: any) => x.payer_id === editingPayer.payer_id);
        if (i >= 0) cur[i] = { ...cur[i], ...payload };
      } else {
        cur.push({ payer_id: `tmp-${Date.now()}`, ...payload });
      }
      await financeApi.saveZakatPayers(assignedGroup, data.zakat_id, cur);
      showToast("Muzaki disimpan", "success");
      setMuzakiOpen(false); load();
    } catch (err: any) {
      showToast(err instanceof ApiError ? err.message : "Gagal menyimpan muzakki", "error");
    } finally { setSavingPayer(false); }
  };
  const openRecipient = (r?: any) => {
    setEditingRecipient(r || null);
    setRecipientForm(r ? { name: r.name || "", amount: Number(r.amount) || 0 } : { name: "", amount: 0 });
    setMustahikOpen(true);
  };
  const saveRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !recipientForm.name.trim()) { showToast("Nama mustahik wajib diisi", "error"); return; }
    setSavingRecipient(true);
    try {
      const cur = [...(data.recipient_list || [])];
      if (editingRecipient?.recipient_id) {
        const i = cur.findIndex((x: any) => x.recipient_id === editingRecipient.recipient_id);
        if (i >= 0) cur[i] = { ...cur[i], ...recipientForm };
      } else {
        cur.push({ recipient_id: `tmp-${Date.now()}`, ...recipientForm, zakat_category: rincianCategory || "FITRAH" });
      }
      await financeApi.saveZakatRecipients(assignedGroup, data.zakat_id, cur);
      showToast("Mustahik disimpan", "success");
      setMustahikOpen(false); load();
    } catch (err: any) {
      showToast(err instanceof ApiError ? err.message : "Gagal menyimpan mustahik", "error");
    } finally { setSavingRecipient(false); }
  };
  const openRincian = (cat?: string) => {
    if (cat) setRincianCategory(cat);
    const r = calcRincian(data, rincianCategory);
    setRincianForm({
      pMustahik: r.pMustahik || 45, pSabilillah: r.pSabilillah || 40, pAmil: r.pAmil || 15,
    });
    setRincianOpen(true);
  };
const saveRincian = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    const { pMustahik, pSabilillah, pAmil } = rincianForm;
    if (pMustahik + pSabilillah + pAmil !== 100) { showToast("Total persen harus 100%", "error"); return; }
    const payers = data.payer_list || [];
    const catPayers = payers.filter((p: any) => normZakatCategory(p.zakat_category) === rincianCategory);
    const catSum = catPayers.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);
    const payerSum = payers.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);
    const total = catSum || Number(data.total_money_rp) || payerSum;
    const mustahik = Math.round((total * pMustahik) / 100);
    const sabilillah = Math.round((total * pSabilillah) / 100);
    const amil = total - mustahik - sabilillah;
    const mKel = Math.round((mustahik * 80) / 100);
    const aKel = Math.round((total * 12) / 100);
    const aDes = Math.round((total * 2) / 100);
    setSavingRincian(true);
    try {
      await financeApi.saveZakatAllocations(assignedGroup, data.zakat_id, [{
        category: rincianCategory,
        recipient_percent: pMustahik, recipient_amount: mustahik,
        recipient_group_percent: 80, recipient_group_amount: mKel,
        recipient_region_percent: 20, recipient_region_amount: mustahik - mKel,
        sabilillah_percent: pSabilillah, sabilillah_amount: sabilillah,
        amil_percent: pAmil, amil_amount: amil,
        amil_group_percent: 12, amil_group_amount: aKel,
        amil_village_percent: 2, amil_village_amount: aDes,
        amil_region_percent: Math.max(0, pAmil - 14), amil_region_amount: Math.max(0, amil - aKel - aDes),
      }]);
      showToast("Rincian disimpan", "success");
      setRincianOpen(false); load();
    } catch (err: any) {
      showToast(err instanceof ApiError ? err.message : "Gagal menyimpan rincian", "error");
    } finally { setSavingRincian(false); }
  };
  const confirmDelete = async () => {
    if (!data || !deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.kind === "record") {
        await financeApi.manageZakat(assignedGroup, "deleteZakat", { zakat_id: data.zakat_id });
        showToast("Catatan zakat dihapus", "success");
        navigate("/finance/zakat");
        return;
      }
      if (deleteTarget.kind === "payer") {
        const cur = (data.payer_list || []).filter((x: any) => x.payer_id !== deleteTarget.id);
        await financeApi.saveZakatPayers(assignedGroup, data.zakat_id, cur);
      }
      if (deleteTarget.kind === "recipient") {
        const cur = (data.recipient_list || []).filter((x: any) => x.recipient_id !== deleteTarget.id);
        await financeApi.saveZakatRecipients(assignedGroup, data.zakat_id, cur);
      }
      showToast("Data dihapus", "success");
      setDeleteTarget(null); load();
    } catch (err: any) {
      showToast(err instanceof ApiError ? err.message : "Gagal menghapus", "error");
    } finally { setDeleting(false); }
  };
  const toggleComplete = async () => {
    if (!data) return;
    setCompleting(true);
    try {
      const action = data.status === "COMPLETED" ? "cancelCompleteZakat" : "completeZakat";
      await financeApi.manageZakat(assignedGroup, action, { zakat_id: data.zakat_id });
      showToast(data.status === "COMPLETED" ? "Dikembalikan ke Proses" : "Zakat dituntaskan", "success");
      load();
    } catch (err: any) {
      showToast(err instanceof ApiError ? err.message : "Gagal mengubah status", "error");
    } finally { setCompleting(false); }
  };
  const r = calcRincian(data, rincianCategory);
  const payers = data?.payer_list || (data?.muzakki_list as any[]) || [];
  const recipients = data?.recipient_list || (data?.mustahik_list as any[]) || [];
  const isDone = data?.status === "COMPLETED";
  const payerCategoryOf = (p: any): string =>
    p?.zakat_category ? normZakatCategory(p.zakat_category) : "FITRAH";
  const categoryGroups = (() => {
    const groups = new Map<string, any[]>();
    for (const p of payers) {
      const cat = p?.zakat_category ? normZakatCategory(p.zakat_category) : "FITRAH";
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(p);
    }
    return groups;
  })();
  const categoriesPresent = Array.from(categoryGroups.keys()).sort((a, b) => {
    if (a === "FITRAH") return -1;
    if (b === "FITRAH") return 1;
    return a.localeCompare(b);
  });
  return (
    <AppLayout
      fab={
        tab === "muzaki"
          ? <FloatingActionButton onClick={() => openPayer()} label="Tambah Muzaki" />
          : tab === "mustahik"
            ? <FloatingActionButton onClick={() => openRecipient()} label="Tambah Mustahik" />
            : undefined
      }
    >
      <Header
        title={data?.title || "Detail Zakat"}
        subtitle={data ? `${(data.categories || []).map((c: string) => zakatCategoryLabel(c)).join(" + ") || "Belum ada tipe"} · ${data.status === "COMPLETED" ? "Tuntas" : "Proses"}` : "Memuat…"}
        onBack={() => navigate("/finance/zakat")}
        backLabel="Zakat"
        showSyncButton={false}
        right={
          <HeaderActions>
            <HeaderIconButton onClick={openHeader} label="Edit data zakat" testId="btn-edit-zakat-header">
              <Pencil size={15} />
            </HeaderIconButton>
            <span className="relative">
              <HeaderIconButton onClick={() => setMoreOpen((v) => !v)} label="Aksi lainnya" testId="btn-more-actions">
                <MoreVertical size={15} />
              </HeaderIconButton>
              {moreOpen && data && (
                <div className="absolute right-0 top-9 z-50 w-52 rounded-2xl border border-surface-border bg-surface-card shadow-lg p-1.5" data-testid="zakat-actions-dropdown">
                  <button
                    className="w-full text-left px-3 py-2.5 rounded-xl text-ios-body active:bg-surface-card2"
                    onClick={() => { setMoreOpen(false); if (isDone) setConfirmCancelOpen(true); else setConfirmCompleteOpen(true); }}
                    data-testid="btn-toggle-complete-zakat"
                  >
                    {isDone ? "Batalkan Selesai" : "Tandai Selesai"}
                  </button>
                  <button
                    className="w-full text-left px-3 py-2.5 rounded-xl text-ios-body active:bg-surface-card2"
                    onClick={() => {
                      setMoreOpen(false);
                      navigate(`/finance/zakat/${id}/print?mode=kwitansi`);
                    }}
                    data-testid="btn-print-zakat"
                  >
                    Cetak Laporan
                  </button>
                  <button
                    className="w-full text-left px-3 py-2.5 rounded-xl text-ios-body text-danger active:bg-danger-soft"
                    onClick={() => { setMoreOpen(false); setDeleteTarget({ kind: "record", label: data.title || data.categories?.join(" + ") || "" }); }}
                    data-testid="btn-delete-zakat"
                  >
                    Hapus Zakat
                  </button>
                </div>
              )}
            </span>
          </HeaderActions>
        }
      />
      <div className="py-4">
        {loading ? <GroupedListSkeleton rows={5} />
          : loadError || !data ? <ErrorState message={loadError || "Data tidak ditemukan"} onRetry={load} />
          : (
            <>
              {/* Kartu header detail spek: status + metadata + keterangan */}
              <div className="px-4">
                <Card data-testid="zakat-detail-header">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-ios-caption text-surface-muted" data-testId="zakat-detail-meta">
                      {[data.transaction_date, data.location, (data.categories || []).map((c: string) => zakatCategoryLabel(c)).join(" + ") || "Belum ada tipe"].filter(Boolean).join(" · ")}
                    </p>
                    <StatusPill
                      tone={isDone ? "success" : "warning"}
                      testId="zakat-detail-status"
                    >
                      {isDone ? "Selesai" : "Aktif"}
                    </StatusPill>
                  </div>
                  {data.description && (
                    <p className="text-ios-footnote text-surface-muted mt-1.5" data-testid="zakat-detail-keterangan">{data.description}</p>
                  )}
                </Card>
                {/* Banner total spek #zakatDetailTotal */}
                <Card className="mt-2.5 !bg-accent-soft !border-accent/20">
                  <p className="text-ios-caption font-semibold uppercase tracking-wider text-surface-muted">Total Zakat Terkumpul</p>
                  <p className="font-display text-ios-nav font-extrabold text-accent" data-testid="zakat-detail-total">
                    {formatRp(Number(data.total_money_rp) || 0)}
                    {Number(data.total_rice_kg) > 0 ? ` + ${Number(data.total_rice_kg)} Kg` : ""}
                  </p>
                </Card>
              </div>
              <div className="px-4 mt-3">
                <Segmented<Tab>
                  ariaLabel="Tab detail zakat"
                  value={tab}
                  onChange={setTab}
                  size="sm"
                  options={[
                    { value: "muzaki", label: `Muzaki (${payers.length})` },
                    { value: "rincian", label: "Rincian" },
                    { value: "mustahik", label: `Mustahik (${recipients.length})` },
                  ]}
                />
              </div>
              {tab === "rincian" && (
                <section>
                  <SectionTitle>Kategori Rincian</SectionTitle>
                  <div className="px-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {data?.categories?.map((c: string) => (
                      <FilterChip
                        key={c}
                        active={rincianCategory === c}
                        label={zakatCategoryLabel(c)}
                        onClick={() => openRincian(c)}
                      />
                    ))}
                    {(!data?.categories?.length || data.categories.length === 0) && (
                      <FilterChip
                        active={rincianCategory === "FITRAH"}
                        label="Fitrah"
                        onClick={() => openRincian("FITRAH")}
                      />
                    )}
                  </div>
                  <Card className="mx-4 mt-3">
                    <div className="flex h-8 rounded-xl overflow-hidden bg-surface-card2 border border-surface-border">
                      <div className="bg-accent text-[10px] font-bold text-white flex items-center justify-center" style={{ width: `${r.pMustahik}%` }}>{r.pMustahik > 12 ? `${r.pMustahik}%` : ""}</div>
                      <div className="bg-warning text-[10px] font-bold text-white flex items-center justify-center" style={{ width: `${r.pSabilillah}%` }}>{r.pSabilillah > 12 ? `${r.pSabilillah}%` : ""}</div>
                      <div className="bg-success text-[10px] font-bold text-white flex items-center justify-center" style={{ width: `${r.pAmil}%` }}>{r.pAmil > 12 ? `${r.pAmil}%` : ""}</div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-ios-caption">
                      <span className="text-surface-muted">
                        {zakatCategoryLabel(rincianCategory)} · Mustahik {r.pMustahik}% · Sabilillah {r.pSabilillah}% · Amil {r.pAmil}%
                      </span>
                      <button onClick={() => openRincian()} className="font-bold text-accent">Ubah</button>
                    </div>
                    {r.isPreview && (
                      <p className="mt-1.5 text-ios-caption text-warning font-medium">
                        Pratinjau default 45/40/15 — ketuk Ubah lalu Simpan untuk mengunci rincian.
                      </p>
                    )}
                  </Card>
                  <GroupedList>
                    {[
                      ["Total Dana", "", r.total, false],
                      ["Mustahik", `${r.pMustahik}%`, r.mustahik, false],
                      ["Kelompok", "80% dari mustahik", r.mustahikKelompok, true],
                      ["Daerah", "20% dari mustahik", r.mustahikDaerah, true],
                      ["Sabilillah", `${r.pSabilillah}%`, r.sabilillah, false],
                      ["Amil", `${r.pAmil}%`, r.amil, false],
                      ["Amil Kelompok", "12%", r.amilKelompok, true],
                      ["Amil Desa", "2%", r.amilDesa, true],
                      ["Amil Daerah", "sisa", r.amilDaerah, true],
                    ].map(([label, pct, val, indent], i, a) => (
                      <ListRow key={label as string} insetDivider={i !== a.length - 1}>
                        <div className={`flex items-center justify-between gap-2 w-full ${indent ? "pl-4" : ""}`}>
                          <p className="text-ios-body text-surface-text min-w-0">
                            {label}{" "}
                            {pct ? <span className="text-ios-caption text-surface-muted font-medium">{pct}</span> : null}
                          </p>
                          <p className=" text-ios-subhead font-bold text-surface-text shrink-0">
                            {formatRp(val as number)}
                          </p>
                        </div>
                      </ListRow>
                    ))}
                  </GroupedList>
                </section>
              )}
              {tab === "muzaki" && (
                <section>
                  <SectionTitle testId="zakat-muzaki-count-display">
                    Daftar Muzaki ({payers.length} orang · {categoriesPresent.includes("FITRAH") ? categoryGroups.get("FITRAH")?.reduce((s: number, x: any) => s + (Number(x.family_members_count) || 0), 0) : 0} jiwa fitrah)
                  </SectionTitle>
                  {payers.length === 0 ? <EmptyState title="Belum ada muzakki" description="Tambah via tombol +." /> : (
                    <>
                      {categoriesPresent.map((cat) => {
                        const list = categoryGroups.get(cat) || [];
                        const showJiwa = cat === "FITRAH";
                        const label = zakatCategoryLabel(cat);
                        return (
                          <div key={cat}>
                            <p className="px-4 mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-surface-muted">
                              {label} ({list.length})
                            </p>
                            {list.length === 0 ? (
                              <p className="px-4 text-ios-caption text-surface-muted">Belum ada muzakki {label.toLowerCase()}.</p>
                            ) : (
                              <GroupedList>
                                {list.map((m: any, i: number) => (
                                  <ListRow key={m.payer_id || i} onClick={() => openPayer(m)} insetDivider={i !== list.length - 1}>
                                    <div className="flex items-center justify-between w-full gap-2">
                                      <div className="min-w-0"><p className="truncate font-medium">{m.name || m.nama}</p>
                                        {showJiwa && Number(m.family_members_count) > 0 ? (
                                          <p className="text-ios-caption text-surface-muted">{m.family_members_count} jiwa</p>
                                        ) : null}</div>
                                      <p className=" font-bold shrink-0">{m.amount ? formatRp(m.amount) : ""}</p>
                                    </div>
                                  </ListRow>
                                ))}
                              </GroupedList>
                            )}
                          </div>
                        );
                      })}
                      <div className="px-4 mt-2">
                        <Card className="flex items-center justify-between !py-2.5" data-testid="zakat-muzaki-table-total">
                          <span className="text-ios-footnote font-semibold">Total ({payers.length})</span>
                          <span className="font-extrabold">{formatRp(payers.reduce((s: number, x: any) => s + (Number(x.amount) || 0), 0))}</span>
                        </Card>
                      </div>
                    </>
                  )}
                </section>
              )}
              {tab === "mustahik" && (
                <section>
                  <SectionTitle testId="zakat-mustahik-count-display">
                    Penyaluran Mustahik ({recipients.length} penerima)
                  </SectionTitle>
                  {(() => {
                    const dana = r.mustahik || 0;
                    const tersalurkan = recipients.reduce((s: number, x: any) => s + (Number(x.amount) || 0), 0);
                    const sisa = Math.max(0, dana - tersalurkan);
                    const pct = dana > 0 ? Math.min(100, Math.round((tersalurkan / dana) * 100)) : 0;
                    const status = dana <= 0 ? "Belum ada alokasi" : sisa <= 0 ? "Tuntas tersalurkan" : `Sisa ${formatRp(sisa)}`;
                    return (
                      <>
                        <div className="mx-4 grid grid-cols-3 gap-2" data-testid="zakat-mustahik-info-bar">
                          <Card className="!p-2.5"><p className="text-ios-caption text-surface-muted">Dana</p><p className="font-extrabold text-ios-subhead" data-testid="zakat-mustahik-dana-view">{formatRp(dana)}</p></Card>
                          <Card className="!p-2.5"><p className="text-ios-caption text-surface-muted">Tersalurkan</p><p className="font-extrabold text-ios-subhead text-success" data-testid="zakat-mustahik-tersalurkan">{formatRp(tersalurkan)}</p></Card>
                          <Card className="!p-2.5"><p className="text-ios-caption text-surface-muted">Sisa</p><p className="font-extrabold text-ios-subhead" data-testid="zakat-mustahik-sisa-view">{formatRp(sisa)}</p></Card>
                        </div>
                        <div className="mx-4 mt-2">
                          <div className="h-2 rounded-full bg-surface-card2 overflow-hidden" data-testid="zakat-mustahik-progress-view">
                            <div className="h-full bg-success rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="mt-1 flex items-center justify-between text-ios-caption">
                            <span className="text-surface-muted" data-testid="zakat-mustahik-progress-label">{pct}% tersalurkan</span>
                            <span className="font-bold" data-testid="zakat-mustahik-status-view">{status}</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                  {recipients.length === 0 ? <EmptyState title="Belum ada mustahik" description="Tambah via tombol +." /> : (
                    <>
                      <GroupedList>
                        {recipients.map((m: any, i: number) => (
                          <ListRow key={m.recipient_id || i} onClick={() => openRecipient(m)} insetDivider={i !== recipients.length - 1}>
                            <div className="flex items-center justify-between w-full gap-2">
                              <p className="truncate font-medium">{m.name || m.nama}</p>
                              <p className=" font-bold shrink-0">{m.amount ? formatRp(m.amount) : ""}</p>
                            </div>
                          </ListRow>
                        ))}
                      </GroupedList>
                      <div className="px-4 mt-2">
                        <Card className="flex items-center justify-between !py-2.5" data-testid="zakat-mustahik-table-total">
                          <span className="text-ios-footnote font-semibold">Total ({recipients.length})</span>
                          <span className="font-extrabold">{formatRp(recipients.reduce((s: number, x: any) => s + (Number(x.amount) || 0), 0))}</span>
                        </Card>
                      </div>
                    </>
                  )}
                </section>
              )}
              <div className="px-4 mt-4 grid grid-cols-2 gap-2.5">
                <Button variant="secondary" onClick={() => (isDone ? setConfirmCancelOpen(true) : setConfirmCompleteOpen(true))} loading={completing} data-testid="btn-toggle-complete-zakat-bottom">
                  {isDone ? "Batal Tuntas" : "Set Tuntas"}
                </Button>
                <Button variant="softDanger" onClick={() => setDeleteTarget({ kind: "record", label: data.title || data.categories?.join(" + ") || "" })}>
                  Hapus
                </Button>
              </div>
            </>
          )}
      </div>
      <BottomSheet open={headerOpen} onClose={() => setHeaderOpen(false)} title="Edit Data Zakat">
        <form onSubmit={saveHeader}>
          <Input label="Judul" value={headerForm.title} onChange={(e) => setHeaderForm({ ...headerForm, title: e.target.value })} placeholder="Zakat Fitrah 1447 H" required />
          <Input label="Lokasi" value={headerForm.location} onChange={(e) => setHeaderForm({ ...headerForm, location: e.target.value })} />
          <DateInput label="Tanggal" value={headerForm.transaction_date} onChange={(val) => setHeaderForm({ ...headerForm, transaction_date: val })} />
          <Input label="Keterangan" value={headerForm.description} onChange={(e) => setHeaderForm({ ...headerForm, description: e.target.value })} />
          <Button type="submit" fullWidth loading={savingHeader}>Simpan</Button>
        </form>
      </BottomSheet>
      <BottomSheet open={muzakiOpen} onClose={() => setMuzakiOpen(false)} title={editingPayer ? "Edit Muzaki" : "Tambah Muzaki"}>
        <form onSubmit={savePayer}>
<div className="mb-4">
            <Segmented
              ariaLabel="Tipe zakat muzakki"
              value={payerForm.zakat_category}
              onChange={(v) => setPayerForm({ ...payerForm, zakat_category: v })}
              options={ZAKAT_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
            />
          </div>
          <Input label="Nama" value={payerForm.name} onChange={(e) => setPayerForm({ ...payerForm, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-x-3">
            <Input label="Nominal (Rp)" type="number" value={payerForm.amount || ""} onChange={(e) => setPayerForm({ ...payerForm, amount: Number(e.target.value) })} />
            {payerForm.zakat_category === "FITRAH" && (
              <Input label="Jiwa / Jamaah" type="number" min={1} value={payerForm.family_members_count} onChange={(e) => setPayerForm({ ...payerForm, family_members_count: Number(e.target.value) })} />
            )}
          </div>
          <Button type="submit" fullWidth disabled={savingPayer}>{savingPayer ? "Menyimpan…" : "Simpan"}</Button>
          {editingPayer?.payer_id && (
            <Button type="button" variant="softDanger" fullWidth className="mt-2.5" onClick={() => { setMuzakiOpen(false); setDeleteTarget({ kind: "payer", id: editingPayer.payer_id, label: editingPayer.name }); }}>Hapus</Button>
          )}
        </form>
      </BottomSheet>
      <BottomSheet open={mustahikOpen} onClose={() => setMustahikOpen(false)} title={editingRecipient ? "Edit Mustahik" : "Tambah Mustahik"}>
        <form onSubmit={saveRecipient}>
          <Input label="Nama" value={recipientForm.name} onChange={(e) => setRecipientForm({ ...recipientForm, name: e.target.value })} required />
          <Input label="Nominal (Rp)" type="number" value={recipientForm.amount || ""} onChange={(e) => setRecipientForm({ ...recipientForm, amount: Number(e.target.value) })} />
          <Button type="submit" fullWidth disabled={savingRecipient}>{savingRecipient ? "Menyimpan…" : "Simpan"}</Button>
          {editingRecipient?.recipient_id && (
            <Button type="button" variant="softDanger" fullWidth className="mt-2.5" onClick={() => { setMustahikOpen(false); setDeleteTarget({ kind: "recipient", id: editingRecipient.recipient_id, label: editingRecipient.name }); }}>Hapus</Button>
          )}
        </form>
      </BottomSheet>
      <BottomSheet open={rincianOpen} onClose={() => setRincianOpen(false)} title="Edit Rincian (%)">
        <form onSubmit={saveRincian}>
          <div className="grid grid-cols-3 gap-x-3">
            <Input label="Mustahik %" type="number" value={rincianForm.pMustahik} onChange={(e) => setRincianForm({ ...rincianForm, pMustahik: Number(e.target.value) })} />
            <Input label="Sabilillah %" type="number" value={rincianForm.pSabilillah} onChange={(e) => setRincianForm({ ...rincianForm, pSabilillah: Number(e.target.value) })} />
            <Input label="Amil %" type="number" value={rincianForm.pAmil} onChange={(e) => setRincianForm({ ...rincianForm, pAmil: Number(e.target.value) })} />
          </div>
          <p className={`text-ios-caption px-1 mb-3 font-bold ${rincianForm.pMustahik + rincianForm.pSabilillah + rincianForm.pAmil === 100 ? "text-success" : "text-danger"}`}>
            Total: {rincianForm.pMustahik + rincianForm.pSabilillah + rincianForm.pAmil}% (wajib 100%)
          </p>
          <Button type="submit" fullWidth disabled={savingRincian}>{savingRincian ? "Menyimpan…" : "Simpan Rincian"}</Button>
        </form>
      </BottomSheet>
      {/* Modal konfirmasi spek #completeZakatConfirmOverlay */}
      <ConfirmDialog
        open={confirmCompleteOpen}
        title="Tandai selesai?"
        description="Pastikan muzaki, rincian, dan penyaluran mustahik sudah lengkap."
        confirmLabel="Tandai Selesai" loading={completing}
        onConfirm={async () => { setConfirmCompleteOpen(false); await toggleComplete(); }}
        onCancel={() => setConfirmCompleteOpen(false)}
      />
      {/* Modal konfirmasi spek #cancelCompleteZakatConfirmOverlay */}
      <ConfirmDialog
        open={confirmCancelOpen}
        title="Batalkan selesai?"
        description="Status zakat akan dikembalikan menjadi Aktif."
        confirmLabel="Batalkan Selesai" danger loading={completing}
        onConfirm={async () => { setConfirmCancelOpen(false); await toggleComplete(); }}
        onCancel={() => setConfirmCancelOpen(false)}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus data?"
        description={`"${deleteTarget?.label}" akan dihapus permanen.`}
        confirmLabel="Ya, hapus" danger loading={deleting}
        onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  );
};
