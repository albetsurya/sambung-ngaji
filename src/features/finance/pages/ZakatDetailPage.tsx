import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { financeApi, type ZakatItem } from "../api/financeApi";
import { formatDateLong, formatRp } from "../../../utils/format";
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
import { AnimatedNumber, AnimatedProgress, SuccessCheck, staggerStyle } from "../../../components/ui/Motion";
import {
  Pencil,
  Printer,
  CheckCircle2,
  Trash2,
} from "../../../components/ui/FontAwesomeIcons";
import {
  SectionTitle,
  StatusPill,
  HeaderActions,
  HeaderIconButton,
} from "../components/FinanceShared";
import { ApiError } from "../../../services/api";

type Tab = "muzaki" | "rincian" | "mustahik";

function calcRincian(z: ZakatItem | null, category: string) {
  const payers = z?.payer_list || (z?.muzakki_list as any[]) || [];
  const catPayers = payers.filter(
    (p: any) => normZakatCategory(p.zakat_category) === category,
  );
  const catSum = catPayers.reduce(
    (s: number, p: any) => s + (Number(p.amount) || 0),
    0,
  );
  const payerSum = payers.reduce(
    (s: number, p: any) => s + (Number(p.amount) || 0),
    0,
  );
  const total = catSum || Number(z?.total_money_rp) || payerSum;
  const alloc =
    z?.allocations?.by_category?.[category] ??
    (category === "FITRAH" ? z?.allocations?.fitrah : z?.allocations?.maal);
  const hasAlloc =
    Boolean(alloc) &&
    (alloc?.recipient?.percent || 0) +
      (alloc?.sabilillah?.percent || 0) +
      (alloc?.amil?.percent || 0) >
      0;
  const pct = (v: number | undefined, d: number) =>
    typeof v === "number" && v > 0 ? v : d;
  const amt = (v: number | undefined, p: number) =>
    typeof v === "number" && v > 0 ? v : Math.round((total * p) / 100);
  if (!hasAlloc) {
    const pM = 45,
      pS = 40,
      pA = 15;
    const mustahik = Math.round((total * pM) / 100);
    const sabilillah = Math.round((total * pS) / 100);
    const amil = total - mustahik - sabilillah;
    return {
      total,
      mustahik,
      sabilillah,
      amil,
      pMustahik: pM,
      pSabilillah: pS,
      pAmil: pA,
      mustahikKelompok: Math.round((mustahik * 80) / 100),
      mustahikDaerah: mustahik - Math.round((mustahik * 80) / 100),
      amilKelompok: Math.round((total * 12) / 100),
      amilDesa: Math.round((total * 2) / 100),
      amilDaerah: Math.max(
        0,
        amil - Math.round((total * 12) / 100) - Math.round((total * 2) / 100),
      ),
      isPreview: true,
    };
  }
  const pM = pct(alloc?.recipient?.percent, 45);
  const pS = pct(alloc?.sabilillah?.percent, 40);
  const pA = pct(alloc?.amil?.percent, 15);
  const mustahik = amt(alloc?.recipient?.amount, pM);
  const sabilillah = amt(alloc?.sabilillah?.amount, pS);
  const amil = amt(alloc?.amil?.amount, pA);
  const mKel =
    alloc?.recipient?.group?.amount || Math.round((mustahik * 80) / 100);
  const mDae = alloc?.recipient?.region?.amount || mustahik - mKel;
  const aKel = alloc?.amil?.group?.amount || Math.round((total * 12) / 100);
  const aDes = alloc?.amil?.village?.amount || Math.round((total * 2) / 100);
  const aDae = alloc?.amil?.region?.amount || Math.max(0, amil - aKel - aDes);
  return {
    total,
    mustahik,
    sabilillah,
    amil,
    pMustahik: pM,
    pSabilillah: pS,
    pAmil: pA,
    mustahikKelompok: mKel,
    mustahikDaerah: mDae,
    amilKelompok: aKel,
    amilDesa: aDes,
    amilDaerah: aDae,
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
  const [headerForm, setHeaderForm] = useState({
    title: "",
    location: "",
    transaction_date: "",
    description: "",
  });
  const [savingHeader, setSavingHeader] = useState(false);
  const [muzakiOpen, setMuzakiOpen] = useState(false);
  const [editingPayer, setEditingPayer] = useState<any | null>(null);
  const [payerForm, setPayerForm] = useState({
    name: "",
    amount: 0,
    family_members_count: 1,
    zakat_category: "FITRAH" as
      | "FITRAH"
      | "MAL"
      | "TIJAROH"
      | "ZURU"
      | "LIVESTOCK"
      | "OTHER",
  });
  const [savingPayer, setSavingPayer] = useState(false);
  const [mustahikOpen, setMustahikOpen] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<any | null>(null);
  const [recipientForm, setRecipientForm] = useState({ name: "", amount: 0 });
  const [savingRecipient, setSavingRecipient] = useState(false);
  const [rincianOpen, setRincianOpen] = useState(false);
  const [rincianCategory, setRincianCategory] = useState<string>("FITRAH");
  const [rincianForm, setRincianForm] = useState({
    pMustahik: 45,
    pSabilillah: 40,
    pAmil: 15,
  });
  const [savingRincian, setSavingRincian] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    kind: string;
    id?: string;
    label: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const load = async () => {
    if (!assignedGroup || !id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const d = await financeApi.getZakatDetail(assignedGroup, id);
      setData(d);
    } catch (err: any) {
      setLoadError(
        err instanceof ApiError ? err.message : "Gagal memuat detail zakat",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [assignedGroup, id]);

  const openHeader = () => {
    if (!data) return;
    setHeaderForm({
      title: data.title || "",
      location: data.location || "",
      transaction_date: data.transaction_date || "",
      description: data.description || "",
    });
    setHeaderOpen(true);
  };
  const saveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSavingHeader(true);
    try {
      await financeApi.manageZakat(assignedGroup, "updateZakat", {
        zakat_id: data.zakat_id,
        ...headerForm,
      });
      showToast("Data zakat diperbarui", "success");
      setHeaderOpen(false);
      load();
    } catch (err: any) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menyimpan",
        "error",
      );
    } finally {
      setSavingHeader(false);
    }
  };
  const openPayer = (p?: any) => {
    const cat = (
      p?.zakat_category ? normZakatCategory(p.zakat_category) : "FITRAH"
    ) as "FITRAH" | "MAL" | "TIJAROH" | "ZURU" | "LIVESTOCK" | "OTHER";
    setEditingPayer(p || null);
    setPayerForm(
      p
        ? {
            name: p.name || "",
            amount: Number(p.amount) || 0,
            family_members_count: Number(p.family_members_count) || 1,
            zakat_category: cat,
          }
        : { name: "", amount: 0, family_members_count: 1, zakat_category: cat },
    );
    setMuzakiOpen(true);
  };
  const savePayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !payerForm.name.trim()) {
      showToast("Nama muzakki wajib diisi", "error");
      return;
    }
    const payload = {
      ...payerForm,
      family_members_count:
        payerForm.zakat_category === "FITRAH"
          ? Number(payerForm.family_members_count) || 1
          : 0,
    };
    setSavingPayer(true);
    try {
      const cur = [...(data.payer_list || [])];
      if (editingPayer?.payer_id) {
        const i = cur.findIndex(
          (x: any) => x.payer_id === editingPayer.payer_id,
        );
        if (i >= 0) cur[i] = { ...cur[i], ...payload };
      } else {
        cur.push({ payer_id: `tmp-${Date.now()}`, ...payload });
      }
      await financeApi.saveZakatPayers(assignedGroup, data.zakat_id, cur);
      showToast("Muzaki disimpan", "success");
      setMuzakiOpen(false);
      load();
    } catch (err: any) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menyimpan muzakki",
        "error",
      );
    } finally {
      setSavingPayer(false);
    }
  };
  const openRecipient = (r?: any) => {
    setEditingRecipient(r || null);
    setRecipientForm(
      r
        ? { name: r.name || "", amount: Number(r.amount) || 0 }
        : { name: "", amount: 0 },
    );
    setMustahikOpen(true);
  };
  const saveRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !recipientForm.name.trim()) {
      showToast("Nama mustahik wajib diisi", "error");
      return;
    }
    setSavingRecipient(true);
    try {
      const cur = [...(data.recipient_list || [])];
      if (editingRecipient?.recipient_id) {
        const i = cur.findIndex(
          (x: any) => x.recipient_id === editingRecipient.recipient_id,
        );
        if (i >= 0) cur[i] = { ...cur[i], ...recipientForm };
      } else {
        cur.push({
          recipient_id: `tmp-${Date.now()}`,
          ...recipientForm,
          zakat_category: rincianCategory || "FITRAH",
        });
      }
      await financeApi.saveZakatRecipients(assignedGroup, data.zakat_id, cur);
      showToast("Mustahik disimpan", "success");
      setMustahikOpen(false);
      load();
    } catch (err: any) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menyimpan mustahik",
        "error",
      );
    } finally {
      setSavingRecipient(false);
    }
  };
  const openRincian = (cat?: string) => {
    if (cat) setRincianCategory(cat);
    const r = calcRincian(data, cat || rincianCategory);
    setRincianForm({
      pMustahik: r.pMustahik || 45,
      pSabilillah: r.pSabilillah || 40,
      pAmil: r.pAmil || 15,
    });
    setRincianOpen(true);
  };
  const saveRincian = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    const { pMustahik, pSabilillah, pAmil } = rincianForm;
    if (pMustahik + pSabilillah + pAmil !== 100) {
      showToast("Total persen harus 100%", "error");
      return;
    }
    const payers = data.payer_list || [];
    const catPayers = payers.filter(
      (p: any) => normZakatCategory(p.zakat_category) === rincianCategory,
    );
    const catSum = catPayers.reduce(
      (s: number, p: any) => s + (Number(p.amount) || 0),
      0,
    );
    const payerSum = payers.reduce(
      (s: number, p: any) => s + (Number(p.amount) || 0),
      0,
    );
    const total = catSum || Number(data.total_money_rp) || payerSum;
    const mustahik = Math.round((total * pMustahik) / 100);
    const sabilillah = Math.round((total * pSabilillah) / 100);
    const amil = total - mustahik - sabilillah;
    const mKel = Math.round((mustahik * 80) / 100);
    const aKel = Math.round((total * 12) / 100);
    const aDes = Math.round((total * 2) / 100);
    setSavingRincian(true);
    try {
      await financeApi.saveZakatAllocations(assignedGroup, data.zakat_id, [
        {
          category: rincianCategory,
          recipient_percent: pMustahik,
          recipient_amount: mustahik,
          recipient_group_percent: 80,
          recipient_group_amount: mKel,
          recipient_region_percent: 20,
          recipient_region_amount: mustahik - mKel,
          sabilillah_percent: pSabilillah,
          sabilillah_amount: sabilillah,
          amil_percent: pAmil,
          amil_amount: amil,
          amil_group_percent: 12,
          amil_group_amount: aKel,
          amil_village_percent: 2,
          amil_village_amount: aDes,
          amil_region_percent: Math.max(0, pAmil - 14),
          amil_region_amount: Math.max(0, amil - aKel - aDes),
        },
      ]);
      showToast("Rincian disimpan", "success");
      setRincianOpen(false);
      load();
    } catch (err: any) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menyimpan rincian",
        "error",
      );
    } finally {
      setSavingRincian(false);
    }
  };
  const confirmDelete = async () => {
    if (!data || !deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.kind === "record") {
        await financeApi.manageZakat(assignedGroup, "deleteZakat", {
          zakat_id: data.zakat_id,
        });
        showToast("Catatan zakat dihapus", "success");
        navigate("/finance/zakat");
        return;
      }
      if (deleteTarget.kind === "payer") {
        const cur = (data.payer_list || []).filter(
          (x: any) => x.payer_id !== deleteTarget.id,
        );
        await financeApi.saveZakatPayers(assignedGroup, data.zakat_id, cur);
      }
      if (deleteTarget.kind === "recipient") {
        const cur = (data.recipient_list || []).filter(
          (x: any) => x.recipient_id !== deleteTarget.id,
        );
        await financeApi.saveZakatRecipients(assignedGroup, data.zakat_id, cur);
      }
      showToast("Data dihapus", "success");
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menghapus",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };
  const toggleComplete = async () => {
    if (!data) return;
    setCompleting(true);
    try {
      const action =
        data.status === "COMPLETED" ? "cancelCompleteZakat" : "completeZakat";
      await financeApi.manageZakat(assignedGroup, action, {
        zakat_id: data.zakat_id,
      });
      showToast(
        data.status === "COMPLETED"
          ? "Dikembalikan ke Proses"
          : "Zakat dituntaskan",
        "success",
      );
      load();
    } catch (err: any) {
      showToast(
        err instanceof ApiError ? err.message : "Gagal mengubah status",
        "error",
      );
    } finally {
      setCompleting(false);
    }
  };

  const r = calcRincian(data, rincianCategory);
  const payers = data?.payer_list || (data?.muzakki_list as any[]) || [];
  const recipients =
    data?.recipient_list || (data?.mustahik_list as any[]) || [];
  const isDone = data?.status === "COMPLETED";

  const categoryGroups = (() => {
    const groups = new Map<string, any[]>();
    for (const p of payers) {
      const cat = p?.zakat_category
        ? normZakatCategory(p.zakat_category)
        : "FITRAH";
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
  const fitrahJiwa =
    categoryGroups
      .get("FITRAH")
      ?.reduce(
        (s: number, x: any) => s + (Number(x.family_members_count) || 0),
        0,
      ) || 0;
  const payerTotal = payers.reduce(
    (s: number, x: any) => s + (Number(x.amount) || 0),
    0,
  );
  const recipientTotal = recipients.reduce(
    (s: number, x: any) => s + (Number(x.amount) || 0),
    0,
  );

  return (
    <AppLayout
      fab={
        tab === "muzaki" ? (
          <FloatingActionButton
            onClick={() => openPayer()}
            label="Tambah Muzaki"
          />
        ) : tab === "mustahik" ? (
          <FloatingActionButton
            onClick={() => openRecipient()}
            label="Tambah Mustahik"
          />
        ) : undefined
      }
    >
      <Header
        title={data?.title || "Detail Zakat"}
        subtitle={
          data
            ? `${(data.categories || []).map((c: string) => zakatCategoryLabel(c)).join(" + ") || "Belum ada tipe"} · ${isDone ? "Tuntas" : "Proses"}`
            : "Memuat…"
        }
        onBack={() => navigate("/finance/zakat")}
        backLabel="Zakat"
        showSyncButton={false}
        right={
          <HeaderActions>
            <HeaderIconButton
              onClick={openHeader}
              label="Edit data zakat"
              testId="btn-edit-zakat-header"
            >
              <Pencil size={15} />
            </HeaderIconButton>
            <HeaderIconButton
              onClick={() =>
                navigate(`/finance/zakat/${id}/print?mode=kwitansi`)
              }
              label="Cetak laporan"
              testId="btn-print-zakat-header"
            >
              <Printer size={15} />
            </HeaderIconButton>
          </HeaderActions>
        }
      />

      <div className={`py-4 ${tab === "rincian" ? "" : "pb-24"}`}>
        {loading ? (
          <GroupedListSkeleton rows={5} />
        ) : loadError || !data ? (
          <ErrorState
            message={loadError || "Data tidak ditemukan"}
            onRetry={load}
          />
        ) : (
          <>
            <section className="px-4">
              <Card data-testid="zakat-detail-header" className="!p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-ios-caption text-surface-muted truncate"
                      data-testId="zakat-detail-meta"
                    >
                      {[
                        data.transaction_date
                          ? formatDateLong(data.transaction_date)
                          : "",
                        data.location,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "Tanpa tanggal"}
                    </p>
                    {data.description && (
                      <p
                        className="mt-1.5 text-ios-footnote text-surface-muted leading-relaxed line-clamp-2"
                        data-testid="zakat-detail-keterangan"
                      >
                        {data.description}
                      </p>
                    )}
                  </div>
                  <StatusPill
                    tone={isDone ? "success" : "warning"}
                    testId="zakat-detail-status"
                  >
                    {isDone ? "Selesai" : "Aktif"}
                  </StatusPill>
                </div>

                <div className="mt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-surface-muted mb-1.5">
                    Kategori
                  </p>
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    {(data.categories || []).length > 0 ? (
                      data.categories!.map((c: string) => (
                        <span
                          key={c}
                          className="inline-flex items-center gap-1.5 shrink-0 rounded-md bg-accent-soft text-accent px-2 py-1 text-[11px] font-semibold whitespace-nowrap"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                          {zakatCategoryLabel(c)}
                        </span>
                      ))
                    ) : (
                      <span className="inline-flex items-center gap-1.5 shrink-0 rounded-md bg-surface-card2 text-surface-muted px-2 py-1 text-[11px] font-semibold whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-surface-muted shrink-0" />
                        Belum ada tipe
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3.5 rounded-xl bg-accent-soft border border-accent/20 px-3.5 py-3 anim-stagger">
                  {isDone && (
                    <div className="mb-2 flex items-center gap-2" data-testid="zakat-success-check">
                      <SuccessCheck size={28} />
                      <p className="text-ios-footnote font-semibold text-success">Penyaluran selesai</p>
                    </div>
                  )}
                  <p className="text-ios-caption font-semibold uppercase tracking-wider text-surface-muted">
                    Total Zakat Terkumpul
                  </p>
                  <p
                    className="mt-0.5 font-display text-ios-nav font-extrabold text-accent tabular-nums"
                    data-testid="zakat-detail-total"
                  >
                    <AnimatedNumber value={Number(data.total_money_rp) || 0} format={formatRp} />
                    {Number(data.total_rice_kg) > 0 ? (
                      <span className="text-ios-body font-bold text-accent/80">
                        {" "}
                        + {Number(data.total_rice_kg)} Kg
                      </span>
                    ) : null}
                  </p>
                </div>

                <div className="mt-3.5 grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<CheckCircle2 size={14} />}
                    onClick={() => {
                      if (isDone) setConfirmCancelOpen(true);
                      else setConfirmCompleteOpen(true);
                    }}
                    data-testid="btn-toggle-complete-card"
                  >
                    {isDone ? "Batalkan" : "Selesai"}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<Trash2 size={14} />}
                    onClick={() =>
                      setDeleteTarget({
                        kind: "record",
                        label: data.title || data.categories?.join(" + ") || "",
                      })
                    }
                    data-testid="btn-delete-card"
                  >
                    Hapus
                  </Button>
                </div>
              </Card>
            </section>

            <div className="px-4 mt-4">
              <Segmented<Tab>
                ariaLabel="Tab detail zakat"
                value={tab}
                onChange={setTab}
                size="sm"
                options={[
                  { value: "muzaki", label: `Muzaki (${payers.length})` },
                  { value: "rincian", label: "Rincian" },
                  {
                    value: "mustahik",
                    label: `Mustahik (${recipients.length})`,
                  },
                ]}
              />
            </div>

            {tab === "rincian" && (
              <section className="mt-5">
                <SectionTitle>Kategori Rincian</SectionTitle>
                <div className="px-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {(data.categories?.length ? data.categories : ["FITRAH"]).map(
                    (c: string) => (
                      <FilterChip
                        key={c}
                        active={rincianCategory === c}
                        label={zakatCategoryLabel(c)}
                        onClick={() => {
                          setRincianCategory(c);
                          openRincian(c);
                        }}
                      />
                    ),
                  )}
                </div>

                <div className="px-4 mt-3">
                  <Card className="!p-4">
                    <div className="flex h-9 rounded-xl overflow-hidden bg-surface-card2 border border-surface-border">
                      <div
                        className="bg-accent text-[10px] font-bold text-white flex items-center justify-center transition-all"
                        style={{ width: `${r.pMustahik}%` }}
                      >
                        {r.pMustahik > 12 ? `${r.pMustahik}%` : ""}
                      </div>
                      <div
                        className="bg-warning text-[10px] font-bold text-white flex items-center justify-center transition-all"
                        style={{ width: `${r.pSabilillah}%` }}
                      >
                        {r.pSabilillah > 12 ? `${r.pSabilillah}%` : ""}
                      </div>
                      <div
                        className="bg-success text-[10px] font-bold text-white flex items-center justify-center transition-all"
                        style={{ width: `${r.pAmil}%` }}
                      >
                        {r.pAmil > 12 ? `${r.pAmil}%` : ""}
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-2 text-ios-caption">
                      <span className="text-surface-muted truncate">
                        Mustahik {r.pMustahik}% · Sabilillah {r.pSabilillah}% ·
                        Amil {r.pAmil}%
                      </span>
                      <button
                        onClick={() => openRincian()}
                        className="font-bold text-accent shrink-0"
                      >
                        Ubah
                      </button>
                    </div>
                    {r.isPreview && (
                      <p className="mt-2 text-ios-caption text-warning font-medium leading-relaxed">
                        Pratinjau default 45/40/15 - ketuk Ubah lalu Simpan
                        untuk mengunci rincian.
                      </p>
                    )}
                  </Card>
                </div>

                <div className="mt-4">
                  <GroupedList>
                    {(
                      [
                        {
                          label: "Total Dana",
                          pct: "",
                          val: r.total,
                          indent: false,
                          dot: "bg-surface-muted",
                        },
                        {
                          label: "Mustahik",
                          pct: `${r.pMustahik}%`,
                          val: r.mustahik,
                          indent: false,
                          dot: "bg-accent",
                        },
                        {
                          label: "Kelompok",
                          pct: "80% dari mustahik",
                          val: r.mustahikKelompok,
                          indent: true,
                          dot: "bg-accent/60",
                        },
                        {
                          label: "Daerah",
                          pct: "20% dari mustahik",
                          val: r.mustahikDaerah,
                          indent: true,
                          dot: "bg-accent/60",
                        },
                        {
                          label: "Sabilillah",
                          pct: `${r.pSabilillah}%`,
                          val: r.sabilillah,
                          indent: false,
                          dot: "bg-warning",
                        },
                        {
                          label: "Amil",
                          pct: `${r.pAmil}%`,
                          val: r.amil,
                          indent: false,
                          dot: "bg-success",
                        },
                        {
                          label: "Amil Kelompok",
                          pct: "12%",
                          val: r.amilKelompok,
                          indent: true,
                          dot: "bg-success/60",
                        },
                        {
                          label: "Amil Desa",
                          pct: "2%",
                          val: r.amilDesa,
                          indent: true,
                          dot: "bg-success/60",
                        },
                        {
                          label: "Amil Daerah",
                          pct: "sisa",
                          val: r.amilDaerah,
                          indent: true,
                          dot: "bg-success/60",
                        },
                      ] as Array<{
                        label: string;
                        pct: string;
                        val: number;
                        indent: boolean;
                        dot: string;
                      }>
                    ).map((row, i, a) => (
                      <ListRow
                        key={row.label}
                        insetDivider={i !== a.length - 1}
                      >
                        <div
                          className={`flex items-center justify-between gap-2 w-full ${row.indent ? "pl-5" : ""}`}
                        >
                          <span
                            className={`shrink-0 rounded-full ${row.dot} ${
                              row.indent ? "w-1.5 h-1.5" : "w-2.5 h-2.5"
                            }`}
                          />
                          <p className="text-ios-body text-surface-text min-w-0 flex-1 truncate">
                            {row.label}{" "}
                            {row.pct ? (
                              <span className="text-ios-caption text-surface-muted font-medium">
                                {row.pct}
                              </span>
                            ) : null}
                          </p>
                          <p className="text-ios-subhead font-bold text-surface-text shrink-0 tabular-nums">
                            {formatRp(row.val)}
                          </p>
                        </div>
                      </ListRow>
                    ))}
                  </GroupedList>
                </div>
              </section>
            )}

            {tab === "muzaki" && (
              <section className="mt-5">
                <SectionTitle testId="zakat-muzaki-count-display">
                  Daftar Muzaki · {payers.length} orang
                  {categoriesPresent.includes("FITRAH")
                    ? ` · ${fitrahJiwa} jiwa fitrah`
                    : ""}
                </SectionTitle>
                {payers.length === 0 ? (
                  <EmptyState
                    title="Belum ada muzakki"
                    description="Tambah via tombol +."
                  />
                ) : (
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
                            <p className="px-4 text-ios-caption text-surface-muted">
                              Belum ada muzakki {label.toLowerCase()}.
                            </p>
                          ) : (
                            <GroupedList>
                              {list.map((m: any, i: number) => (
                                <ListRow
                                  key={m.payer_id || i}
                                  onClick={() => openPayer(m)}
                                  insetDivider={i !== list.length - 1}
                                  leading={
                                    <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0 font-bold text-ios-body">
                                      {(m.name || m.nama || "?")
                                        .charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  }
                                >
                                  <div className="flex items-center justify-between w-full gap-2">
                                    <div className="min-w-0">
                                      <p className="truncate font-medium text-ios-body">
                                        {m.name || m.nama}
                                      </p>
                                      {showJiwa &&
                                        Number(m.family_members_count) > 0 && (
                                          <p className="text-ios-caption text-surface-muted">
                                            {m.family_members_count} jiwa
                                          </p>
                                        )}
                                    </div>
                                    <p className="font-bold shrink-0 tabular-nums">
                                      {m.amount ? formatRp(m.amount) : ""}
                                    </p>
                                  </div>
                                </ListRow>
                              ))}
                            </GroupedList>
                          )}
                        </div>
                      );
                    })}
                    <div className="px-4 mt-3">
                      <Card
                        className="flex items-center justify-between !py-3"
                        data-testid="zakat-muzaki-table-total"
                      >
                        <span className="text-ios-footnote font-semibold">
                          Total ({payers.length})
                        </span>
                        <span className="font-extrabold tabular-nums">
                          {formatRp(payerTotal)}
                        </span>
                      </Card>
                    </div>
                  </>
                )}
              </section>
            )}

            {tab === "mustahik" && (
              <section className="mt-5">
                <SectionTitle testId="zakat-mustahik-count-display">
                  Penyaluran Mustahik · {recipients.length} penerima
                </SectionTitle>
                {(() => {
                  const dana = r.mustahik || 0;
                  const tersalurkan = recipientTotal;
                  const sisa = Math.max(0, dana - tersalurkan);
                  const pct =
                    dana > 0
                      ? Math.min(100, Math.round((tersalurkan / dana) * 100))
                      : 0;

                  const noAlloc = dana <= 0;
                  const isDone = !noAlloc && sisa <= 0;
                  const hasRemain = !noAlloc && sisa > 0;

                  const sisaTone = noAlloc
                    ? {
                        cardBg: "",
                        dot: "bg-surface-muted",
                        text: "text-surface-muted",
                        value: "text-surface-text",
                      }
                    : isDone
                      ? {
                          cardBg: "!bg-success-soft !border-success/20",
                          dot: "bg-success",
                          text: "text-success/80",
                          value: "text-success",
                        }
                      : {
                          cardBg: "!bg-warning-soft !border-warning/20",
                          dot: "bg-warning",
                          text: "text-warning/80",
                          value: "text-warning",
                        };

                  const statusLabel = noAlloc
                    ? "Belum ada alokasi"
                    : isDone
                      ? "Tuntas tersalurkan"
                      : `Sisa ${formatRp(sisa)}`;

                  const progressClass = isDone
                    ? "bg-success"
                    : hasRemain
                      ? "bg-warning"
                      : "bg-surface-muted";

                  return (
                    <>
                      <div
                        className="mx-4 grid grid-cols-3 gap-2"
                        data-testid="zakat-mustahik-info-bar"
                      >
                        <Card className="!p-3">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                            <p className="text-ios-caption text-surface-muted">
                              Dana
                            </p>
                          </div>
                          <p
                            className="mt-0.5 font-extrabold text-ios-subhead tabular-nums text-surface-text"
                            data-testid="zakat-mustahik-dana-view"
                          >
                            {formatRp(dana)}
                          </p>
                        </Card>

                        <Card className="!p-3">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                            <p className="text-ios-caption text-surface-muted">
                              Tersalurkan
                            </p>
                          </div>
                          <p
                            className="mt-0.5 font-extrabold text-ios-subhead text-success tabular-nums"
                            data-testid="zakat-mustahik-tersalurkan"
                          >
                            {formatRp(tersalurkan)}
                          </p>
                        </Card>

                        <Card className={`!p-3 ${sisaTone.cardBg}`}>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${sisaTone.dot} shrink-0`}
                            />
                            <p className={`text-ios-caption ${sisaTone.text}`}>
                              Sisa
                            </p>
                          </div>
                          <p
                            className={`mt-0.5 font-extrabold text-ios-subhead tabular-nums ${sisaTone.value}`}
                            data-testid="zakat-mustahik-sisa-view"
                          >
                            {formatRp(sisa)}
                          </p>
                        </Card>
                      </div>

                      <div className="mx-4 mt-3">
                        <div
                          className="h-2 rounded-full bg-surface-card2 progress-track"
                          data-testid="zakat-mustahik-progress-view"
                          role="progressbar"
                          aria-valuenow={Math.round(pct)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div
                            className={`h-full rounded-full progress-fill ${progressClass}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2 text-ios-caption">
                          <span
                            className="text-surface-muted"
                            data-testid="zakat-mustahik-progress-label"
                          >
                            {pct}% tersalurkan
                          </span>
                          <StatusPill
                            tone={
                              noAlloc ? "muted" : isDone ? "success" : "warning"
                            }
                            testId="zakat-mustahik-status-view"
                          >
                            {statusLabel}
                          </StatusPill>
                        </div>
                      </div>
                    </>
                  );
                })()}

                <div className="mt-4">
                  {recipients.length === 0 ? (
                    <EmptyState
                      title="Belum ada mustahik"
                      description="Tambah via tombol +."
                    />
                  ) : (
                    <>
                      <GroupedList>
                        {recipients.map((m: any, i: number) => (
                          <div key={m.recipient_id || i} className="anim-stagger contents" style={staggerStyle(i)}>
                          <ListRow
                            onClick={() => openRecipient(m)}
                            insetDivider={i !== recipients.length - 1}
                            leading={
                              <span className="w-9 h-9 rounded-xl bg-success-soft flex items-center justify-center text-success shrink-0 font-bold text-ios-body">
                                {(m.name || m.nama || "?")
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            }
                          >
                            <div className="flex items-center justify-between w-full gap-2">
                              <p className="truncate font-medium text-ios-body">
                                {m.name || m.nama}
                              </p>
                              <p className="font-bold shrink-0 tabular-nums">
                                {m.amount ? formatRp(m.amount) : ""}
                              </p>
                            </div>
                          </ListRow>
                          </div>
                        ))}
                      </GroupedList>
                      <div className="px-4 mt-3">
                        <Card
                          className="flex items-center justify-between !py-3"
                          data-testid="zakat-mustahik-table-total"
                        >
                          <span className="text-ios-footnote font-semibold">
                            Total ({recipients.length})
                          </span>
                          <span className="font-extrabold tabular-nums">
                            {formatRp(recipientTotal)}
                          </span>
                        </Card>
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <BottomSheet
        open={headerOpen}
        onClose={() => setHeaderOpen(false)}
        title="Edit Data Zakat"
      >
        <form onSubmit={saveHeader}>
          <Input
            label="Judul"
            value={headerForm.title}
            onChange={(e) =>
              setHeaderForm({ ...headerForm, title: e.target.value })
            }
            placeholder="Zakat Fitrah 1447 H"
            required
          />
          <Input
            label="Lokasi"
            value={headerForm.location}
            onChange={(e) =>
              setHeaderForm({ ...headerForm, location: e.target.value })
            }
          />
          <DateInput
            label="Tanggal"
            value={headerForm.transaction_date}
            onChange={(val) =>
              setHeaderForm({ ...headerForm, transaction_date: val })
            }
          />
          <Input
            label="Keterangan"
            value={headerForm.description}
            onChange={(e) =>
              setHeaderForm({ ...headerForm, description: e.target.value })
            }
          />
          <Button type="submit" fullWidth loading={savingHeader}>
            Simpan
          </Button>
        </form>
      </BottomSheet>

      <BottomSheet
        open={muzakiOpen}
        onClose={() => setMuzakiOpen(false)}
        title={editingPayer ? "Edit Muzaki" : "Tambah Muzaki"}
      >
        <form onSubmit={savePayer}>
          <div className="mb-4">
            <Segmented
              ariaLabel="Tipe zakat muzakki"
              value={payerForm.zakat_category}
              onChange={(v) =>
                setPayerForm({ ...payerForm, zakat_category: v })
              }
              options={ZAKAT_CATEGORIES.map((c) => ({
                value: c.value,
                label: c.label,
              }))}
            />
          </div>
          <Input
            label="Nama"
            value={payerForm.name}
            onChange={(e) =>
              setPayerForm({ ...payerForm, name: e.target.value })
            }
            required
          />
          <div className="grid grid-cols-2 gap-x-3">
            <Input
              label="Nominal (Rp)"
              type="number"
              value={payerForm.amount || ""}
              onChange={(e) =>
                setPayerForm({ ...payerForm, amount: Number(e.target.value) })
              }
            />
            {payerForm.zakat_category === "FITRAH" && (
              <Input
                label="Jiwa / Jamaah"
                type="number"
                min={1}
                value={payerForm.family_members_count}
                onChange={(e) =>
                  setPayerForm({
                    ...payerForm,
                    family_members_count: Number(e.target.value),
                  })
                }
              />
            )}
          </div>
          <Button type="submit" fullWidth disabled={savingPayer}>
            {savingPayer ? "Menyimpan…" : "Simpan"}
          </Button>
          {editingPayer?.payer_id && (
            <Button
              type="button"
              variant="softDanger"
              fullWidth
              className="mt-2.5"
              onClick={() => {
                setMuzakiOpen(false);
                setDeleteTarget({
                  kind: "payer",
                  id: editingPayer.payer_id,
                  label: editingPayer.name,
                });
              }}
            >
              Hapus
            </Button>
          )}
        </form>
      </BottomSheet>

      <BottomSheet
        open={mustahikOpen}
        onClose={() => setMustahikOpen(false)}
        title={editingRecipient ? "Edit Mustahik" : "Tambah Mustahik"}
      >
        <form onSubmit={saveRecipient}>
          <Input
            label="Nama"
            value={recipientForm.name}
            onChange={(e) =>
              setRecipientForm({ ...recipientForm, name: e.target.value })
            }
            required
          />
          <Input
            label="Nominal (Rp)"
            type="number"
            value={recipientForm.amount || ""}
            onChange={(e) =>
              setRecipientForm({
                ...recipientForm,
                amount: Number(e.target.value),
              })
            }
          />
          <Button type="submit" fullWidth disabled={savingRecipient}>
            {savingRecipient ? "Menyimpan…" : "Simpan"}
          </Button>
          {editingRecipient?.recipient_id && (
            <Button
              type="button"
              variant="softDanger"
              fullWidth
              className="mt-2.5"
              onClick={() => {
                setMustahikOpen(false);
                setDeleteTarget({
                  kind: "recipient",
                  id: editingRecipient.recipient_id,
                  label: editingRecipient.name,
                });
              }}
            >
              Hapus
            </Button>
          )}
        </form>
      </BottomSheet>

      <BottomSheet
        open={rincianOpen}
        onClose={() => setRincianOpen(false)}
        title="Edit Rincian (%)"
      >
        <form onSubmit={saveRincian}>
          <div className="grid grid-cols-3 gap-x-3">
            <Input
              label="Mustahik %"
              type="number"
              value={rincianForm.pMustahik}
              onChange={(e) =>
                setRincianForm({
                  ...rincianForm,
                  pMustahik: Number(e.target.value),
                })
              }
            />
            <Input
              label="Sabilillah %"
              type="number"
              value={rincianForm.pSabilillah}
              onChange={(e) =>
                setRincianForm({
                  ...rincianForm,
                  pSabilillah: Number(e.target.value),
                })
              }
            />
            <Input
              label="Amil %"
              type="number"
              value={rincianForm.pAmil}
              onChange={(e) =>
                setRincianForm({
                  ...rincianForm,
                  pAmil: Number(e.target.value),
                })
              }
            />
          </div>
          <p
            className={`text-ios-caption px-1 mb-3 font-bold ${
              rincianForm.pMustahik +
                rincianForm.pSabilillah +
                rincianForm.pAmil ===
              100
                ? "text-success"
                : "text-danger"
            }`}
          >
            Total:{" "}
            {rincianForm.pMustahik +
              rincianForm.pSabilillah +
              rincianForm.pAmil}
            % (wajib 100%)
          </p>
          <Button type="submit" fullWidth disabled={savingRincian}>
            {savingRincian ? "Menyimpan…" : "Simpan Rincian"}
          </Button>
        </form>
      </BottomSheet>

      <ConfirmDialog
        open={confirmCompleteOpen}
        title="Tandai selesai?"
        description="Pastikan muzaki, rincian, dan penyaluran mustahik sudah lengkap."
        confirmLabel="Tandai Selesai"
        loading={completing}
        onConfirm={async () => {
          setConfirmCompleteOpen(false);
          await toggleComplete();
        }}
        onCancel={() => setConfirmCompleteOpen(false)}
      />
      <ConfirmDialog
        open={confirmCancelOpen}
        title="Batalkan selesai?"
        description="Status zakat akan dikembalikan menjadi Aktif."
        confirmLabel="Batalkan Selesai"
        danger
        loading={completing}
        onConfirm={async () => {
          setConfirmCancelOpen(false);
          await toggleComplete();
        }}
        onCancel={() => setConfirmCancelOpen(false)}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus data?"
        description={`"${deleteTarget?.label}" akan dihapus permanen.`}
        confirmLabel="Ya, hapus"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppLayout>
  );
};
