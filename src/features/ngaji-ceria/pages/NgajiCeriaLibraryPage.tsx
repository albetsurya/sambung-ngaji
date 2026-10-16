import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { TILAWATI_DATA } from "../data/tilawati";
import { useNgajiCeriaProgress } from "../hooks/useNgajiCeriaProgress";
import { NGAJI_CERIA_ASSETS } from "../data/assets";
import { Sparkles, Check, Lock, Play } from "../../../components/ui/FontAwesomeIcons";
import { LoginPromptModal } from "../components/LoginPromptModal";
import { useJilidAccess } from "../components/GameLockGuard";
import { parseJilidNumber, tierForRole } from "../data/gameAccess";
import { useAuth } from "../../../contexts/AuthContext";

interface BookCardProps {
  stepNumber: number;
  nama: string;
  deskripsi: string;
  status: "locked" | "active" | "completed";
  currentPage: number;
  totalPages: number;
  progressPercentage: number;
  coverImg: string;
  isOffset?: boolean;
  comingSoon?: boolean;
  /** Bila terisi, kartu terkunci tetap bisa diklik (mis. membuka ajakan login). */
  onLockedTap?: () => void;
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
  isOffset = false,
  comingSoon = false,
  onLockedTap,
  onClick,
}: BookCardProps) {
  return (
    <div
      className={`flex flex-col items-center group relative transition-transform duration-300 ${
        isOffset ? "translate-y-8" : ""
      }`}
    >
      {/* 3D Standalone Book Illustration Card (Fixed 140px width & 180px height for 100% uniformity) */}
      <button
        onClick={status === "locked" && onLockedTap ? onLockedTap : onClick}
        disabled={status === "locked" && !onLockedTap}
        className={`relative w-[140px] h-[180px] transition-all duration-300 flex items-center justify-center p-1 group-hover:scale-105 active:scale-95 ${
          status === "locked"
            ? "cursor-not-allowed opacity-60 grayscale"
            : "cursor-pointer drop-shadow-xl"
        }`}
      >
        {/* SVG Book Cover Artwork */}
        <img
          src={coverImg}
          alt={nama}
          className="w-full h-full object-contain filter drop-shadow-md group-hover:drop-shadow-2xl transition-all"
        />

        {/* Status Badge Top Right */}
        <div className="absolute top-2 right-2 z-10">
          {comingSoon ? (
            <span className="rounded-full bg-[#F58A3A] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-md border-2 border-white">
              Segera Hadir
            </span>
          ) : status === "completed" ? (
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

        {/* Step Badge Top Left */}
        <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-[#5A3A2A]/90 text-[#FFCB45] font-black text-[9px] uppercase tracking-wider border border-[#FFCB45]/30 shadow-md">
          Step 0{stepNumber}
        </span>
      </button>

      {/* Book Title & Progress Underneath */}
      <div className="mt-2.5 text-center w-[140px]">
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

/** Pembungkus per-jilid yang menerapkan kebijakan akses (tamu J1–2, J6 segera hadir). */
function JilidBookEntry({ jilidId, onOpen, onLocked, ...card }: {
  jilidId: string;
  onOpen: () => void;
  onLocked: () => void;
} & Omit<BookCardProps, "onClick" | "status"> & { status: BookCardProps["status"] }) {
  const access = useJilidAccess(parseJilidNumber(jilidId));
  if (access.isComingSoon) {
    return <StandaloneBookCard {...card} status="locked" comingSoon onClick={() => {}} />;
  }
  if (!access.isOpen) {
    return <StandaloneBookCard {...card} status="locked" onLockedTap={onLocked} onClick={() => {}} />;
  }
  return <StandaloneBookCard {...card} onClick={onOpen} />;
}

export default function NgajiCeriaLibraryPage() {  const navigate = useNavigate();
  const { currentJilid, currentPage, progressPercentage } =
    useNgajiCeriaProgress(TILAWATI_DATA);
  const [promptOpen, setPromptOpen] = useState(false);
  const { user } = useAuth();
  const isGuest = tierForRole(user?.role) === "guest";

  const extraBooks = [
    {
      id: "juz-amma",
      nama: "Juz 'Amma",
      deskripsi: "Hafalan surah pendek",
      coverImg: NGAJI_CERIA_ASSETS.bukuJuzAmma,
      isNext: true,
    },
  ];

  return (
    <NgajiCeriaLayout title="Koleksi Jilid">
      <div className="px-4 py-4 space-y-6 bg-[#FFF8EE] min-h-full rounded-t-3xl pb-16">
        {/* VIP Access Banner */}
        <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-r from-[#2D5A27] to-[#1E3E1A] p-5 text-white shadow-md border-2 border-[#1E3E1A]">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E2EFCF] text-[#2D5A27] text-[10px] font-black uppercase tracking-wider mb-2 border border-[#2D5A27]/20">
                <Sparkles size={10} />
                Akses VIP Aktif
              </div>
              <h2 className="font-display text-lg font-black tracking-tight leading-tight text-white">
                {isGuest ? "Jilid 1–2 Terbuka Untukmu!" : "Bebas Akses Semua Jilid!"}
              </h2>
              <p className="text-xs text-white/80 mt-1 leading-relaxed">
                {isGuest
                  ? "Masuk untuk membuka Jilid 3–5. Pilih ilustrasi buku di bawah untuk mulai belajar."
                  : "Pilih ilustrasi buku di bawah untuk membuka lembar belajar Tilawati."}
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

        {/* 2-Column Zigzag Layout for 3D Books */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 justify-items-center py-4">
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

            // Column 2 (odd indexes in 0-based array: idx 1, 3, 5...) gets offset down for zigzag effect
            const isOffset = idx % 2 === 1;

            return (
              <JilidBookEntry
                key={jilid.id}
                jilidId={jilid.id}
                stepNumber={stepNum}
                nama={jilid.nama}
                deskripsi={jilid.deskripsi}
                status={status}
                currentPage={pageNum}
                totalPages={40}
                progressPercentage={progPercent}
                coverImg={coverImg}
                isOffset={isOffset}
                onOpen={() => navigate("/member/ngaji-ceria/map")}
                onLocked={() => setPromptOpen(true)}
              />
            );
          })}
        </div>
        <LoginPromptModal open={promptOpen} onClose={() => setPromptOpen(false)} />

        {/* Kitab Lanjutan Section */}
        <div className="pt-8 border-t-2 border-[#E2D4C0]">
          <div className="mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#F58A3A]">
              Modul Berikutnya
            </span>
            <h3 className="font-black text-base text-[#5A3A2A]">
              Hafalan Juz 'Amma
            </h3>
          </div>

          <div className="flex justify-center">
            {extraBooks.map((book) => (
              <div key={book.id} className="flex flex-col items-center text-center">
                <div className="relative">
                  <button
                    disabled
                    className="w-[120px] h-[155px] opacity-80 cursor-not-allowed drop-shadow-md"
                  >
                    <img
                      src={book.coverImg}
                      alt={book.nama}
                      className="w-full h-full object-contain filter grayscale-[30%]"
                    />
                  </button>
                  <span className="absolute top-2 right-0 px-2 py-0.5 rounded-full bg-[#F58A3A] text-white text-[9px] font-black uppercase tracking-wider shadow">
                    Segera Hadir
                  </span>
                </div>
                <h5 className="font-black text-sm text-[#5A3A2A] mt-2 leading-tight">
                  {book.nama}
                </h5>
                <span className="text-[10px] text-[#8C5A3A]">
                  {book.deskripsi}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Disclaimer Hak Cipta & Legal */}
        <div className="pt-6 pb-4 border-t border-[#E2D4C0] text-center">
          <p className="text-[10px] text-[#8C7A68] leading-relaxed max-w-xs mx-auto">
            Materi latihan disusun mandiri berdasarkan urutan pokok bahasan umum (fathah, kasrah, sukun, tajwid, ghorib). Teks Al-Qur'an dari sumber domain publik. "Tilawati" adalah merek terdaftar milik Pesantren Al-Qur'an Nurul Falah Surabaya.
          </p>
        </div>
      </div>
    </NgajiCeriaLayout>
  );
}
