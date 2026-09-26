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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm anim-fade"
        onClick={onClose}
      />
      <div className="app-shell sheet sheet-narrow relative w-full bg-surface-card surface-shift rounded-t-[28px] md:rounded-[24px] border-t md:border border-surface-border shadow-2xl max-h-[85vh] flex flex-col anim-sheet">
        <div className="flex items-center justify-center pt-2.5 pb-2 md:hidden">
          <div className="w-9 h-[5px] rounded-full bg-surface-muted/25" />
        </div>
        {title && (
          <div className="px-5 pb-3 md:pt-5 flex items-center justify-between">
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
        <div className="px-5 pb-[calc(1.25rem+var(--safe-bottom))] md:pb-5 overflow-y-auto">
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
        className="absolute inset-0 bg-black/30 backdrop-blur-sm anim-fade"
        onClick={onClose}
      />
      <div className="app-shell modal-narrow relative w-full bg-surface-card surface-shift rounded-[28px] border border-surface-border shadow-2xl max-h-[85vh] flex flex-col anim-pop">
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
  loading?: boolean;
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
        className="absolute inset-0 bg-black/30 backdrop-blur-sm anim-fade-fast"
        onClick={loading ? undefined : onCancel}
      />
      <div className="relative w-full max-w-[300px] sm:max-w-sm bg-surface-card surface-shift rounded-[24px] border border-surface-border overflow-hidden shadow-2xl anim-pop">
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
