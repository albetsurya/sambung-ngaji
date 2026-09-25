import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { Button, EmptyState } from "../components/common";
import { MemberSelfSkeleton } from "../components/common/Skeleton";
import { memberApi } from "../services/memberApi";
import { usePermission } from "../hooks/usePermission";
import { useAuth } from "../contexts/AuthContext";
import { ApiError } from "../services/api";
import { queryKeys } from "../lib/queryClient";
import {
  canViewTaarufCv,
  isTaarufEligible,
} from "../lib/taarufAccess";
import { TaarufCvEditor } from "../components/taaruf/TaarufCvSheet";

/**
 * Halaman cetak CV Taaruf tersendiri (pengganti sheet).
 * Pratinjau WYSIWYG + sesuaikan + unduh PDF/Gambar.
 */
export default function TaarufCvPrintPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = usePermission();
  const { user } = useAuth();

  const {
    data: member,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.memberDetail(id || ""),
    queryFn: () => memberApi.detail(id!),
    enabled: !!id,
    staleTime: 60_000,
  });

  const allowed =
    !!member &&
    isTaarufEligible(member) &&
    canViewTaarufCv(role, user?.member_id, member.member_id);

  return (
    <AppLayout hideNav>
      <Header
        title="CV Taaruf"
        subtitle={member ? member.nama_lengkap : undefined}
        onBack={() => {
          if (window.history.length > 1) navigate(-1);
          else navigate(`/jamaah/${id}`, { replace: true });
        }}
        backLabel="Kembali"
        showSyncButton={false}
      />

      <div className="px-4 py-4 pb-8">
        {isLoading ? (
          <MemberSelfSkeleton />
        ) : error || !member ? (
          <EmptyState
            title="Data tidak ditemukan"
            description={
              error instanceof ApiError
                ? error.message
                : "Data jamaah tidak ditemukan"
            }
            action={<Button onClick={() => refetch()}>Coba Lagi</Button>}
          />
        ) : !allowed ? (
          <EmptyState
            title="Tidak berhak"
            description="CV Taaruf hanya untuk jamaah kategori Pra Nikah dan hanya bisa dibuka pengelola atau pemilik akun."
          />
        ) : (
          <TaarufCvEditor member={member} />
        )}
      </div>
    </AppLayout>
  );
}
