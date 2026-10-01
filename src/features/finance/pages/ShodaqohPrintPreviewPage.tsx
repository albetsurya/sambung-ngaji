import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  financeApi,
  type DueMember,
  type DuePayment,
  type DuesDataResponse,
} from "../api/financeApi";
import { formatRp } from "../../../utils/format";
import { useToast } from "../../../contexts/ToastContext";
import { usePermission } from "../../../hooks/usePermission";
import { AppLayout, Header } from "../../../components/layout/AppLayout";
import { UnifiedPrintPreview } from "../components/UnifiedPrintPreview";
import { ShodaqohPrintContent } from "../components/ShodaqohPrintContent";
import { ApiError } from "../../../services/api";

export const ShodaqohPrintPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { assignedGroup, isSuperAdmin } = usePermission();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [data, setData] = useState<DuesDataResponse | null>(null);
  const [yearlyMembers, setYearlyMembers] = useState<DueMember[]>([]);
  const [yearlyPayments, setYearlyPayments] = useState<DuePayment[]>([]);
  const [yearlyLoading, setYearlyLoading] = useState(false);

  const selectedMonth = searchParams.get("bulan") || "";
  const printVariant =
    (searchParams.get("variant") as "shodaqoh" | "infak-ir") || "shodaqoh";

  const loadData = async () => {
    if (!assignedGroup) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await financeApi.getShodaqohData(
        assignedGroup,
        selectedMonth,
      );
      setData(res);
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
  }, [assignedGroup, selectedMonth]);

  // Muat sekali per kelompok untuk tabel 12 bulan
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

  const membersList = data?.members || [];
  const paymentsList = data?.payments || [];
  const dashboard = data?.dashboard;

  const payments =
    printVariant === "infak-ir"
      ? paymentsList.filter((p) => Number(p.carryover_ir) > 0)
      : paymentsList;
  const periodLabel =
    printVariant === "infak-ir" ? `${selectedMonth} (Infak IR)` : selectedMonth;

  const monthLabel = selectedMonth
    ? new Date(
        Number(selectedMonth.slice(0, 4)),
        Number(selectedMonth.slice(5, 7)) - 1,
        1,
      ).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
    : "";

  if (!assignedGroup) {
    return (
      <AppLayout>
        <Header
          title="Shodaqoh & Infaq"
          subtitle={monthLabel}
          onBack={() => navigate("/finance/monthly-dues")}
          backLabel="Shodaqoh"
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
        title="Shodaqoh & Infaq"
        subtitle={monthLabel}
        onBack={() => navigate("/finance/monthly-dues")}
        backLabel="Shodaqoh"
        showSyncButton={false}
      />
      <div className="py-4">
        {loadError && !data ? (
          <div className="px-4">
            <div className="rounded-2xl border border-surface-border bg-surface-card p-4">
              <p className="text-ios-caption text-surface-muted">
                Gagal memuat data
              </p>
              <p className="text-ios-body text-danger mt-1">{loadError}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-accent text-white rounded-xl text-ios-body font-semibold"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        ) : (
          <UnifiedPrintPreview
            onClose={() => navigate("/finance/monthly-dues")}
            filename={`Matriks-Shodaqoh-${periodLabel}`}
            className="max-w-[297mm] min-h-[210mm] text-xs leading-tight"
          >
            <ShodaqohPrintContent
              members={yearlyMembers.length > 0 ? yearlyMembers : membersList}
              payments={
                printVariant === "infak-ir"
                  ? (yearlyPayments.length > 0
                      ? yearlyPayments
                      : paymentsList
                    ).filter((p) => Number(p.carryover_ir) > 0)
                  : yearlyPayments.length > 0
                    ? yearlyPayments
                    : paymentsList
              }
              periodLabel={periodLabel}
              variant={printVariant}
            />
          </UnifiedPrintPreview>
        )}
      </div>
    </AppLayout>
  );
};

export default ShodaqohPrintPreviewPage;
