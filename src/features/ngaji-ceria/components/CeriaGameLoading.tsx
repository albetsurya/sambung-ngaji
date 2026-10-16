import React, { useEffect, useState } from "react";
import { NGAJI_CERIA_ASSETS } from "../data/assets";

const TIPS = [
  "Awali belajar membaca Al-Qur'an dengan bacaan Ta'awudz & Basmalah.",
  "Setiap huruf Al-Qur'an bernilai 10 kebaikan di sisi Allah SWT.",
  "Dengarkan irama Rost: Datar, Naik, lalu Turun dengan tenang.",
  "Bintang dan koin tersimpan otomatis ke akun Ngaji Ceria kamu!",
  "Latih konsistensi mengaji setiap hari untuk menjaga streak.",
];

interface CeriaGameLoadingProps {
  onLoaded?: () => void;
  durationMs?: number;
  subtitle?: string;
}

export function CeriaGameLoading({
  onLoaded,
  durationMs = 1800,
  subtitle = "Memuat Petualangan Mengaji…",
}: CeriaGameLoadingProps) {
  const [progress, setProgress] = useState(12);
  const [tipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / durationMs) * 100));
      setProgress(Math.max(12, pct));

      if (pct >= 100) {
        clearInterval(interval);
        if (onLoaded) {
          setTimeout(onLoaded, 150);
        }
      }
    }, 40);

    return () => clearInterval(interval);
  }, [durationMs, onLoaded]);

  return (
    <div
      className="fixed inset-0 z-[120] bg-[#FFF8EE] flex flex-col items-center justify-between p-6 select-none font-sans overflow-hidden"
      role="status"
      aria-live="polite"
      aria-busy={progress < 100}
    >
      {/* Top Banner Asset Overlay */}
      <div
        className="absolute inset-x-0 top-0 h-24 pointer-events-none opacity-40 bg-repeat-x bg-top"
        style={{
          backgroundImage: `url(${NGAJI_CERIA_ASSETS.topBarLatar})`,
          backgroundSize: "auto 100%",
        }}
      />

      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xs z-10 space-y-5">
        {/* Animated Avatar / Icon Badge */}
        <div className="relative">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-b from-[#FFCB45] to-[#F58A3A] p-1 shadow-xl border-4 border-[#3E2518] animate-bounce">
            <div className="w-full h-full rounded-[22px] bg-[#FFF8EE] flex items-center justify-center overflow-hidden">
              <img
                src={NGAJI_CERIA_ASSETS.avatarAnak}
                alt="Santri Ceria"
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>
          <span className="absolute -bottom-2 -right-2 px-3 py-1 bg-[#2D5A27] text-white font-black text-[11px] rounded-full border-2 border-white shadow-md">
            TILAWATI
          </span>
        </div>

        <div>
          <h2 className="font-display font-black text-2xl text-[#5A3A2A] tracking-tight">
            Ngaji Ceria
          </h2>
          <p className="text-xs font-bold text-[#8C5A3A] mt-1">{subtitle}</p>
        </div>
      </div>

      {/* Bottom Progress Bar & Tips */}
      <div className="w-full max-w-sm z-10 space-y-4 pb-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3.5 border-2 border-[#E2D4C0] shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#F58A3A]">
            Tips Mengaji Hari Ini:
          </p>
          <p className="text-xs font-semibold text-[#5A3A2A] mt-1 leading-snug">
            "{TIPS[tipIndex]}"
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-black text-[#5A3A2A] px-1">
            <span>MEMUAT ASET GAME</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-4 bg-[#E2D4C0] rounded-full p-0.5 border border-[#B8A690] overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#F58A3A] to-[#FFCB45] rounded-full transition-all duration-75 shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
