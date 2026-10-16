export function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const width = Math.min(100, Math.max(8, 50 + value * 5));
  return <div><div className="mb-1 flex justify-between text-[10px] font-bold text-white/70"><span>{label}</span><span>{value}</span></div><div className="h-2 rounded-full bg-white/10"><div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${width}%` }} /></div></div>;
}
