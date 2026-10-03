import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { TILAWATI_DATA } from "../data/tilawati";
import { useNgajiCeriaProgress } from "../hooks/useNgajiCeriaProgress";
import { NGAJI_CERIA_ASSETS } from "../data/assets";
import { Sparkles, Check, ChevronRight, Lock } from "../../../components/ui/FontAwesomeIcons";

interface BookVolumeCardProps {
  stepNumber: number;
  id: string;
  nama: string;
  deskripsi: string;
  status: "locked" | "active" | "completed";
  currentPage: number;
  totalPages: number;
  progressPercentage: number;
  onClick: () => void;
}

const PASTEL_THEMES = [
  {
    bg: "bg-[#EFF3EC]",
    border: "border-[#C5DDB9]",
    text: "text-[#2D5A27]",
    spine: "bg-[#2D5A27]",
    badgeBg: "bg-[#E2EFCF]",
    badgeText: "text-[#2D5A27]",
    button: "bg-[#2D5A27] text-white",
  },
  {
    bg: "bg-[#EAF6FB]",
    border: "border-[#BCE3F5]",
    text: "text-[#1C5D79]",
    spine: "bg-[#1C5D79]",
    badgeBg: "bg-[#D6EEFA]",
    badgeText: "text-[#1C5D79]",
    button: "bg-[#1C5D79] text-white",
  },
  {
    bg: "bg-[#FFF6EC]",
    border: "border-[#FCDCB8]",
    text: "text-[#8C4A14]",
    spine: "bg-[#8C4A14]",
    badgeBg: "bg-[#FBE6CE]",
    badgeText: "text-[#8C4A14]",
    button: "bg-[#8C4A14] text-white",
  },
  {
    bg: "bg-[#F3F0FF]",
    border: "border-[#D7CCFF]",
    text: "text-[#553894]",
    spine: "bg-[#553894]",
    badgeBg: "bg-[#E6DEFF]",
    badgeText: "text-[#553894]",
    button: "bg-[#553894] text-white",
  },
  {
    bg: "bg-[#FFF0F3]",
    border: "border-[#FCCCD4]",
    text: "text-[#8C243B]",
    spine: "bg-[#8C243B]",
    badgeBg: "bg-[#FCDAE1]",
    badgeText: "text-[#8C243B]",
    button: "bg-[#8C243B] text-white",
  },
  {
    bg: "bg-[#E6F8F6]",
    border: "border-[#B2EBE4]",
    text: "text-[#10665C]",
    spine: "bg-[#10665C]",
    badgeBg: "bg-[#CCF2ED]",
    badgeText: "text-[#10665C]",
    button: "bg-[#10665C] text-white",
  },
];

function BookVolumeCard({
  stepNumber,
  id,
  nama,
  deskripsi,
  status,
  currentPage,
  totalPages,
  progressPercentage,
  onClick,
}: BookVolumeCardProps) {
  const theme = PASTEL_THEMES[(stepNumber - 1) % PASTEL_THEMES.length];
  const coverImg = NGAJI_CERIA_ASSETS.jilidCovers[stepNumber] || NGAJI_CERIA_ASSETS.bukuQuran;

  return (
    <button
      onClick={onClick}
      disabled={status === "locked"}
      className={`group relative w-full text-left rounded-[22px] p-3.5 border-2 ${theme.bg} ${theme.border} transition-all duration-200 shadow-sm flex flex-col justify-between min-h-[210px] overflow-hidden ${
        status === "locked" ? "opacity-75 cursor-not-allowed" : "hover:shadow-md active:scale-[0.98]"
      }`}
    >
      {/* Book Spine Simulation Effect */}
      <div className={`absolute top-0 left-0 bottom-0 w-2.5 ${theme.spine} opacity-90 rounded-l-[20px]`} />

      {/* Top Header Label */}
      <div className="pl-2 flex items-center justify-between gap-1 w-full z-10">
        <span className={`text-[10px] font-black uppercase tracking-wider ${theme.text}`}>
          Langkah 0{stepNumber}
        </span>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText} flex items-center gap-1`}>
          {status === "completed" ? (
            <>
              <Check size={10} /> Selesai
            </>
          ) : status === "active" ? (
            "Aktif"
          ) : (
            <>
              <Lock size={9} /> Terkunci
            </>
          )}
        </span>
      </div>

      {/* Book Center Illustration & Titles */}
      <div className="pl-2 my-2 flex items-start gap-3 z-10">
        <div className="shrink-0 w-14 h-18 rounded-xl bg-white/80 p-1 shadow-sm border border-black/5 rotate-[-2deg] group-hover:rotate-0 transition-transform">
          <img
            src={coverImg}
            alt={nama}
            className={`w-full h-full object-contain ${status === "locked" ? "grayscale opacity-60" : ""}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-display font-black text-base leading-tight ${theme.text}`}>
            {nama}
          </h4>
          <p className="text-[11px] text-surface-muted/90 line-clamp-2 mt-1 leading-snug">
            {deskripsi}
          </p>
        </div>
      </div>

      {/* Bottom Progress & Action Button */}
      <div className="pl-2 z-10 w-full mt-1">
        <div className="flex items-center justify-between text-[10px] font-extrabold mb-1">
          <span className="flex items-center gap-1 text-warning">
            <img src={NGAJI_CERIA_ASSETS.bintang} className="w-3.5 h-3.5" alt="Star" />
            <span className="text-surface-text">
              {status === "completed" ? totalPages : currentPage}/{totalPages}
            </span>
          </span>
          <span className={theme.text}>
            {status === "completed" ? "100%" : `${progressPercentage}%`}
          </span>
        </div>

        {/* Progress bar line */}
        <div className="w-full bg-white/60 rounded-full h-1.5 overflow-hidden border border-black/5 mb-2">
          <div
            className={`h-full rounded-full transition-all duration-300 ${theme.spine}`}
            style={{
              width: `${status === "completed" ? 100 : progressPercentage}%`,
            }}
          />
        </div>

        <div className="flex justify-end">
          <div
            className={`w-7 h-7 rounded-full ${theme.button} flex items-center justify-center shadow-sm text-xs font-bold`}
          >
            <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </button>
  );
}

export default function NgajiCeriaPathPage() {
  const navigate = useNavigate();
  const { currentJilid, currentPage, progressPercentage } =
    useNgajiCeriaProgress(TILAWATI_DATA);

  return (
    <NgajiCeriaLayout title="Koleksi Jilid">
      <div className="px-4 py-4 space-y-5">
        {/* Hero Green VIP Banner (Matching reference image) */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2E5D4B] to-[#1E4335] p-5 text-white shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3B725D] text-warning text-[10px] font-black uppercase tracking-wider mb-2">
                <Sparkles size={10} />
                Akses Bebas Aktif
              </div>
              <h2 className="font-display text-lg font-black tracking-tight leading-tight">
                Semua Buku Bebas Diakses!
              </h2>
              <p className="text-xs text-white/80 mt-1 leading-relaxed">
                Pilih buku Tilawati mana saja yang ingin kamu pelajari hari ini.
              </p>
            </div>

            {/* VIP Crown Icon Illustration */}
            <div className="shrink-0 w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm p-2 flex items-center justify-center border border-white/20 rotate-3">
              <img
                src={NGAJI_CERIA_ASSETS.mahkotaVip}
                alt="VIP"
                className="w-12 h-12 object-contain"
              />
            </div>
          </div>
        </section>

        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-warning">
              Koleksi Belajarmu
            </span>
            <h3 className="font-black text-sm text-surface-text">
              Enam Langkah Pintar
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-accent-soft text-accent border border-accent/20 flex items-center gap-1">
            Bebas Akses
          </span>
        </div>

        {/* 2-Column Book Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {TILAWATI_DATA.map((jilid, idx) => {
            const stepNum = idx + 1;
            let status: BookVolumeCardProps["status"] = "locked";
            let pageNum = 0;
            let progPercent = 0;

            if (jilid.id === currentJilid) {
              status = "active";
              pageNum = currentPage;
              progPercent = progressPercentage;
            } else if (
              TILAWATI_DATA.findIndex((j) => j.id === jilid.id) <
              TILAWATI_DATA.findIndex((j) => j.id === currentJilid)
            ) {
              status = "completed";
              pageNum = 10;
              progPercent = 100;
            } else {
              // Unlock for exploration
              status = "active";
              pageNum = 1;
              progPercent = 0;
            }

            return (
              <BookVolumeCard
                key={jilid.id}
                stepNumber={stepNum}
                id={jilid.id}
                nama={jilid.nama}
                deskripsi={jilid.deskripsi}
                status={status}
                currentPage={pageNum}
                totalPages={10}
                progressPercentage={progPercent}
                onClick={() => navigate("/member/ngaji-ceria")}
              />
            );
          })}
        </div>
      </div>
    </NgajiCeriaLayout>
  );
}