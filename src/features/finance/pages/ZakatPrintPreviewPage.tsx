import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { financeApi, type ZakatItem } from "../api/financeApi";
import { useToast } from "../../../contexts/ToastContext";
import { usePermission } from "../../../hooks/usePermission";
import { AppLayout, Header } from "../../../components/layout/AppLayout";
import { UnifiedPrintPreview } from "../components/UnifiedPrintPreview";
import { ZakatPrintContent } from "../components/ZakatPrintContent";
import { ApiError } from "../../../services/api";
export const ZakatPrintPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { assignedGroup } = usePermission();
  const [data, setData] = useState<ZakatItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const mode = (searchParams.get("mode") as "kwitansi" | "rekap") || "kwitansi";
  const detailPath = id ? `/finance/zakat/${id}` : "/finance/zakat";
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(detailPath, { replace: true });
  };
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
      showToast(
        err instanceof ApiError ? err.message : "Gagal memuat detail zakat",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [assignedGroup, id]);
  if (!assignedGroup) {
    return (
      <AppLayout>
        <Header
          title="Detail Zakat"
          subtitle="Memuat…"
          onBack={goBack}
          backLabel="Zakat"
          showSyncButton={false}
        />
        <div className="py-4">
          <div className="px-4">
            <div className="rounded-2xl border border-surface-border bg-surface-card p-4">
              <p className="text-ios-caption text-surface-muted">
                Pilih 1 kelompok dulu
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      <Header
        title={data?.title || "Detail Zakat"}
        subtitle={
          data
            ? `${
                (data.categories || [])
                  .map((c) =>
                    c === "MAL"
                      ? "Zakat Mal"
                      : c === "FITRAH"
                        ? "Zakat Fitrah"
                        : c,
                  )
                  .join(" + ") || "Belum ada tipe"
              } · ${data.status === "COMPLETED" ? "Tuntas" : "Proses"}`
            : "Memuat…"
        }
        onBack={goBack}
        backLabel="Zakat"
        showSyncButton={false}
      />
      <div className="py-4">
        {loadError || !data ? (
          <div className="px-4">
            <div className="rounded-2xl border border-surface-border bg-surface-card p-4">
              <p className="text-ios-caption text-surface-muted">
                Gagal memuat data
              </p>
              <p className="text-ios-body text-danger mt-1">
                {loadError || "Data tidak ditemukan"}
              </p>
              <button
                onClick={load}
                className="mt-3 px-4 py-2 bg-accent text-white rounded-xl text-ios-body font-semibold"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        ) : (
          <UnifiedPrintPreview
            onClose={goBack}
            filename={`Kwitansi-Zakat-${
              data?.title || data?.categories?.join("-") || "zakat"
            }`}
            className="max-w-[210mm] leading-relaxed"
          >
            <ZakatPrintContent zakat={data} mode={mode} />
          </UnifiedPrintPreview>
        )}
      </div>
    </AppLayout>
  );
};
export default ZakatPrintPreviewPage;
