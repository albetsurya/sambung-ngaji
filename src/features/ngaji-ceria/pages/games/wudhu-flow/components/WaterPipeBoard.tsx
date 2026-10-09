import { NGAJI_CERIA_ASSETS } from "../../../../data/assets";
import { PIPE_CONNECTIONS, PIPE_ROUTE } from "../data/pipes";
import type { WudhuStep } from "../data/steps";

export function WaterPipeBoard({ steps, rotations, wet, disabled, onRotate }: { steps: WudhuStep[]; rotations: number[]; wet: number; disabled: boolean; onRotate: (index: number) => void }) {
  return <div aria-label="Puzzle pipa wudhu" className="grid grid-cols-4 gap-1 rounded-3xl border border-cyan-300/30 bg-cyan-950/70 p-2">
    {Array.from({ length: 12 }, (_, cell) => {
      const index = PIPE_ROUTE.indexOf(cell);
      if (index < 0) return <div key={cell} className="flex items-center justify-center gap-1 rounded-xl bg-black/20 p-1 text-xs text-cyan-100">{cell === 10 ? <><img src={NGAJI_CERIA_ASSETS.benderaCheckpoint} alt="Air sampai" draggable={false} className="h-7 w-7 object-contain" /><span>Air</span></> : <img src={NGAJI_CERIA_ASSETS.obstacleSemak} alt="" aria-hidden="true" draggable={false} className="h-7 w-7 object-contain opacity-70" />}</div>;
      const ports = PIPE_CONNECTIONS[index].map((port) => (port + rotations[index]) % 4);
      const color = index < wet ? "#22d3ee" : "#64748b";
      return <button key={cell} type="button" aria-label={`Putar pipa ${index + 1}: ${steps[index].name}`} disabled={disabled} onClick={() => onRotate(index)} className="min-h-20 rounded-xl border border-white/15 bg-slate-950/60 p-1 focus-visible:outline focus-visible:outline-cyan-200">
        <svg viewBox="0 0 60 60" className="mx-auto h-10 w-10" aria-hidden="true">{ports.map((port) => <path key={port} d={["M30 30V0", "M30 30H60", "M30 30V60", "M30 30H0"][port]} stroke={color} strokeWidth="10" fill="none" />)}<circle cx="30" cy="30" r="9" fill={color} /><text x="30" y="34" fill="#fff" textAnchor="middle" fontSize="10">{index + 1}</text></svg>
        <span className="block text-[9px] leading-tight text-white">{steps[index].name}</span>
      </button>;
    })}
  </div>;
}
