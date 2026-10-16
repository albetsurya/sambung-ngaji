import { ModalPanel } from "./ModalPanel";
import { ACCENTS, type GameAccent } from "./types";

export function PauseOverlay({ visible, onResume, onExit, accent = "pink" }: { visible: boolean; onResume: () => void; onExit: () => void; accent?: GameAccent }) {
  if (!visible) return null;
  return <ModalPanel title="Lagi Jeda">
    <p className="mb-5 mt-2 text-sm text-white/70">Ambil napas dulu. Waktu dan permainan berhenti di sini.</p>
    <button onClick={onResume} className={`game-button w-full ${ACCENTS[accent].button}`}>Lanjut</button>
    <button onClick={onExit} className="game-button mt-2 w-full border border-white/20 bg-white/5">Keluar</button>
  </ModalPanel>;
}
