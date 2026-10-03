import React from "react";
import { useNavigate } from "react-router-dom";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { TILAWATI_DATA } from "../data/tilawati";
import { useNgajiCeriaProgress } from "../hooks/useNgajiCeriaProgress";
import { NGAJI_CERIA_ASSETS } from "../data/assets";
import { Sparkles, Check, Lock, Play } from "../../../components/ui/FontAwesomeIcons";

interface BookCardProps {
  stepNumber: number;
  nama: string;
  deskripsi: string;
  status: "locked" | "active" | "completed";
  currentPage: number;
  totalPages: number;
  progressPercentage: number;
  coverImg: string;
  onClick: () => void;
}

function StandaloneBookCard({
  stepNumber,
  nama,
  deskripsi,
  status,
  currentPage,
  totalPages,
  progressPercentage,
  coverImg,
  onClick,
}: BookCardProps) {
  return (
    <div className="flex flex-col items-center group relative">
      {/* Interactive 3D Book Cover as Card */}
      <button
        onClick={onClick}
        disabled={status === "locked"}
        className={`relative w-full aspect-[3/4] max-w-[170px] transition-all duration-300 flex items-center justify-center p-2 group-hover:scale-105 active:scale-95 ${
          status === "locked" ? "cursor-not-allowed opacity-65 grayscale" : "cursor-pointer drop-shadow-xl"
        }`}
      >
        {/* SVG Book Illustration itself as the Card */}
        <img
          src={coverImg}
          alt={nama}
          className="w-full h-full object-contain filter drop-shadow-md group-hover:drop-shadow-2xl transition-all"
        />

        {/* Floating Overlay Badge on Top Right of Book */}
        <div className="absolute top-3 right-3 z-10">
          {status === "completed" ? (
            <span className="w-7 h-7 rounded-full bg-[#2D5A27] text-white flex items-center justify-center shadow-md border-2 border-white text-xs">
              <Check size={14} />
            </span>
          ) : status === "active" ? (
            <span className="w-7 h-7 rounded-full bg-[#F58A3A] text-white flex items-center justify-center shadow-md border-2 border-white animate-bounce">
              <Play size={12} className="ml-0.5 fill-white" />
            </span>
          ) : (
            <span className="w-7 h-7 rounded-full bg-[#5A3A2A]/80 text-white flex items-center justify-center shadow-md border-2 border-white/60 text-xs">
              <Lock size={12} />
            </span>
          )}
        </div>

        {/* Step Badge floating on Top Left */}
        <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full bg-[#5A3A2A]/90 text-[#FFCB45] font-black text-[9px] uppercase tracking-wider border border-[#FFCB45]/30 shadow-md">
          Step 0{stepNumber}
        </span>
      </button>

      {/* Book Metadata & Progress directly under the book */}
      <div className="mt-2.5 text-center w-full max-w-[170px]">
        <h4 className="font-display font-black text-sm text-[#5A3A2A] leading-tight">
          {nama}
        </h4>
        <p className="text-[11px] text-[#8C5A3A] line-clamp-1 mt-0.5">
          {deskripsi}
        </p>

        {/* Star Rating & Progress Bar */}
        <div className="mt-1.5 flex flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <img src={NGAJI_CERIA_ASSETS.bintang} className="w-3.5 h-3.5" alt="Star" />
            <span className="text-[10px] font-black text-[#5A3A2A]">
              {status === "completed" ? totalPages : currentPage}/{totalPages} Hal
            </span>
          </div>

          <div className="w-full bg-[#E2D4C0] rounded-full h-1.5 overflow-hidden border border-[#C8B8A2]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                status === "completed"
                  ? "bg-[#2D5A27]"
                  : status === "active"
                  ? "bg-[#F58A3A]"
                  : "bg-[#8C7A68]"
              }`}
              style={{
                width: `${status === "completed" ? 100 : progressPercentage}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NgajiCeriaLibraryPage() {
  const navigate = useNavigate();
  const { currentJilid, currentPage, progressPercentage } =
    useNgajiCeriaProgress(TILAWATI_DATA);

  const extraBooks = [
    {
      id: "ghorib",
      nama: "Tilawati Ghorib",
      deskripsi: "Bacaan asing dan musykilat",
      coverImg: NGAJI_CERIA_ASSETS.bukuGhorib,
    },
    {
      id: "tajwid",
      nama: "Tilawati Tajwid",
      deskripsi: "Hukum nun mati dan mad",
      coverImg: NGAJI_CERIA_ASSETS.bukuTajwid,
    },
    {
      id: "juz-amma",
      nama: "Juz 'Amma",
      deskripsi: "Hafalan surah-surah pendek",
      coverImg: NGAJI_CERIA_ASSETS.bukuJuzAmma,
    },
  ];

  return (
    <NgajiCeriaLayout title="Koleksi Jilid">
      <div className="px-4 py-4 space-y-6 bg-[#FFF8EE] min-h-full rounded-t-3xl">
        {/* VIP Access Banner */}
        <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-r from-[#2D5A27] to-[#1E3E1A] p-5 text-white shadow-md border-2 border-[#1E3E1A]">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E2EFCF] text-[#2D5A27] text-[10px] font-black uppercase tracking-wider mb-2 border border-[#2D5A27]/20">
                <Sparkles size={10} />
                Akses VIP Aktif
              </div>
              <h2 className="font-display text-lg font-black tracking-tight leading-tight text-white">
                Bebas Akses Semua Jilid!
              </h2>
              <p className="text-xs text-white/80 mt-1 leading-relaxed">
                Pilih ilustrasi buku di bawah untuk membuka lembar belajar Tilawati.
              </p>
            </div>

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
            <span className="text-[10px] font-black uppercase tracking-widest text-[#F58A3A]">
              Rak Buku Tilawati
            </span>
            <h3 className="font-black text-base text-[#5A3A2A]">
              Jilid 1 Sampai 6
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E2EFCF] text-[#2D5A27] border border-[#2D5A27]/20">
            6 Langkah Pintar
          </span>
        </div>

        {/* Grid of Standalone 3D Book Cover Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 justify-items-center py-2">
          {TILAWATI_DATA.map((jilid, idx) => {
            const stepNum = idx + 1;
            let status: BookCardProps["status"] = "locked";
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
              pageNum = 40;
              progPercent = 100;
            } else {
              status = "active";
              pageNum = 1;
              progPercent = 0;
            }

            const coverImg =
              NGAJI_CERIA_ASSETS.jilidCovers[stepNum] || NGAJI_CERIA_ASSETS.bukuQuran;

            return (
              <StandaloneBookCard
                key={jilid.id}
                stepNumber={stepNum}
                nama={jilid.nama}
                deskripsi={jilid.deskripsi}
                status={status}
                currentPage={pageNum}
                totalPages={40}
                progressPercentage={progPercent}
                coverImg={coverImg}
                onClick={() => navigate("/member/ngaji-ceria/map")}
              />
            );
          })}
        </div>

        {/* Pengayaan Books Section */}
        <div className="pt-4 border-t border-[#E2D4C0]">
          <div className="mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#F58A3A]">
              Kitab Lanjutan
            </span>
            <h3 className="font-black text-base text-[#5A3A2A]">
              Ghorib, Tajwid & Juz 'Amma
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-4 justify-items-center">
            {extraBooks.map((book, idx) => (
              <div key={book.id} className="flex flex-col items-center text-center">
                <button
                  onClick={() => alert(`Membuka ${book.nama}`)}
                  className="w-full aspect-[3/4] max-w-[120px] transition-transform hover:scale-105 active:scale-95 drop-shadow-md"
                >
                  <img
                    src={book.coverImg}
                    alt={book.nama}
                    className="w-full h-full object-contain"
                  />
                </button>
                <h5 className="font-black text-xs text-[#5A3A2A] mt-2 leading-tight">
                  {book.nama}
                </h5>
                <span className="text-[9px] text-[#8C5A3A] line-clamp-1">
                  {book.deskripsi}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </NgajiCeriaLayout>
  );
}
