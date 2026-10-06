import React from "react";
import { useNavigate } from "react-router-dom";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { NGAJI_CERIA_ASSETS } from "../data/assets";
import { ChevronLeft, Play, Sparkles, Star } from "../../../components/ui/FontAwesomeIcons";

import { useNgajiCeriaStore, NgajiCeriaState } from "../hooks/useNgajiCeriaStore";

interface MapNode {
  pageNumber: number;
  status: "completed" | "active" | "locked";
  stars: number;
}

export default function NgajiCeriaMapPage() {
  const navigate = useNavigate();
  const stars = useNgajiCeriaStore((state: NgajiCeriaState) => state.stars);
  const jilid = 1; // Default jilid untuk sekarang

  const nodes: MapNode[] = Array.from({ length: 44 }).map((_, i) => {
    const pageNum = i + 1;
    const key = `jilid-${jilid}-hal-${pageNum}`;
    const starCount = stars[key] || 0;
    
    // Status logic: 
    // - completed jika stars > 0
    // - active jika page belum selesai tapi page sebelumnya sudah selesai atau page 1
    // - locked jika page sebelumnya belum selesai
    const prevKey = `jilid-${jilid}-hal-${pageNum - 1}`;
    const isPrevCompleted = pageNum === 1 || stars[prevKey] > 0;
    
    let status: "completed" | "active" | "locked" = "locked";
    if (starCount > 0) status = "completed";
    else if (isPrevCompleted) status = "active";
    
    return { pageNumber: pageNum, status, stars: starCount };
  });

  // Alignments for S-Curve feel
  const alignments = [
    "self-center",
    "self-end translate-x-[-20px]",
    "self-center",
    "self-start translate-x-[20px]",
    "self-center",
    "self-end translate-x-[-20px]",
  ];

  return (
    <NgajiCeriaLayout title="Jelajah Halaman">
      <div className="px-4 py-4 space-y-6 bg-[#FFF8EE] min-h-full rounded-t-3xl">
        {/* Header Title Bar */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-warning">
              Jilid 1
            </span>
            <h2 className="font-display font-black text-lg text-[#5A3A2A]">
              Jelajah Halaman Belajar
            </h2>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFCB45] text-[#5A3A2A] font-black text-xs shadow-sm">
            <Star size={13} className="fill-[#5A3A2A]" />
            <span>44 Halaman</span>
          </div>
        </div>

        {/* Winding Map Path */}
        <div className="relative py-8 flex flex-col gap-10 max-w-xs mx-auto">
          {/* Dashed Line Connection */}
          <div className="absolute inset-y-8 left-1/2 -translate-x-1/2 w-1 border-r-4 border-dashed border-[#E2D4C0] pointer-events-none" />

          {nodes.map((node, index) => {
            const alignClass = alignments[index % alignments.length];

            return (
              <div
                key={node.pageNumber}
                className={`relative z-10 flex flex-col items-center ${alignClass}`}
              >
                {/* Avatar Marker for Active Node */}
                {node.status === "active" && (
                  <div className="absolute -top-10 z-20 flex flex-col items-center animate-bounce">
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-[#FFCB45] shadow-md p-0.5 overflow-hidden">
                      <img
                        src={NGAJI_CERIA_ASSETS.avatarAnak}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-2 h-2 bg-[#5A3A2A] rotate-45 -mt-1" />
                  </div>
                )}

                {/* Node Circle Button */}
                <button
                  disabled={node.status === "locked"}
                  onClick={() => navigate(`/member/ngaji-ceria/quiz/play?hal=${node.pageNumber}`)}
                  className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 shadow-md transition-all active:scale-95 ${
                    node.status === "completed"
                      ? "bg-[#FFCB45] border-[#E29A12] text-[#5A3A2A]"
                      : node.status === "active"
                      ? "bg-[#F58A3A] border-[#C4430E] text-white animate-pulse"
                      : "bg-[#E2D4C0] border-[#C8B8A2] text-[#9A8B78] cursor-not-allowed"
                  }`}
                >
                  <span className="font-black text-xl leading-none">
                    {node.pageNumber}
                  </span>

                  {/* Stars under node */}
                  {node.status === "completed" && (
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          size={9}
                          className="fill-[#5A3A2A] text-[#5A3A2A]"
                        />
                      ))}
                    </div>
                  )}

                  {node.status === "locked" && (
                    <span className="text-[10px] font-bold mt-0.5">Terkunci</span>
                  )}
                </button>

                {/* Status Pill Label */}
                <div className="mt-2 text-center">
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      node.status === "active"
                        ? "bg-[#F58A3A] text-white"
                        : node.status === "completed"
                        ? "bg-[#E2EFCF] text-[#2D5A27]"
                        : "bg-[#E2D4C0]/50 text-[#8C7A68]"
                    }`}
                  >
                    Halaman {node.pageNumber}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </NgajiCeriaLayout>
  );
}
