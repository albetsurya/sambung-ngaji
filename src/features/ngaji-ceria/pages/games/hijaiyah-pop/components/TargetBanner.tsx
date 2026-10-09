export function TargetBanner({ target, name }: { target: string; name: string }) {
  return <div className="flex items-center justify-center gap-3 rounded-2xl border border-cyan-300/30 bg-cyan-500/10 px-3 py-2"><span className="text-xs text-cyan-100/80">Tap huruf</span><span dir="rtl" className="game-arabic text-3xl text-cyan-200">{target}</span><span className="text-xs font-bold text-cyan-300">{name}</span></div>;
}
