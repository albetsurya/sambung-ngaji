import { ModalPanel } from "../../_shared/ModalPanel";
import { formatIdleNumber } from "../data/buildings";

export function OfflineModal({ gain, onClose }: { gain: number; onClose: () => void }) {
  if (!gain) return null;
  return <ModalPanel title="Pesantren tetap berjalan"><p className="mt-2 text-sm text-white/75">Saat kamu pergi, kegiatan pesantren menghasilkan</p><p className="my-5 font-display text-4xl font-black text-pink-300">+{formatIdleNumber(gain)} santri</p><button type="button" onClick={onClose} className="game-button w-full bg-pink-500">Lanjut</button></ModalPanel>;
}
