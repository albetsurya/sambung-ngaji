import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { NGAJI_CERIA_ASSETS } from "../data/assets";
import { Lock, Star } from "../../../components/ui/FontAwesomeIcons";
import { useNgajiCeriaStore, type NgajiCeriaState } from "../hooks/useNgajiCeriaStore";
import { useJilidAccess } from "../components/GameLockGuard";
import { LoginPromptModal } from "../components/LoginPromptModal";
import { isComingSoonJilid, isJilidOpen, tierForRole } from "../data/gameAccess";
import { useAuth } from "../../../contexts/AuthContext";

interface MapNode { pageNumber: number; status: "completed" | "active" | "locked"; stars: number }

export default function NgajiCeriaMapPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [promptOpen, setPromptOpen] = useState(false);
  const { user } = useAuth();
  const tier = tierForRole(user?.role);
  const stars = useNgajiCeriaStore((state: NgajiCeriaState) => state.stars);
  const requestedJilid = Number(params.get("jilid") ?? 1);
  const jilid = requestedJilid >= 1 && requestedJilid <= 6 ? requestedJilid : 1;
  const access = useJilidAccess(jilid);

  const nodes: MapNode[] = Array.from({ length: 44 }, (_, index) => {
    const pageNumber = index + 1;
    const key = `jilid-${jilid}-hal-${pageNumber}`;
    const starCount = stars[key] || 0;
    const previousKey = `jilid-${jilid}-hal-${pageNumber - 1}`;
    const previousCompleted = pageNumber === 1 || stars[previousKey] > 0;
    return {
      pageNumber,
      stars: starCount,
      status: starCount > 0 ? "completed" : previousCompleted ? "active" : "locked",
    };
  });

  const alignments = [
    "self-center", "self-end translate-x-[-20px]", "self-center", "self-start translate-x-[20px]",
    "self-center", "self-end translate-x-[-20px]",
  ];

  return <NgajiCeriaLayout title="Jelajah Halaman">
    <div className="space-y-6 rounded-t-3xl bg-[#FFF8EE] px-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#F58A3A]">Peta Belajar</span>
          <h2 className="font-display text-lg font-black text-[#5A3A2A]">Jelajah Jilid {jilid}</h2>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-[#FFCB45] px-3 py-1 text-xs font-black text-[#5A3A2A] shadow-sm"><Star size={13} />44 Halaman</div>
      </div>

      <div className="grid grid-cols-3 gap-2" aria-label="Pilih jilid">
        {[1, 2, 3, 4, 5, 6].map((item) => {
          const itemAccess = { isComingSoon: isComingSoonJilid(item), isOpen: isJilidOpen(item, tier) };
          const selected = item === jilid;
          return <button key={item} type="button" aria-label={`Jilid ${item}`} onClick={() => {
            if (itemAccess.isComingSoon) return;
            if (!itemAccess.isOpen) { setPromptOpen(true); return; }
            navigate(`/member/ngaji-ceria/map?jilid=${item}`);
          }} className={`relative flex min-h-12 items-center justify-center gap-1 rounded-2xl border-2 text-xs font-black transition active:scale-95 ${selected ? "border-[#F58A3A] bg-[#FCE6DA] text-[#C4430E]" : "border-[#E2D4C0] bg-white text-[#8C7A68]"}`}>
            {!itemAccess.isOpen && <Lock size={12} />}Jilid {item}
            {itemAccess.isComingSoon && <span className="absolute -bottom-2 rounded-full bg-[#F58A3A] px-1.5 py-0.5 text-[8px] text-white">Segera Hadir</span>}
          </button>;
        })}
      </div>

      {!access.isOpen || access.isComingSoon ? <section className="flex min-h-[45dvh] flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-[#E2D4C0] bg-white/70 px-6 text-center">
        <span className="text-5xl">{access.isComingSoon ? "🎙️" : "🔒"}</span>
        <h3 className="font-display text-xl font-black text-[#5A3A2A]">{access.isComingSoon ? "Rekaman Audio Menyusul" : "Masuk untuk Akses Penuh"}</h3>
        <p className="max-w-xs text-sm leading-relaxed text-[#8C7A68]">{access.isComingSoon ? "Jilid 6 segera hadir. Audio latihan sedang disiapkan." : `Jilid ${jilid} terbuka untuk member. Masuk agar semua halaman belajar dapat dimainkan.`}</p>
        {!access.isLoggedIn && !access.isComingSoon && <button type="button" onClick={() => setPromptOpen(true)} className="game-button bg-[#2D5A27]">Masuk untuk Akses Penuh</button>}
      </section> : <div className="relative mx-auto flex max-w-xs flex-col gap-10 py-8">
        <div className="pointer-events-none absolute inset-y-8 left-1/2 w-1 -translate-x-1/2 border-r-4 border-dashed border-[#E2D4C0]" />
        {nodes.map((node, index) => <div key={node.pageNumber} className={`relative z-10 flex flex-col items-center ${alignments[index % alignments.length]}`}>
          {node.status === "active" && <div className="absolute -top-10 z-20 flex animate-bounce flex-col items-center"><div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-[#FFCB45] p-0.5 shadow-md"><img src={NGAJI_CERIA_ASSETS.avatarAnak} alt="Avatar" className="h-full w-full object-cover" /></div><div className="-mt-1 h-2 w-2 rotate-45 bg-[#5A3A2A]" /></div>}
          <button type="button" onClick={() => node.status === "locked" ? setPromptOpen(true) : navigate(`/member/ngaji-ceria/quiz/play?jilid=${jilid}&hal=${node.pageNumber}`)} className={`relative flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 shadow-md transition-all active:scale-95 ${node.status === "completed" ? "border-[#E29A12] bg-[#FFCB45] text-[#5A3A2A]" : node.status === "active" ? "animate-pulse border-[#C4430E] bg-[#F58A3A] text-white" : "cursor-not-allowed border-[#C8B8A2] bg-[#E2D4C0] text-[#9A8B78]"}`}>
            <span className="text-xl font-black leading-none">{node.pageNumber}</span>
            {node.status === "completed" ? <div className="mt-1 flex gap-0.5">{[1, 2, 3].map((item) => <Star key={item} size={9} className="fill-[#5A3A2A] text-[#5A3A2A]" />)}</div> : node.status === "locked" ? <span className="mt-0.5 text-[10px] font-bold">🔒 Terkunci</span> : null}
          </button>
          <div className="mt-2 text-center"><span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${node.status === "active" ? "bg-[#F58A3A] text-white" : node.status === "completed" ? "bg-[#E2EFCF] text-[#2D5A27]" : "bg-[#E2D4C0]/50 text-[#8C7A68]"}`}>Halaman {node.pageNumber}</span></div>
        </div>)}
      </div>}
      <LoginPromptModal open={promptOpen} onClose={() => setPromptOpen(false)} />
    </div>
  </NgajiCeriaLayout>;
}
