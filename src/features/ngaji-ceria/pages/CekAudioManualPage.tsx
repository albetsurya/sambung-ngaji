import React, { useState, useEffect, useRef } from "react";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { TILAWATI_JILID_1_PAGES, TILAWATI_JILID_2_PAGES } from "../data/tilawatiQuizData";
import { getFallbackAudioUrl } from "../utils/audioFallback";
import { Play, Pause, ChevronLeft, ChevronRight, Volume2 } from "../../../components/ui/FontAwesomeIcons";

export default function CekAudioManualPage() {
  const [jilid, setJilid] = useState(1);
  const [hal, setHal] = useState(1);
  const [playingId, setPlayingId] = useState<number | string | null>(null);

  // Check if current page is kelipatan 6 (Latihan-latihan bacaan)
  const isKelipatanEnam = hal % 6 === 0;

  // Page dataset based on active jilid
  const pageData = jilid === 1 ? TILAWATI_JILID_1_PAGES[hal] : jilid === 2 ? TILAWATI_JILID_2_PAGES[hal] : null;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [jilid, hal]);

  const playAudio = (id: number | string, url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingId(id);
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch((e) => {
      console.warn("Direct slice play failed, trying fallback full page audio...", e);
      // Fallback to page full audio if specific segment is missing
      const fallbackUrl = getFallbackAudioUrl(jilid, hal);
      if (fallbackUrl && url !== fallbackUrl) {
        playAudio(`fallback_${jilid}_${hal}`, fallbackUrl);
      } else {
        setPlayingId(null);
      }
    });
    audio.onended = () => {
      setPlayingId(null);
    };
  };

  const fullPageAudioUrl = getFallbackAudioUrl(jilid, hal);

  return (
    <NgajiCeriaLayout title="Cek Audio Manual" showBack>
      <div className="p-4 max-w-md mx-auto min-h-screen bg-slate-50/50">
        
        {/* Jilid Selector Tabs (1 to 6) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 scrollbar-none">
          {[1, 2, 3, 4, 5, 6].map((j) => (
            <button
              key={j}
              onClick={() => {
                setJilid(j);
                setHal(1);
                if (audioRef.current) audioRef.current.pause();
                setPlayingId(null);
              }}
              className={`flex-1 min-w-[54px] py-2 rounded-xl font-black text-xs transition-all active:scale-95 text-center ${
                jilid === j
                  ? "bg-[#00923F] text-white shadow-md shadow-[#00923F]/20 scale-100"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Jilid {j}
            </button>
          ))}
        </div>

        {/* Header Controls */}
        <div className="flex items-center justify-between mb-4 bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100">
          <button 
            onClick={() => setHal(Math.max(1, hal - 1))}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-700 active:scale-95 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="text-center">
            <div className="text-[10px] font-black tracking-widest text-[#00923F] uppercase">TILAWATI JILID {jilid}</div>
            <div className="font-black text-xl text-slate-800">Halaman {hal}</div>
          </div>
          <button 
            onClick={() => setHal(Math.min(44, hal + 1))}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-700 active:scale-95 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Full Page Audio Player Shortcut */}
        {fullPageAudioUrl ? (
          <div className="mb-4 bg-[#00923F]/10 border border-[#00923F]/20 p-3.5 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <Volume2 size={20} className="text-[#00923F]" />
              <div>
                <div className="text-xs font-black text-[#00662C]">Audio Master Halaman {hal}</div>
                <div className="text-[10px] text-[#00662C]/70 font-medium">Rekaman Tilawati Jilid {jilid}</div>
              </div>
            </div>
            <button
              onClick={() => {
                if (playingId === `full_${jilid}_${hal}`) {
                  audioRef.current?.pause();
                  setPlayingId(null);
                } else {
                  playAudio(`full_${jilid}_${hal}`, fullPageAudioUrl);
                }
              }}
              className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md text-white transition-all active:scale-95 ${
                playingId === `full_${jilid}_${hal}` ? "bg-red-500" : "bg-[#00923F]"
              }`}
            >
              {playingId === `full_${jilid}_${hal}` ? <Pause size={13} /> : <Play size={13} />}
              {playingId === `full_${jilid}_${hal}` ? "Jeda" : "Putar Audio"}
            </button>
          </div>
        ) : (
          <div className="mb-4 bg-amber-50 border border-amber-200 p-3 rounded-2xl text-center text-xs font-bold text-amber-700">
            Audio utuh Halaman {hal} sedang diproses
          </div>
        )}

        {/* Content List */}
        {pageData ? (
          <div className="space-y-3 pb-24">
            {pageData.questions.filter((_: any, idx: number) => !(isKelipatanEnam && idx === 0)).map((q: any, idx: number) => (
              <div 
                key={q.id} 
                className={`flex flex-col bg-white rounded-[20px] p-4 border-2 shadow-sm transition-colors ${
                  playingId === q.id ? 'border-[#00923F] bg-[#F2FDF5]' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      {isKelipatanEnam
                        ? idx === pageData.questions.length - 2
                          ? 'Baris Bawah'
                          : `Baris ${idx + 1}`
                        : idx === 0
                        ? 'Judul (3x Rost)'
                        : idx === 1
                        ? 'Judul (Evaluasi 1x)'
                        : idx === pageData.questions.length - 1
                        ? 'Baris Bawah'
                        : `Baris ${idx - 1}`}
                    </div>
                    <div className="font-arabic text-3xl mb-1 leading-normal text-right pr-2 text-slate-800">
                      {q.arabic}
                    </div>
                    <div className="text-xs font-bold text-slate-500">
                      [{q.transliterationParts.join(" - ")}]
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (playingId === q.id) {
                        audioRef.current?.pause();
                        setPlayingId(null);
                      } else {
                        playAudio(q.id, q.audioUrl);
                      }
                    }}
                    className={`shrink-0 w-11 h-11 flex items-center justify-center rounded-full text-white active:scale-90 transition-transform ${
                      playingId === q.id ? 'bg-red-500 shadow-md' : 'bg-[#00923F] shadow-md shadow-[#00923F]/20'
                    }`}
                  >
                    {playingId === q.id ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="font-mono text-slate-400 truncate pr-4 max-w-[200px]" title={q.audioUrl}>
                    {q.audioUrl.split('/').pop()}
                  </span>
                  <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {q.hintTone.includes("3x") ? "3x Rost" : "1x"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center shadow-sm pb-10">
            <div className="w-12 h-12 rounded-full bg-[#00923F]/10 text-[#00923F] flex items-center justify-center mx-auto mb-3 font-black text-lg">
              {jilid}
            </div>
            <h3 className="font-black text-base text-slate-800 mb-1">
              Tilawati Jilid {jilid} - Halaman {hal}
            </h3>
            <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto">
              Audio rekaman master per halaman siap diputar melalui tombol di atas untuk audit dan verifikasi makhraj & irama.
            </p>
            {fullPageAudioUrl && (
              <button
                onClick={() => playAudio(`full_${jilid}_${hal}`, fullPageAudioUrl)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00923F] text-white font-black text-xs shadow-md shadow-[#00923F]/20 active:scale-95 transition-all"
              >
                <Play size={14} />
                Putar Audio Rekaman Jilid {jilid} Hal {hal}
              </button>
            )}
          </div>
        )}
      </div>
    </NgajiCeriaLayout>
  );
}
