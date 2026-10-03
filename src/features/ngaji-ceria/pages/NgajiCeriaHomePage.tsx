import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { Sparkles, Volume2, Play } from "../../../components/ui/FontAwesomeIcons";
import { TILAWATI_DATA } from "../data/tilawati";
import { useNgajiCeriaProgress } from "../hooks/useNgajiCeriaProgress";
import { useNgajiCeriaStreak } from "../hooks/useNgajiCeriaStreak";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { NGAJI_CERIA_ASSETS } from "../data/assets";

interface PathNode {
  pageNumber: number;
  title: string;
  status: "completed" | "active" | "locked";
  isCheckpoint?: boolean;
  stars?: number;
  xOffset: string;
}

export default function NgajiCeriaHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.name ? user.name.split(" ")[0] : "Santri";

  const { currentJilid, currentPage, progressPercentage } =
    useNgajiCeriaProgress(TILAWATI_DATA);

  const currentJilidObj = useMemo(() => {
    return TILAWATI_DATA.find((j) => j.id === currentJilid) || TILAWATI_DATA[0];
  }, [currentJilid]);

  const nodes: PathNode[] = useMemo(() => {
    const alignments: PathNode["xOffset"][] = [
      "self-center",
      "self-end",
      "self-center",
      "self-start",
      "self-center",
      "self-end",
      "self-center",
      "self-start",
      "self-center",
      "self-end",
    ];

    return Array.from({ length: 10 }, (_, i) => {
      const pageNum = i + 1;
      const isCp = pageNum === 5 || pageNum === 10;
      let status: PathNode["status"] = "locked";
      let stars = 0;

      if (pageNum < currentPage) {
        status = "completed";
        stars = 3;
      } else if (pageNum === currentPage) {
        status = "active";
      }

      return {
        pageNumber: pageNum,
        title: isCp ? `Evaluasi Hal 1-${pageNum}` : `Halaman ${pageNum}`,
        status,
        isCheckpoint: isCp,
        stars,
        xOffset: alignments[i % alignments.length],
      };
    });
  }, [currentPage]);

  return (
    <NgajiCeriaLayout title="Petualangan Tilawati">
      <div className="px-4 py-4 space-y-6">
        {/* Header Jilid Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/20 via-surface-card to-accent/10 border-2 border-accent/30 p-5 shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-white text-[10px] font-black uppercase tracking-wider mb-2 shadow-sm">
                <Sparkles size={11} />
                Metode Tilawati • Lagu Rost
              </div>
              <h2 className="font-display text-xl font-black text-surface-text tracking-tight">
                {currentJilidObj.nama}
              </h2>
              <p className="text-xs text-surface-muted mt-1 leading-relaxed">
                {currentJilidObj.deskripsi}
              </p>
              <p className="text-xs font-bold text-accent mt-2">
                Progress: Halaman {currentPage} dari 10 ({progressPercentage}%)
              </p>
            </div>

            {/* Jilid Cover SVG */}
            <div className="shrink-0 w-20 h-20 bg-white rounded-2xl p-1.5 shadow-md border border-accent/20 rotate-3">
              <img
                src={NGAJI_CERIA_ASSETS.jilidCovers[Number(currentJilid) || 1]}
                alt={currentJilidObj.nama}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </section>

        {/* Winding World Map Adventure Path */}
        <section className="relative px-4 py-6 bg-surface-card/60 backdrop-blur-sm rounded-3xl border-2 border-surface-border shadow-inner">
          <div className="text-center mb-6">
            <h3 className="font-black text-sm text-surface-text uppercase tracking-wider">
              Peta Alur Belajar Santri
            </h3>
            <p className="text-xs text-surface-muted mt-0.5">
              Selesaikan tiap halaman untuk membuka evaluasi jilid
            </p>
          </div>

          <div className="relative flex flex-col gap-10 items-center max-w-xs mx-auto">
            {nodes.map((node) => {
              return (
                <div
                  key={node.pageNumber}
                  className={`relative z-10 flex flex-col items-center ${node.xOffset} transition-all duration-300`}
                >
                  {/* Node Button */}
                  <button
                    disabled={node.status === "locked"}
                    onClick={() => {
                      if (node.status !== "locked") {
                        navigate("/member/ngaji-ceria/quiz");
                      }
                    }}
                    className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 ${
                      node.status === "active"
                        ? "scale-110 animate-bounce"
                        : node.status === "completed"
                        ? "hover:scale-105"
                        : "opacity-75 cursor-not-allowed"
                    }`}
                  >
                    {/* Node Visual Asset */}
                    {node.isCheckpoint ? (
                      <img
                        src={
                          node.status === "completed"
                            ? NGAJI_CERIA_ASSETS.piala
                            : NGAJI_CERIA_ASSETS.petiHarta
                        }
                        alt="Checkpoint"
                        className="w-20 h-20 drop-shadow-lg"
                      />
                    ) : node.status === "completed" ? (
                      <img
                        src={NGAJI_CERIA_ASSETS.nodeSelesai}
                        alt="Selesai"
                        className="w-20 h-20 drop-shadow-md"
                      />
                    ) : node.status === "active" ? (
                      <img
                        src={NGAJI_CERIA_ASSETS.nodeAktif}
                        alt="Aktif"
                        className="w-22 h-22 drop-shadow-xl"
                      />
                    ) : (
                      <img
                        src={NGAJI_CERIA_ASSETS.nodeTerkunci}
                        alt="Terkunci"
                        className="w-20 h-20 grayscale opacity-80"
                      />
                    )}

                    {!node.isCheckpoint && (
                      <span
                        className={`absolute font-black text-lg ${
                          node.status === "active"
                            ? "text-white drop-shadow-md"
                            : node.status === "completed"
                            ? "text-success-dark"
                            : "text-surface-muted"
                        }`}
                      >
                        {node.pageNumber}
                      </span>
                    )}
                  </button>

                  <div className="mt-2 text-center">
                    <span
                      className={`block text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${
                        node.status === "active"
                          ? "bg-accent text-white border-accent-dark font-black"
                          : node.status === "completed"
                          ? "bg-success-soft text-success border-success/30 font-extrabold"
                          : "bg-surface-card2 text-surface-muted border-surface-border"
                      }`}
                    >
                      {node.title}
                    </span>

                    {node.status === "completed" && (
                      <div className="flex justify-center gap-1 mt-1">
                        <img
                          src={NGAJI_CERIA_ASSETS.bintang}
                          className="w-3.5 h-3.5"
                          alt="Bintang"
                        />
                        <img
                          src={NGAJI_CERIA_ASSETS.bintang}
                          className="w-3.5 h-3.5"
                          alt="Bintang"
                        />
                        <img
                          src={NGAJI_CERIA_ASSETS.bintang}
                          className="w-3.5 h-3.5"
                          alt="Bintang"
                        />
                      </div>
                    )}
                  </div>

                  {node.status === "active" && (
                    <button
                      onClick={() => navigate("/member/ngaji-ceria/quiz")}
                      className="mt-3 px-5 py-2.5 rounded-2xl bg-accent text-white font-black text-xs shadow-lg shadow-accent/30 flex items-center gap-2 border-b-4 border-accent-dark active:translate-y-1 transition-all"
                    >
                      <Play size={14} />
                      <span>Mulai Halaman {node.pageNumber}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Audio Rost Melody Prompt Bar */}
        <section className="rounded-3xl bg-surface-card border-2 border-surface-border p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 shrink-0 bg-accent-soft rounded-2xl flex items-center justify-center">
            <img
              src={NGAJI_CERIA_ASSETS.mikrofonBaca}
              className="w-8 h-8"
              alt="Mikrofon"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs text-surface-text">
              Panduan Nada Rost Tilawati
            </h4>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-surface-card2 text-surface-text font-bold">
                1. Datar
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-surface-card2 text-surface-text font-bold">
                2. Naik
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-surface-card2 text-surface-text font-bold">
                3. Turun
              </span>
            </div>
          </div>
          <button
            onClick={() => alert("Memutar contoh nada Rost Tilawati")}
            className="w-11 h-11 rounded-2xl bg-accent text-white flex items-center justify-center active:scale-90 shadow-md shadow-accent/20"
            title="Dengar Irama"
          >
            <Volume2 size={20} />
          </button>
        </section>
      </div>
    </NgajiCeriaLayout>
  );
}
