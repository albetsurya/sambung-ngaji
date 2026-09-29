import React, { useState, useEffect } from "react";
import {
  financeApi,
  type DueMember,
  type DuePayment,
  type DuesDataResponse,
} from "../api/financeApi";
import { formatRp } from "../../../utils/format";
import { useToast } from "../../../contexts/ToastContext";
import { usePermission } from "../../../hooks/usePermission";
import { MonthlyDuesPrintModal } from "../components/MonthlyDuesPrintModal";

export const MonthlyDuesPage: React.FC = () => {
  const { showToast } = useToast();
  const { assignedGroup, isSuperAdmin } = usePermission();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DuesDataResponse | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${m}`;
  });

  // Modal States
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<DueMember | null>(null);
  const [memberName, setMemberName] = useState("");
  const [memberTarget, setMemberTarget] = useState(0);

  // Payment Form Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<DueMember | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    payment_id: "",
    payment_date: new Date().toISOString().slice(0, 10),
    carryover_ir: 0,
    connecting_fund: 0,
    community_dues: 0,
    outreach_fund: 0,
    thousand_fund: 0,
    funeral_fund: 0,
    ukhro_mt: 0,
    notes: "",
  });

  // AI Photo Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPhotoUrl, setAiPhotoUrl] = useState("");
  const [aiExtracting, setAiExtracting] = useState(false);

  // Print Modal
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState<"ALL" | "LUNAS" | "BELUM">("ALL");

  const loadData = async () => {
    if (!assignedGroup) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await financeApi.getShodaqohData(assignedGroup, selectedMonth);
      setData(res);
    } catch (err: any) {
      showToast(err.message || "Gagal memuat data shodaqoh", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth, assignedGroup]);

  // Member CRUD
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) {
      showToast("Nama anggota wajib diisi", "error");
      return;
    }
    try {
      if (editingMember) {
        await financeApi.updateDueMember(assignedGroup, editingMember.member_id, memberName, memberTarget);
        showToast("Anggota shodaqoh berhasil diperbarui", "success");
      } else {
        await financeApi.addDueMember(assignedGroup, memberName, memberTarget);
        showToast("Anggota shodaqoh berhasil ditambahkan", "success");
      }
      setIsMemberModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || "Gagal menyimpan anggota", "error");
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!window.confirm("Yakin ingin menghapus anggota ini dari daftar shodaqoh?")) return;
    try {
      await financeApi.deleteDueMember(assignedGroup, memberId);
      showToast("Anggota shodaqoh berhasil dihapus", "success");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Gagal menghapus anggota", "error");
    }
  };

  // Payment Submission
  const handleOpenPaymentModal = async (member: DueMember) => {
    setSelectedMember(member);
    setPaymentForm({
      payment_id: "",
      payment_date: new Date().toISOString().slice(0, 10),
      carryover_ir: 0,
      connecting_fund: 0,
      community_dues: 0,
      outreach_fund: 0,
      thousand_fund: 0,
      funeral_fund: 0,
      ukhro_mt: 0,
      notes: "",
    });

    // Try pre-filling last nominals
    try {
      const lastRes = await financeApi.getShodaqohLastNominals(assignedGroup, member.member_id);
      if (lastRes && lastRes.success && lastRes.values) {
        const v = lastRes.values;
        setPaymentForm((prev) => ({
          ...prev,
          carryover_ir: Number(v.carryover_ir ?? v.susulan_ir) || 0,
          connecting_fund: Number(v.connecting_fund ?? v.uang_sambung) || 0,
          community_dues: Number(v.community_dues ?? v.jimpitan) || 0,
          outreach_fund: Number(v.outreach_fund ?? v.siar_siar) || 0,
          thousand_fund: Number(v.thousand_fund ?? v.seribuan) || 0,
          funeral_fund: Number(v.funeral_fund ?? v.kafan) || 0,
          ukhro_mt: Number(v.ukhro_mt) || 0,
        }));
      }
    } catch (e) {
      /* fallback empty */
    }

    setIsPaymentModalOpen(true);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    const total =
      paymentForm.carryover_ir +
      paymentForm.connecting_fund +
      paymentForm.community_dues +
      paymentForm.outreach_fund +
      paymentForm.thousand_fund +
      paymentForm.funeral_fund +
      paymentForm.ukhro_mt;

    if (total <= 0) {
      showToast("Total pembayaran shodaqoh harus lebih besar dari 0", "error");
      return;
    }

    const payload = {
      payment_id: paymentForm.payment_id,
      member_id: selectedMember.member_id,
      payment_date: paymentForm.payment_date,
      total_amount: total,
      carryover_ir: paymentForm.carryover_ir,
      connecting_fund: paymentForm.connecting_fund,
      community_dues: paymentForm.community_dues,
      outreach_fund: paymentForm.outreach_fund,
      thousand_fund: paymentForm.thousand_fund,
      funeral_fund: paymentForm.funeral_fund,
      ukhro_mt: paymentForm.ukhro_mt,
      notes: paymentForm.notes,
    };

    try {
      if (paymentForm.payment_id) {
        await financeApi.updateDuePayment(assignedGroup, payload);
        showToast("Pembayaran shodaqoh berhasil diupdate", "success");
      } else {
        await financeApi.createDuePayment(assignedGroup, payload);
        showToast("Pembayaran shodaqoh berhasil disimpan", "success");
      }
      setIsPaymentModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || "Gagal menyimpan pembayaran", "error");
    }
  };

  // AI Photo Extract
  const handleAiExtract = async () => {
    if (!aiPhotoUrl.trim()) {
      showToast("Unggah foto atau masukkan Base64/URL foto terlebih dahulu", "error");
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
          carryover_ir: Number(d.carryover_ir ?? d.susulan_ir) || 0,
          connecting_fund: Number(d.connecting_fund ?? d.uang_sambung) || 0,
          community_dues: Number(d.community_dues ?? d.jimpitan) || 0,
          outreach_fund: Number(d.outreach_fund ?? d.siar_siar) || 0,
          thousand_fund: Number(d.thousand_fund ?? d.seribuan) || 0,
          funeral_fund: Number(d.funeral_fund ?? d.kafan) || 0,
          ukhro_mt: Number(d.ukhro_mt) || 0,
          notes: d.notes ?? d.keterangan ?? prev.notes,
        }));
        setIsAiModalOpen(false);
      } else {
        showToast(res.message || "Gagal membaca foto", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Gagal memproses AI OCR", "error");
    } finally {
      setAiExtracting(false);
    }
  };

  const membersList = data?.members || [];
  const paymentsList = data?.payments || [];
  const paidIds = new Set(paymentsList.filter((p) => p.total_amount > 0).map((p) => p.member_id));
  const visibleMembers = membersList.filter((m) => {
    if (statusFilter === "ALL") return true;
    const paid = paidIds.has(m.member_id);
    return statusFilter === "LUNAS" ? paid : !paid;
  });
  const dashboard = data?.dashboard;
  const progressPct =
    dashboard && dashboard.target > 0
      ? Math.min(100, Math.round((dashboard.received / dashboard.target) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {!assignedGroup && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-sm text-amber-800 dark:text-amber-200">
          {isSuperAdmin
            ? "Pilih kelompok dulu (menu Lainnya → Kelompok Saya) untuk membuka shodaqoh kelompok."
            : "Akun Anda belum dipetakan ke kelompok. Hubungi admin."}
        </div>
      )}

      {dashboard && (
        <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs text-emerald-200">Target Bulan {selectedMonth}</p>
              <h4 className="text-xl font-bold">{formatRp(dashboard.target)}</h4>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-200">Terkumpul</p>
              <h4 className="text-xl font-bold">{formatRp(dashboard.received)}</h4>
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-emerald-300 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-white/15 font-semibold">{progressPct}% tercapai</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 font-semibold">{dashboard.paidCount} lunas</span>
            <span className="px-2 py-0.5 rounded-full bg-white/15 font-semibold">{dashboard.unpaidCount} belum</span>
            <span className="text-emerald-200">{dashboard.memberCount} anggota</span>
          </div>
        </div>
      )}

      {/* Top Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Month Picker */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Periode Bulan:
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-mono font-bold text-slate-800 dark:text-slate-100 border-0"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setEditingMember(null);
              setMemberName("");
              setMemberTarget(0);
              setIsMemberModalOpen(true);
            }}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors"
          >
            + Anggota Baru
          </button>
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors"
          >
            Cetak Matriks
          </button>
        </div>
      </div>

      {/* Title */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Infak Bulanan</p>
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Monitoring &amp; Pembayaran</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Bulan {selectedMonth}</p>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {(["ALL", "LUNAS", "BELUM"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              statusFilter === s
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
            }`}
          >
            {s === "ALL" ? "Semua" : s === "LUNAS" ? "Lunas" : "Belum Lunas"}
          </button>
        ))}
      </div>

      {/* Member Payment Cards Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <h3 className="text-md font-bold text-slate-800 dark:text-slate-100">
          Daftar Pembayaran Anggota Shodaqoh ({visibleMembers.length} Jamaah)
        </h3>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Memuat data shodaqoh...</div>
        ) : visibleMembers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">Belum ada anggota shodaqoh terdaftar.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleMembers.map((m) => {
              const payment = paymentsList.find((p) => p.member_id === m.member_id);
              const hasPaid = Boolean(payment && payment.total_amount > 0);

              return (
                <div
                  key={m.member_id}
                  className={`p-4 rounded-xl border transition-all ${
                    hasPaid
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300/60 dark:border-emerald-800/40"
                      : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{m.member_name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Target: <span className="font-mono font-semibold">{formatRp(m.monthly_target)}</span>
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        hasPaid
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                          : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {hasPaid ? "Lunas" : "Belum Bayar"}
                    </span>
                  </div>

                  {/* Payment Breakdown Summary */}
                  {payment && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500">Total Terbayar:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatRp(payment.total_amount)}</span>
                      </div>
                      {payment.notes && (
                        <p className="text-[11px] text-slate-500 italic truncate">Ket: {payment.notes}</p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 pt-2 flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800">
                    <button
                      onClick={() => handleOpenPaymentModal(m)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                    >
                      {hasPaid ? "Edit Input Shodaqoh" : "+ Input Shodaqoh"}
                    </button>

                    <div className="flex items-center gap-2 text-xs">
                      <button
                        onClick={() => {
                          setEditingMember(m);
                          setMemberName(m.member_name);
                          setMemberTarget(m.monthly_target);
                          setIsMemberModalOpen(true);
                        }}
                        className="text-slate-500 hover:text-slate-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMember(m.member_id)}
                        className="text-rose-500 hover:text-rose-700 font-medium"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Add/Edit Member */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {editingMember ? "Edit Anggota Shodaqoh" : "Tambah Anggota Shodaqoh"}
            </h3>
            <form onSubmit={handleSaveMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nama Anggota</label>
                <input
                  type="text"
                  placeholder="Nama Jamaah"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border-0"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Target Nominal Bulanan (Rp)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={memberTarget || ""}
                  onChange={(e) => setMemberTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border-0 font-mono font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold"
                >
                  Simpan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Payment Entry Form */}
      {isPaymentModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Input Pembayaran Shodaqoh
                </h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{selectedMember.member_name}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(true)}
                className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity"
              >
                Scan Foto (AI OCR)
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tanggal Pembayaran</label>
                <input
                  type="date"
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border-0 font-mono"
                  required
                />
              </div>

              {/* Category Nominals Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Susulan IR (Rp)</label>
                  <input
                    type="number"
                    value={paymentForm.carryover_ir || ""}
                    onChange={(e) => setPaymentForm({ ...paymentForm, carryover_ir: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Uang Sambung (Rp)</label>
                  <input
                    type="number"
                    value={paymentForm.connecting_fund || ""}
                    onChange={(e) => setPaymentForm({ ...paymentForm, connecting_fund: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Jimpitan (Rp)</label>
                  <input
                    type="number"
                    value={paymentForm.community_dues || ""}
                    onChange={(e) => setPaymentForm({ ...paymentForm, community_dues: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Siar-Siar (Rp)</label>
                  <input
                    type="number"
                    value={paymentForm.outreach_fund || ""}
                    onChange={(e) => setPaymentForm({ ...paymentForm, outreach_fund: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Seribuan (Rp)</label>
                  <input
                    type="number"
                    value={paymentForm.thousand_fund || ""}
                    onChange={(e) => setPaymentForm({ ...paymentForm, thousand_fund: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Kafan (Rp)</label>
                  <input
                    type="number"
                    value={paymentForm.funeral_fund || ""}
                    onChange={(e) => setPaymentForm({ ...paymentForm, funeral_fund: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Ukhro MT (Rp)</label>
                <input
                  type="number"
                  value={paymentForm.ukhro_mt || ""}
                  onChange={(e) => setPaymentForm({ ...paymentForm, ukhro_mt: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Keterangan Catatan</label>
                <input
                  type="text"
                  placeholder="Catatan tambahan..."
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm border-0"
                />
              </div>

              {/* Total Display */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-between border border-emerald-200 dark:border-emerald-800">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Total Realisasi:</span>
                <span className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400">
                  {formatRp(
                    paymentForm.carryover_ir +
                      paymentForm.connecting_fund +
                      paymentForm.community_dues +
                      paymentForm.outreach_fund +
                      paymentForm.thousand_fund +
                      paymentForm.funeral_fund +
                      paymentForm.ukhro_mt
                  )}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold"
                >
                  Simpan Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Photo Scanner Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Scan Foto Tabel Shodaqoh via AI</h3>
            <p className="text-xs text-slate-500">
              Masukkan Base64 atau URL foto catatan shodaqoh untuk diekstraksi nominalnya secara otomatis oleh AI.
            </p>
            <div>
              <textarea
                placeholder="Paste DataURL / Base64 foto di sini (data:image/jpeg;base64,...)"
                rows={4}
                value={aiPhotoUrl}
                onChange={(e) => setAiPhotoUrl(e.target.value)}
                className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono border-0 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl text-sm font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAiExtract}
                disabled={aiExtracting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2"
              >
                {aiExtracting ? "Mengekstraksi AI..." : "Ekstrak Foto"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shodaqoh Print Modal */}
      <MonthlyDuesPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        members={membersList}
        payments={paymentsList}
        periodLabel={selectedMonth}
      />
    </div>
  );
};
