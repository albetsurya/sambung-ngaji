import React, { useState, useEffect, useRef } from "react";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { TILAWATI_JILID_1_PAGES } from "../data/tilawatiQuizData";
import { getFallbackAudioUrl } from "../utils/audioFallback";
import { Play, Pause, ChevronLeft, ChevronRight, Volume2 } from "../../../components/ui/FontAwesomeIcons";

export default function CekAudioManualPage() {
  const [jilid] = useState(1);
  const [hal, setHal] = useState(1);
  const [playingId, setPlayingId] = useState<number | string | null>(null);

  const pageData = TILAWATI_JILID_1_PAGES[hal];
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [hal]);

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
      const fallbackUrl = getFallbackAudioUrl(hal);
      if (fallbackUrl && url !== fallbackUrl) {
        playAudio(`fallback_${hal}`, fallbackUrl);
      } else {
        setPlayingId(null);
      }
    });
    audio.onended = () => {
      setPlayingId(null);
    };
  };

  const fullPageAudioUrl = getFallbackAudioUrl(hal);

  return (
    <NgajiCeriaLayout title="Cek Audio Manual" showBack>
      <div className="p-4 max-w-md mx-auto min-h-screen bg-slate-50/50">
        
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-4 bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100">
          <button 
            onClick={() => setHal(Math.max(1, hal - 1))}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-700 active:scale-95 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="text-center">
            <div className="text-[10px] font-black tracking-widest text-slate-400 uppercase">TILAWATI JILID {jilid}</div>
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
        {fullPageAudioUrl && (
          <div className="mb-4 bg-[#00923F]/10 border border-[#00923F]/20 p-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Volume2 size={18} className="text-[#00923F]" />
              <div>
                <div className="text-xs font-black text-[#00662C]">Putar Full Audio Halaman {hal}</div>
                <div className="text-[10px] text-[#00662C]/70 font-medium">Rekaman audio utuh 1 halaman</div>
              </div>
            </div>
            <button
              onClick={() => {
                if (playingId === `full_${hal}`) {
                  audioRef.current?.pause();
                  setPlayingId(null);
                } else {
                  playAudio(`full_${hal}`, fullPageAudioUrl);
                }
              }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm text-white transition-all active:scale-95 ${
                playingId === `full_${hal}` ? "bg-red-500" : "bg-[#00923F]"
              }`}
            >
              {playingId === `full_${hal}` ? <Pause size={12} /> : <Play size={12} />}
              {playingId === `full_${hal}` ? "Jeda" : "Putar Full"}
            </button>
          </div>
        )}

        {/* Content List */}
        {!pageData ? (
          <div className="text-center py-10 text-slate-400 font-bold text-sm">
            Data halaman {hal} belum tersedia.
          </div>
        ) : (
          <div className="space-y-3 pb-24">
            {pageData.questions.map((q, idx) => (
              <div 
                key={q.id} 
                className={`flex flex-col bg-white rounded-[20px] p-4 border-2 shadow-sm transition-colors ${
                  playingId === q.id ? 'border-[#00923F] bg-[#F2FDF5]' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      {idx === 0 ? 'Judul (3x Rost)' : idx === 1 ? 'Judul (Evaluasi 1x)' : idx === pageData.questions.length - 1 ? 'Baris Bawah' : `Baris ${idx-1}`}
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
        )}
      </div>
    </NgajiCeriaLayout>
  );
}
