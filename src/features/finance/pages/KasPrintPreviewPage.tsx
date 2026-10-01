import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { financeApi, type Transaction } from "../api/financeApi";
import { formatRp } from "../../../utils/format";
import { useToast } from "../../../contexts/ToastContext";
import { usePermission } from "../../../hooks/usePermission";
import { AppLayout, Header } from "../../../components/layout/AppLayout";
import { UnifiedPrintPreview } from "../components/UnifiedPrintPreview";
import { KasPrintContent } from "../components/KasPrintContent";
import { ApiError } from "../../../services/api";

export const KasPrintPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { cashType } = useParams<{ cashType: string }>();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { assignedGroup, isSuperAdmin } = usePermission();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [initialBalance, setInitialBalance] = useState(0);
  const [endingBalance, setEndingBalance] = useState(0);

  const month = searchParams.get("bulan") || "";
  const mode = (searchParams.get("mode") as "rincian" | "rekap") || "rincian";

  const loadData = async () => {
    if (!assignedGroup) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await financeApi.getKasTransactions(
        assignedGroup,
        cashType as "main" | "amil",
      );
      const transactions = res.transactions || [];
      setTransactions(transactions);
      // Cari saldo awal dan akhir dari data
      const saldoAwalTx = transactions.find(
        (t) =>
          String(t.account_name || "")
            .trim()
            .toUpperCase() === "SALDO AWAL",
      );
      setInitialBalance(
        Number(saldoAwalTx?.balance) || Number(saldoAwalTx?.debit) || 0,
      );
      setEndingBalance(res.ending_balance || 0);
    } catch (err: any) {
      const msg =
        err instanceof ApiError ? err.message : "Gagal memuat data kas";
      setLoadError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [assignedGroup, cashType]);

  const cashTypeLabel = cashType === "amil" ? "Kas Amil" : "Kas Utama";
  const monthLabel = month
    ? new Date(
        Number(month.slice(0, 4)),
        Number(month.slice(5, 7)) - 1,
        1,
      ).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
    : "Semua Periode";

  if (!assignedGroup) {
    return (
      <AppLayout>
        <Header
          title={cashType === "amil" ? "Kas Amil" : "Kas Utama"}
          subtitle={monthLabel}
          onBack={() => navigate("/finance/ledger")}
          backLabel="Kas"
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
        title={cashType === "amil" ? "Kas Amil" : "Kas Utama"}
        subtitle={monthLabel}
        onBack={() => navigate(`/finance/ledger?cashType=${cashType}`)}
        backLabel="Kas"
        showSyncButton={false}
      />
      <div className="py-4">
        {loadError && !transactions.length ? (
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
            onClose={() => navigate(`/finance/ledger?cashType=${cashType}`)}
            filename={`${cashType === "amil" ? "Kas-Amil" : "Kas-Utama"}-${monthLabel}`}
            className="max-w-[210mm] text-sm leading-relaxed"
          >
            <KasPrintContent
              transactions={transactions}
              initial_balance={initialBalance}
              ending_balance={endingBalance}
              period_label={monthLabel}
              cash_type_label={cashType === "amil" ? "Kas Amil" : "Kas Utama"}
              mode={mode}
            />
          </UnifiedPrintPreview>
        )}
      </div>
    </AppLayout>
  );
};

export default KasPrintPreviewPage;
