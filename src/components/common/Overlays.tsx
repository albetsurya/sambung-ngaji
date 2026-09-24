import { X, Loader2 } from "./FontAwesomeIcons";
import { Button } from "./Button";
import type { ReactNode } from "react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: SheetProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />
      <div className="app-shell sheet relative w-full bg-surface-card rounded-t-[28px] border-t border-surface-border shadow-2xl max-h-[85vh] flex flex-col animate-[sheetIn_0.32s_cubic-bezier(0.32,0.72,0,1)]">
        <div className="flex items-center justify-center pt-2.5 pb-2">
          <div className="w-9 h-[5px] rounded-full bg-surface-muted/25" />
        </div>
        {title && (
          <div className="px-5 pb-3 flex items-center justify-between">
            <h3 className="text-ios-nav font-semibold text-surface-text">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-card2 text-surface-muted transition-colors hover:bg-surface-card2/70 active:scale-95"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="px-5 pb-[calc(1.25rem+var(--safe-bottom))] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Modal({ open, onClose, title, children }: SheetProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />
      <div className="app-shell relative w-full bg-surface-card rounded-[28px] border border-surface-border shadow-2xl max-h-[85vh] flex flex-col animate-[popIn_0.2s_ease-out]">
        {title && (
          <div className="px-5 pt-5 pb-2 flex items-center justify-between">
            <h3 className="text-ios-nav font-semibold text-surface-text">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-card2 text-surface-muted transition-colors hover:bg-surface-card2/70 active:scale-95"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="px-5 pb-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean; // ← TAMBAH
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Ya, lanjutkan",
  danger,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-10">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
        onClick={loading ? undefined : onCancel}
      />
      <div className="relative w-full max-w-[300px] bg-surface-card rounded-[24px] border border-surface-border overflow-hidden shadow-2xl animate-[popIn_0.2s_ease-out]">
        <div className="px-5 pt-5 pb-4 text-center">
          <h3 className="text-[17px] font-semibold text-surface-text tracking-[-0.01em]">
            {title}
          </h3>
          {description && (
            <p className="text-ios-footnote text-surface-muted mt-1.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        <div className="flex gap-2.5 px-4 pb-4">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border border-surface-border"
          >
            Batal
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={15} className="animate-spin" />
                Memproses...
              </span>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
