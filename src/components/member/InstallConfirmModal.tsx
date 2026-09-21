import { Download, Check } from "../common/FontAwesomeIcons";
import { Modal, Button } from "../common";

const BENEFITS = [
  "Buka lebih cepat, tanpa browser",
  "Tampil di layar utama seperti aplikasi biasa",
  "Bisa dipakai offline sebagian",
  "Ringan, hemat kuota",
];

/**
 * Modal konfirmasi sebelum trigger native PWA install prompt.
 * Muncul saat user klik tombol "Install" di InstallAppCard.
 */
export function InstallConfirmModal({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Install Sambung Ngaji?">
      <div className="mb-4 flex items-center gap-3">
        <span className="w-11 h-11 rounded-2xl bg-accent-soft text-accent flex items-center justify-center flex-shrink-0">
          <Download size={18} strokeWidth={2.2} />
        </span>
        <div className="min-w-0">
          <p className="text-ios-body font-medium text-surface-text">
            Pasang di perangkat ini
          </p>
          <p className="text-ios-caption text-surface-muted">
            Akses Sambung Ngaji langsung dari layar utama
          </p>
        </div>
      </div>

      <ul className="space-y-2 mb-5">
        {BENEFITS.map((b) => (
          <li key={b} className="flex items-start gap-2.5">
            <span className="w-4 h-4 rounded-full bg-accent-soft text-accent flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check size={10} strokeWidth={3} />
            </span>
            <span className="text-ios-footnote text-surface-text leading-relaxed">
              {b}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>
          Nanti
        </Button>
        <Button
          fullWidth
          onClick={onConfirm}
          disabled={loading}
          leftIcon={!loading ? <Download size={14} /> : undefined}
        >
          {loading ? "Memproses..." : "Install"}
        </Button>
      </div>
    </Modal>
  );
}
