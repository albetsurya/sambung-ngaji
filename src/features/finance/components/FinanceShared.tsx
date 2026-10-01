import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/States";
import { Printer, RefreshCw, SlidersHorizontal } from "../../../components/ui/FontAwesomeIcons";

/* ------------------------------------------------------------------ */
/* SectionTitle: satu pola judul section di semua modul finance.       */
/* Standar: px-4 mb-2.5 + mt-5 kecuali section pertama (first).        */
/* ------------------------------------------------------------------ */
export function SectionTitle({
  children,
  first = false,
  className = "",
  testId,
}: {
  children: ReactNode;
  first?: boolean;
  className?: string;
  testId?: string;
}) {
  return (
    <p
      data-testid={testId}
      className={`px-4 mb-2.5 ${first ? "" : "mt-5 "}text-[11px] font-semibold uppercase tracking-[0.08em] text-surface-muted ${className}`}
    >
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* StatusPill: satu warna per makna, dipakai Kas/Shodaqoh/Zakat.       */
/* success=LUNAS/Tuntas/Surplus, warning=SEBAGIAN/Proses,               */
/* muted=BELUM/Nonaktif, danger=REVERSED/Defisit, accent=info netral.   */
/* ------------------------------------------------------------------ */
const PILL_TONES: Record<string, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  muted: "bg-surface-card2 text-surface-muted",
  danger: "bg-danger-soft text-danger",
  accent: "bg-accent-soft text-accent",
};

export function StatusPill({
  tone = "muted",
  children,
  className = "",
  testId,
}: {
  tone?: keyof typeof PILL_TONES;
  children: ReactNode;
  className?: string;
  testId?: string;
}) {
  return (
    <span
      data-testid={testId}
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${PILL_TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* HeaderActions: wrapper kanan header yang konsisten (sync/filter/     */
/* print). Ikon-ikon memakai Button ghost xs iconOnly yang sama.        */
/* ------------------------------------------------------------------ */
export function HeaderActions({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-1">{children}</div>;
}

export function HeaderIconButton({
  children,
  onClick,
  label,
  disabled,
  testId,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  disabled?: boolean;
  testId?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="xs"
      iconOnly
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      data-testid={testId}
    >
      {children}
    </Button>
  );
}

export function SyncHeaderButton({
  syncing,
  onSync,
}: {
  syncing: boolean;
  onSync: () => void;
}) {
  return (
    <HeaderIconButton
      onClick={onSync}
      disabled={syncing}
      label="Sync dari spreadsheet"
    >
      <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
    </HeaderIconButton>
  );
}

export function PrintHeaderButton({ onClick }: { onClick: () => void }) {
  return (
    <HeaderIconButton onClick={onClick} label="Cetak laporan">
      <Printer size={16} />
    </HeaderIconButton>
  );
}

export function FilterHeaderButton({
  onClick,
  active = false,
  testId = "btn-open-shodaqoh-filter",
  badgeTestId = "shodaqoh-filter-badge",
}: {
  onClick: () => void;
  active?: boolean;
  testId?: string;
  badgeTestId?: string;
}) {
  return (
    <span className="relative">
      <HeaderIconButton onClick={onClick} label="Filter" testId={testId}>
        <SlidersHorizontal size={16} />
      </HeaderIconButton>
      {active && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center"
          data-testid={badgeTestId}
        >
          {"•"}
        </span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* NoGroupEmpty: satu copy "Pilih 1 kelompok dulu" untuk semua modul.   */
/* Teks deskripsi per modul dipertahankan, ikon + aksi opsional.        */
/* ------------------------------------------------------------------ */
const NO_GROUP_DESC: Record<string, string> = {
  kas: "Modul kas bersifat per-kelompok agar tidak tercampur. Pilih kelompok untuk melanjutkan.",
  shodaqoh:
    "Modul shodaqoh bersifat per-kelompok agar tidak tercampur. Pilih kelompok untuk melanjutkan.",
  zakat:
    "Modul zakat bersifat per-kelompok agar tidak tercampur. Pilih kelompok untuk melanjutkan.",
};

export function NoGroupEmpty({
  module,
  icon,
  isSuperAdmin,
}: {
  module: "kas" | "shodaqoh" | "zakat";
  icon: ReactNode;
  isSuperAdmin: boolean;
}) {
  const navigate = useNavigate();
  return (
    <EmptyState
      title="Pilih 1 kelompok dulu"
      description={
        isSuperAdmin
          ? (NO_GROUP_DESC[module] ??
            "Modul keuangan bersifat per-kelompok agar tidak tercampur. Pilih kelompok untuk melanjutkan.")
          : "Akun Anda belum dipetakan ke kelompok. Hubungi admin."
      }
      icon={icon}
      action={
        isSuperAdmin ? (
          <Button size="sm" onClick={() => navigate("/kelompok-saya")}>
            Pilih Kelompok
          </Button>
        ) : undefined
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* SheetFooter: footer form BottomSheet yang konsisten (Batal/Simpan).  */
/* ------------------------------------------------------------------ */
export function SheetFooter({
  onCancel,
  cancelLabel = "Batal",
  submitLabel = "Simpan",
  saving = false,
  savingLabel = "Menyimpan…",
  cancelTestId,
  submitTestId,
}: {
  onCancel: () => void;
  cancelLabel?: string;
  submitLabel?: string;
  saving?: boolean;
  savingLabel?: string;
  cancelTestId?: string;
  submitTestId?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <Button
        type="button"
        variant="secondary"
        onClick={onCancel}
        data-testid={cancelTestId}
      >
        {cancelLabel}
      </Button>
      <Button type="submit" disabled={saving} data-testid={submitTestId}>
        {saving ? savingLabel : submitLabel}
      </Button>
    </div>
  );
}
