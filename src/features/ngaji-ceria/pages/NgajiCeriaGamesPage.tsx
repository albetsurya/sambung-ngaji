import React from "react";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { Dice, Sparkles, ChevronRight } from "../../../components/ui/FontAwesomeIcons";

interface MiniGameCardProps {
  title: string;
  description: string;
  icon: "dice" | "sparkles";
  status: "soon" | "available";
  onClick: () => void;
}

function MiniGameCard({ title, description, icon, status, onClick }: MiniGameCardProps) {
  const bgColorClass = status === "available" ? "bg-accent-soft text-accent border-accent/30" : "bg-surface-card2 text-surface-muted border-surface-border";
  const iconBgClass = status === "available" ? "bg-accent text-white" : "bg-surface-card text-surface-muted";

  return (
    <button
      onClick={onClick}
      disabled={status === "soon"}
      className={`w-full rounded-2xl p-4 text-left transition-all active:scale-[0.98] shadow-sm flex items-center gap-4 border-2 ${bgColorClass}`}
    >
      <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md ${iconBgClass}`}>
        {icon === "dice" ? <Dice size={24} /> : <Sparkles size={24} />}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm text-surface-text">{title}</h3>
        <p className="text-xs text-surface-muted mt-0.5 leading-tight">
          {description}
        </p>
      </div>
      {status === "available" ? (
        <ChevronRight size={18} className="text-surface-muted ml-auto" />
      ) : (
        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-surface-card text-surface-muted ml-auto">
          Segera Hadir
        </span>
      )}
    </button>
  );
}

export default function NgajiCeriaGamesPage() {
  return (
    <NgajiCeriaLayout title="Mini Games" showBack>
      <div className="px-4 py-4 space-y-4">
        <p className="text-sm text-surface-muted text-center max-w-sm mx-auto mb-4">
          Asah kemampuanmu mengenal huruf hijaiyah dan tajwid lewat berbagai mini game seru!
        </p>

        <MiniGameCard
          title="Tebak Hijaiyah"
          description="Kenali dan tebak huruf hijaiyah tunggal."
          icon="sparkles"
          status="soon"
          onClick={() => alert("Game Tebak Hijaiyah (Segera hadir!)")}
        />

        <MiniGameCard
          title="Susun Kata Quran"
          description="Susun suku kata menjadi lafadz yang benar."
          icon="dice"
          status="soon"
          onClick={() => alert("Game Susun Kata Quran (Segera hadir!)")}
        />

        <MiniGameCard
          title="Match Tajwid"
          description="Cocokkan hukum tajwid dengan contohnya."
          icon="sparkles"
          status="soon"
          onClick={() => alert("Game Match Tajwid (Segera hadir!)")}
        />
      </div>
    </NgajiCeriaLayout>
  );
}
