import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { financeApi, type Transaction } from "../api/financeApi";
import { groupApi } from "../../../services/domainApi";
import { formatRp } from "../../../utils/format";
import { useToast } from "../../../contexts/ToastContext";
import { usePermission } from "../../../hooks/usePermission";
import { AppLayout, Header } from "../../../components/layout/AppLayout";
import { UnifiedPrintPreview } from "../components/UnifiedPrintPreview";
import { KasPrintContent } from "../components/KasPrintContent";
import { ApiError } from "../../../services/api";

export const KasPrintPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { assignedGroup, isSuperAdmin } = usePermission();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [initialBalance, setInitialBalance] = useState(0);
  const [endingBalance, setEndingBalance] = useState(0);
  const [groupName, setGroupName] = useState("");

  const month = searchParams.get("bulan") || "";
  const mode = (searchParams.get("mode") as "rincian" | "rekap") || "rincian";
  const cashType = searchParams.get("cash") === "amil" ? "amil" : "main";
  const backTarget = searchParams.get("back") || "/finance/ledger";

  const loadData = async () => {
    if (!assignedGroup) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await financeApi.getKasTransactions(assignedGroup, cashType);
      const all = res.transactions || [];
      const scoped = month
        ? all.filter((t) => (t.transaction_date || "").slice(0, 7) === month)
        : all;
      setTransactions(scoped);
      // Cari saldo awal dan akhir dari data
      const saldoAwalTx = scoped.find(
        (t) =>
          String(t.account_name || "")
            .trim()
            .toUpperCase() === "SALDO AWAL",
      );
      setInitialBalance(
        Number(saldoAwalTx?.balance) || Number(saldoAwalTx?.debit) || 0,
      );
      const lastScoped = scoped[scoped.length - 1];
      setEndingBalance(
        Number(lastScoped?.balance) || res.ending_balance || 0,
      );
      try {
        const groups = await groupApi.list();
        const g = (groups || []).find(
          (x: any) => x.group_id === assignedGroup,
        );
        setGroupName(g?.group_name || "");
      } catch {
        /* abaikan: header kelompok boleh kosong */
      }
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
  }, [assignedGroup, cashType, month]);

  const cashTypeLabel = cashType === "amil" ? "Kas Amil" : "Kas Utama";
  const monthLabel = month
    ? new Date(
        Number(month.slice(0, 4)),
        Number(month.slice(5, 7)) - 1,
        1,
      ).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
    : "Semua Periode";
  const reportLabel = mode === "rekap" ? "Cetak per kategori" : "Cetak per transaksi";

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
        onBack={() => navigate(backTarget)}
        backLabel="Kembali"
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
            key={mode}
            onClose={() => navigate(backTarget)}
            filename={`${reportLabel} - ${cashTypeLabel} - ${monthLabel}`}
            className="max-w-[210mm] text-sm leading-relaxed"
            defaultOrientation="portrait"
            defaultFontSize={mode === "rekap" ? "11" : "7"}
          >
            <KasPrintContent
              transactions={transactions}
              initial_balance={initialBalance}
              ending_balance={endingBalance}
              period_label={monthLabel}
              cash_type_label={cashType === "amil" ? "Kas Amil" : "Kas Utama"}
              mode={mode}
              group_name={groupName}
              month_key={month}
            />
          </UnifiedPrintPreview>
        )}
      </div>
    </AppLayout>
  );
};

export default KasPrintPreviewPage;
