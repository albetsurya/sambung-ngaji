import { NGAJI_CERIA_ASSETS } from "../../../../data/assets";
import type { BalloonData } from "../hooks/useBalloonGame";
const COVERS = [NGAJI_CERIA_ASSETS.balonBiru, NGAJI_CERIA_ASSETS.balonMerah, NGAJI_CERIA_ASSETS.balonKuning];

export function Balloon({ balloon, disabled, onPop }: { balloon: BalloonData; disabled: boolean; onPop: () => void }) {
  return <button data-balloon-letter={balloon.letter} data-balloon-target={balloon.isTarget} aria-label={`Balon ${balloon.letter}`} onPointerDown={(event) => { if (event.pointerType !== "mouse" || event.button === 0) { event.preventDefault(); onPop(); } }} onClick={(event) => { if (event.detail === 0) onPop(); }} disabled={disabled || balloon.popped} className="absolute left-0 top-0 h-24 w-16 touch-none select-none" style={{ transform: `translate3d(${balloon.x}px, ${balloon.y}px, 0) scale(${balloon.popped ? 1 + balloon.popAge * 3 : 1})`, opacity: balloon.popped ? 1 - balloon.popAge * 5 : 1, willChange: "transform" }}>
    {balloon.popped ? <img src={NGAJI_CERIA_ASSETS.popBalon} alt="" aria-hidden="true" draggable={false} className="h-full w-full object-contain" /> : <><img src={COVERS[balloon.color]} alt="" draggable={false} className="h-full w-full object-contain drop-shadow-lg" /><span className="game-arabic absolute inset-x-0 top-3 text-center text-3xl font-bold text-slate-950">{balloon.letter}</span></>}
  </button>;
}
