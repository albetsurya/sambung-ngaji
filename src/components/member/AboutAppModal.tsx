import { Modal } from "../common";
import {
  Landmark,
  Users,
  CalendarCheck,
  Heart,
  Sparkles,
} from "../common/FontAwesomeIcons";

interface AboutAppModalProps {
  open: boolean;
  onClose: () => void;
}

export function AboutAppModal({ open, onClose }: AboutAppModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Tentang Aplikasi">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-20 h-20 rounded-3xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30 mb-4">
          <Landmark size={40} className="text-white" />
        </div>
        <h3 className="text-[20px] font-bold text-surface-text mb-1 tracking-[-0.02em]">
          Manajemen Pengajian
        </h3>
        <p className="text-ios-footnote text-surface-muted">Versi 1.0.0</p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="rounded-2xl bg-accent-soft/60 p-4">
          <p className="text-ios-body text-surface-text leading-relaxed">
            Aplikasi untuk membantu pengelolaan pengajian: biodata jamaah,
            absensi, monitoring pembinaan, dan pengumuman.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center text-accent flex-shrink-0">
              <Users size={15} />
            </div>
            <div>
              <p className="text-ios-body font-medium text-surface-text">
                Manajemen Jamaah
              </p>
              <p className="text-ios-caption text-surface-muted">
                Kelola biodata jamaah dengan mudah
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center text-accent flex-shrink-0">
              <CalendarCheck size={15} />
            </div>
            <div>
              <p className="text-ios-body font-medium text-surface-text">
                Absensi Pengajian
              </p>
              <p className="text-ios-caption text-surface-muted">
                Pencatatan kehadiran yang cepat
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center text-accent flex-shrink-0">
              <Heart size={15} />
            </div>
            <div>
              <p className="text-ios-body font-medium text-surface-text">
                Monitoring Pembinaan
              </p>
              <p className="text-ios-caption text-surface-muted">
                Pantau perkembangan jamaah
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center text-accent flex-shrink-0">
              <Sparkles size={15} />
            </div>
            <div>
              <p className="text-ios-body font-medium text-surface-text">
                Asisten AI
              </p>
              <p className="text-ios-caption text-surface-muted">
                Tanya data pribadi via chat
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-surface-border text-center">
        <p className="text-ios-caption text-surface-muted">
          Dibuat dengan ❤️ untuk pengurus Latukan
        </p>
      </div>
    </Modal>
  );
}
