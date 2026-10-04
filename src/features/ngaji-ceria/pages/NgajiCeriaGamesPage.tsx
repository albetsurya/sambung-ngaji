import React from "react";
import { useNavigate } from "react-router-dom";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { NGAJI_CERIA_ASSETS } from "../data/assets";
import { Star, Play } from "../../../components/ui/FontAwesomeIcons";

interface GameTheme {
  cardBg: string;
  cardBorder: string;
  titleColor: string;
  buttonBg: string;
}

const GAME_THEMES: Record<string, GameTheme> = {
  blue: {
    cardBg: "bg-[#EAF6FB]",
    cardBorder: "border-[#BCE3F5]",
    titleColor: "text-[#1C5D79]",
    buttonBg: "bg-[#1C5D79]",
  },
  peach: {
    cardBg: "bg-[#FFF3E4]",
    cardBorder: "border-[#FCDCB8]",
    titleColor: "text-[#8C4A14]",
    buttonBg: "bg-[#8C4A14]",
  },
  lavender: {
    cardBg: "bg-[#F1EDFF]",
    cardBorder: "border-[#D7CCFF]",
    titleColor: "text-[#553894]",
    buttonBg: "bg-[#553894]",
  },
};

interface MiniGameCardProps {
  title: string;
  description: string;
  cover: string;
  best: number;
  theme: GameTheme;
  onClick: () => void;
}

function MiniGameCard({ title, description, cover, best, theme, onClick }: MiniGameCardProps) {
  return (
    <div
      className={`w-full rounded-[22px] p-4 border-2 ${theme.cardBg} ${theme.cardBorder} shadow-sm flex flex-col gap-3`}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-20 h-20 rounded-2xl bg-white/80 border border-black/5 p-2 shadow-sm">
          <img src={cover} alt={title} className="w-full h-full object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-display font-black text-base leading-tight ${theme.titleColor}`}>
            {title}
          </h3>
          <p className="text-[11px] text-[#5A3A2A]/70 mt-1 leading-snug">
            {description}
          </p>
          <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-black px-2.5 py-1 rounded-full bg-[#FFCB45] text-[#5A3A2A] border border-[#B8590C]/20">
            <Star size={11} />
            Terbaik: {best}
          </span>
        </div>
      </div>
      <button
        onClick={onClick}
        className={`w-full py-3 rounded-2xl ${theme.buttonBg} text-white font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-md`}
      >
        <Play size={15} />
        Main Sekarang
      </button>
    </div>
  );
}

export default function NgajiCeriaGamesPage() {
  const navigate = useNavigate();
  return (
    <NgajiCeriaLayout title="Mini Games" showBack>
      <div className="px-4 py-4 space-y-4 bg-[#FBF8F1] min-h-full rounded-t-3xl">
        <p className="text-[12px] text-[#5A3A2A]/70 text-center max-w-sm mx-auto">
          Asah kemampuan mengenal huruf hijaiyah dan tajwid lewat game seru asli Ngaji Ceria.
        </p>

        <MiniGameCard
          title="Balon Hijaiyah"
          description="Pecahkan balon huruf yang benar sebelum waktu habis."
          cover={NGAJI_CERIA_ASSETS.qirraPop}
          best={1200}
          theme={GAME_THEMES.blue}
          onClick={() => navigate("/member/ngaji-ceria/games/balon-hijaiyah")}
        />

        <MiniGameCard
          title="Pasang Huruf"
          description="Cocokkan pasangan kartu huruf hijaiyah Arab dan Latin yang sama."
          cover={NGAJI_CERIA_ASSETS.qirraMatch}
          best={850}
          theme={GAME_THEMES.peach}
          onClick={() => navigate("/member/ngaji-ceria/games/pasang-huruf")}
        />

        <MiniGameCard
          title="Tebak Ayat"
          description="Tebak nama surah dari potongan ayat Juz Amma beserta artinya."
          cover={NGAJI_CERIA_ASSETS.tebakSurahBaru}
          best={640}
          theme={GAME_THEMES.lavender}
          onClick={() => navigate("/member/ngaji-ceria/games/tebak-ayat")}
        />

        <MiniGameCard
          title="Tangkap Harakat"
          description="Gerakkan huruf untuk menangkap harakat yang diminta!"
          cover={NGAJI_CERIA_ASSETS.tangkapHarakat}
          best={500}
          theme={GAME_THEMES.blue}
          onClick={() => navigate("/member/ngaji-ceria/games/tangkap-harakat")}
        />
      </div>
    </NgajiCeriaLayout>
  );
}
