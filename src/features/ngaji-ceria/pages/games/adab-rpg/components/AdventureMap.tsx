import { motion } from "framer-motion";
import { NGAJI_CERIA_ASSETS } from "../../../../data/assets";

const LOCATIONS = [
  { name: "Gerbang", icon: NGAJI_CERIA_ASSETS.mapGerbang }, { name: "Masjid", icon: NGAJI_CERIA_ASSETS.buildingMasjid }, { name: "Kelas", icon: NGAJI_CERIA_ASSETS.buildingKelas },
  { name: "Asrama", icon: NGAJI_CERIA_ASSETS.buildingAsrama }, { name: "Perpus", icon: NGAJI_CERIA_ASSETS.buildingPerpus }, { name: "Lapangan", icon: NGAJI_CERIA_ASSETS.mapLapangan },
  { name: "Ruang Tamu", icon: NGAJI_CERIA_ASSETS.mapRuangTamu }, { name: "Taman", icon: NGAJI_CERIA_ASSETS.mapTaman }, { name: "Malam", icon: NGAJI_CERIA_ASSETS.mapMalam },
];

export function AdventureMap({ progress }: { progress: number }) {
  return <div className="rounded-3xl border border-violet-300/25 bg-slate-950/60 p-3"><div className="mb-2 flex items-center justify-between"><p className="text-[10px] font-black uppercase tracking-widest text-violet-300">Peta pesantren</p><p className="text-[10px] text-white/50">Quest {Math.min(progress + 1, LOCATIONS.length)}/9</p></div><div className="flex gap-1 overflow-x-auto pb-1">{LOCATIONS.map((location, index) => <div key={location.name} className="flex min-w-14 flex-col items-center gap-1"><div className="relative h-10 w-10 rounded-xl border border-white/15 bg-white/5 p-1 text-center">{index <= progress && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-2 -top-2 z-10 h-5 w-5"><img src={NGAJI_CERIA_ASSETS.avatarAnak} alt="Posisimu" draggable={false} className="h-full w-full object-contain" /></motion.span>}<img src={location.icon} alt={location.name} draggable={false} className="h-full w-full object-contain" /></div><span className={`text-[8px] font-bold ${index === progress ? "text-violet-200" : "text-white/45"}`}>{location.name}</span></div>)}</div></div>;
}
