import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserPlus,
  X,
  AlertTriangle,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import {
  Badge,
  Button,
  Card,
  Select,
  Textarea,
  BottomSheet,
  LoadingOverlay,
  ErrorState,
  Avatar,
} from "../components/common";
import { MemberSelfSkeleton } from "../components/common/Skeleton";
import { pendingApi } from "../services/pendingApi";
import { groupApi } from "../services/domainApi";
import type { PendingMember } from "../types";
import { formatDateShort, normalizeGender } from "../utils/format";
import { useToast } from "../contexts/ToastContext";
import { ApiError, abortAllApiCalls } from "../services/api";
import { queryKeys } from "../lib/queryClient";

const STATUS_BADGE = {
  PENDING: { label: "Menunggu Verifikasi", color: "amber" as const },
  APPROVED: { label: "Disetujui", color: "emerald" as const },
  REJECTED: { label: "Ditolak", color: "red" as const },
};

export default function PendingMemberDetailPage() {
  const { submission_id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.pendingDetail(submission_id || ""),
    queryFn: () => pendingApi.detail(submission_id!),
    enabled: !!submission_id,
    staleTime: 60_000,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["pending-members"] });
    queryClient.invalidateQueries({
      queryKey: queryKeys.pendingDetail(submission_id || ""),
    });
    queryClient.invalidateQueries({ queryKey: ["members"] });
    queryClient.invalidateQueries({ queryKey: queryKeys.membersPaged() });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard() });
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  if (isLoading) {
    return (
      <AppLayout hideNav>
        <Header title="Detail Pendaftar" onBack={() => navigate(-1)} />
        <MemberSelfSkeleton />
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout hideNav>
        <Header title="Detail Pendaftar" onBack={() => navigate(-1)} />
        <ErrorState
          message={
            error instanceof ApiError ? error.message : "Data tidak ditemukan"
          }
          onRetry={refetch}
        />
      </AppLayout>
    );
  }

  const badge = STATUS_BADGE[data.status];
  const canProcess = data.status === "PENDING";

  return (
    <AppLayout hideNav>
      <Header
        title="Detail Pendaftar"
        onBack={() => navigate(-1)}
        backLabel="Pendaftar"
      />

      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <Avatar
          src={data.foto_url}
          name={data.nama_lengkap}
          size={64}
          gender={normalizeGender(data.jenis_kelamin)}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[19px] font-semibold text-surface-text truncate tracking-[-0.01em]">
            {data.nama_lengkap}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Badge color={badge.color}>{badge.label}</Badge>
          </div>
          <p className="text-ios-caption text-surface-muted mt-1">
            Dikirim {formatDateShort(data.submitted_at)}
          </p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-32">
        <Card>
          <p className="text-ios-footnote font-medium text-surface-muted mb-3">
            Data Diri
          </p>
          <div className="space-y-2.5">
            <Field label="Nama Panggilan" value={data.nama_panggilan} />
            <Field
              label="Jenis Kelamin"
              value={data.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
            />
            <Field label="Tempat Lahir" value={data.tempat_lahir} />
            <Field
              label="Tanggal Lahir"
              value={
                data.tanggal_lahir ? formatDateShort(data.tanggal_lahir) : "-"
              }
            />
            <Field
              label="Status Pernikahan"
              value={data.is_nikah ? "Sudah menikah" : "Belum menikah"}
            />
          </div>
        </Card>

        <Card>
          <p className="text-ios-footnote font-medium text-surface-muted mb-3">
            Kontak & Alamat
          </p>
          <div className="space-y-2.5">
            <Field
              label="No. WhatsApp"
              value={data.no_wa ? `+${data.no_wa}` : "-"}
            />
            <Field label="Alamat" value={data.alamat_rumah} />
            <Field label="Desa" value={data.desa} />
            <Field label="Daerah" value={data.daerah} />
          </div>
        </Card>

        <Card>
          <p className="text-ios-footnote font-medium text-surface-muted mb-3">
            Akun Login
          </p>
          <div className="space-y-2.5">
            <Field label="Username" value={data.username} />
          </div>
        </Card>

        {(data.pekerjaan || data.hobi) && (
          <Card>
            <p className="text-ios-footnote font-medium text-surface-muted mb-3">
              Pekerjaan & Hobi
            </p>
            <div className="space-y-2.5">
              <Field label="Pekerjaan" value={data.pekerjaan} />
              <Field label="Hobi" value={data.hobi} />
            </div>
          </Card>
        )}

        {(data.jenjang_pendidikan || data.sekolah || data.jurusan) && (
          <Card>
            <p className="text-ios-footnote font-medium text-surface-muted mb-3">
              Pendidikan
            </p>
            <div className="space-y-2.5">
              <Field label="Jenjang" value={data.jenjang_pendidikan} />
              <Field label="Sekolah" value={data.sekolah} />
              <Field label="Jurusan" value={data.jurusan} />
              <Field label="Tahun Mulai" value={data.tahun_mulai_pendidikan} />
              <Field
                label="Tahun Selesai"
                value={data.tahun_selesai_pendidikan}
              />
            </div>
          </Card>
        )}

        {data.status === "REJECTED" && data.rejection_reason && (
          <Card>
            <div className="flex items-start gap-2">
              <AlertTriangle
                size={16}
                className="text-danger flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-ios-footnote font-medium text-danger mb-1">
                  Alasan Ditolak
                </p>
                <p className="text-ios-footnote text-surface-text leading-relaxed">
                  {data.rejection_reason}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {canProcess && (
        <div className="fixed bottom-0 left-0 right-0 z-30 pb-safe">
          <div className="app-shell px-4 pt-3 pb-4 bg-surface-bg/80 backdrop-blur-xl border-t border-surface-border">
            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setRejectOpen(true)}
                leftIcon={<X size={16} />}
              >
                Tolak
              </Button>
              <Button
                fullWidth
                onClick={() => setApproveOpen(true)}
                leftIcon={<UserPlus size={16} />}
              >
                Setujui
              </Button>
            </div>
          </div>
        </div>
      )}

      <ApproveSheet
        open={approveOpen}
        data={data}
        onClose={() => setApproveOpen(false)}
        onSuccess={() => {
          invalidateAll();
          setApproveOpen(false);
          showToast("Pendaftar disetujui");
          navigate("/lainnya/pendaftar", { replace: true });
        }}
      />

      <RejectSheet
        open={rejectOpen}
        submissionId={data.submission_id}
        noWa={data.no_wa}
        onClose={() => setRejectOpen(false)}
        onSuccess={() => {
          invalidateAll();
          setRejectOpen(false);
          showToast("Pendaftar ditolak");
        }}
      />
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Field                                    */
/* -------------------------------------------------------------------------- */

function Field({ label, value }: { label: string; value?: string }) {
  if (!value || value === "") {
    return (
      <div className="flex justify-between gap-3 py-1.5 border-b border-surface-border last:border-b-0">
        <span className="text-ios-footnote text-surface-muted flex-shrink-0">
          {label}
        </span>
        <span className="text-ios-footnote text-surface-muted italic">
          Belum diisi
        </span>
      </div>
    );
  }
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-surface-border last:border-b-0">
      <span className="text-ios-footnote text-surface-muted flex-shrink-0">
        {label}
      </span>
      <span className="text-ios-body text-surface-text text-right">
        {value}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                ApproveSheet                                */
/* -------------------------------------------------------------------------- */

function ApproveSheet({
  open,
  data,
  onClose,
  onSuccess,
}: {
  open: boolean;
  data: PendingMember;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { showToast } = useToast();
  const [kelompok, setKelompok] = useState("");

  const { data: groups = [] } = useQuery({
    queryKey: queryKeys.groups(),
    queryFn: () => groupApi.list(),
    enabled: open,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (!open) return;
    setKelompok("");
  }, [open]);

  const mutation = useMutation({
    mutationFn: () =>
      pendingApi.approve({
        submission_id: data.submission_id,
        kelompok,
      }),
    onSuccess: () => onSuccess(),
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menyetujui",
        "error",
      );
    },
  });

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title="Setujui Pendaftar">
        <div className="mb-4 p-3 rounded-xl bg-accent-soft border border-accent/15">
          <p className="text-ios-footnote text-accent/80 leading-relaxed">
            <strong>{data.nama_lengkap}</strong> akan ditambahkan sebagai jamaah
            aktif.
            {data.username && (
              <>
                {" "}
                Akun login dengan username{" "}
                <span className="font-mono font-medium">
                  {data.username}
                </span>{" "}
                akan langsung aktif.
              </>
            )}
          </p>
        </div>

        <Select
          label="Kelompok (opsional)"
          value={kelompok}
          onChange={(e) => setKelompok(e.target.value)}
          hint="Bisa diubah nanti oleh admin"
        >
          <option value="">Pilih kelompok</option>
          {groups.map((g) => (
            <option key={g.group_id} value={g.group_name}>
              {g.group_name}
            </option>
          ))}
        </Select>

        <div className="mb-4 p-3 rounded-xl bg-warning-soft/60 border border-warning/20">
          <p className="text-ios-caption text-warning leading-relaxed">
            Akun tidak dikirim otomatis. Sampaikan username &amp; password ke
            jamaah secara manual via WhatsApp atau tatap muka.
          </p>
        </div>

        <Button
          fullWidth
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          leftIcon={!mutation.isPending ? <UserPlus size={16} /> : undefined}
        >
          {mutation.isPending ? "Memproses..." : "Setujui & Aktifkan Akun"}
        </Button>
      </BottomSheet>

      <LoadingOverlay open={mutation.isPending} label="Memproses..." onCancel={() => abortAllApiCalls()} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                                RejectSheet                                 */
/* -------------------------------------------------------------------------- */

function RejectSheet({
  open,
  submissionId,
  noWa,
  onClose,
  onSuccess,
}: {
  open: boolean;
  submissionId: string;
  noWa?: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { showToast } = useToast();
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) return;
    setReason("");
  }, [open]);

  const mutation = useMutation({
    mutationFn: () =>
      pendingApi.reject({
        submission_id: submissionId,
        reason: reason || "Tidak memenuhi syarat",
      }),
    onSuccess: () => onSuccess(),
    onError: (err) => {
      showToast(
        err instanceof ApiError ? err.message : "Gagal menolak",
        "error",
      );
    },
  });

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title="Tolak Pendaftar">
        <div className="mb-4 p-3 rounded-xl bg-danger-soft border border-danger/20">
          <p className="text-ios-footnote text-danger leading-relaxed">
            Pendaftar akan ditolak dan tidak akan ditambahkan sebagai jamaah.
            Alasan tidak terkirim otomatis. Sampaikan manual kalau perlu.
          </p>
        </div>

        <Textarea
          label="Alasan Penolakan"
          placeholder="Contoh: Data tidak lengkap, tidak memenuhi syarat, dll"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <Button
          variant="danger"
          fullWidth
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          leftIcon={!mutation.isPending ? <X size={16} /> : undefined}
        >
          {mutation.isPending ? "Memproses..." : "Tolak Pendaftar"}
        </Button>
      </BottomSheet>

      <LoadingOverlay open={mutation.isPending} label="Memproses..." onCancel={() => abortAllApiCalls()} />
    </>
  );
}
