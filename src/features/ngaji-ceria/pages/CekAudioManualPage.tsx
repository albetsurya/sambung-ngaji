import React, { useState, useEffect, useRef } from "react";
import { NgajiCeriaLayout } from "../components/NgajiCeriaLayout";
import { TILAWATI_JILID_1_PAGES } from "../data/tilawatiQuizData";
import { Play, Pause, ChevronLeft, ChevronRight } from "../../../components/ui/FontAwesomeIcons";

export default function CekAudioManualPage() {
  const [jilid] = useState(1);
  const [hal, setHal] = useState(1);
  const [playingId, setPlayingId] = useState<number | null>(null);

  const pageData = TILAWATI_JILID_1_PAGES[hal];
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const playAudio = (id: number, url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingId(id);
    audio.play().catch(e => console.error("Error playing audio", e));
    audio.onended = () => {
      setPlayingId(null);
    };
  };

  return (
    <NgajiCeriaLayout title="Cek Audio Manual" showBack>
      <div className="p-4 max-w-md mx-auto min-h-screen bg-slate-50/50">
        
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
          <button 
            onClick={() => setHal(Math.max(1, hal - 1))}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-700 active:scale-95"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="text-center">
            <div className="text-xs font-bold text-slate-400">JILID {jilid}</div>
            <div className="font-black text-lg text-slate-800">Halaman {hal}</div>
          </div>
          <button 
            onClick={() => setHal(Math.min(44, hal + 1))}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-700 active:scale-95"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Content List */}
        {!pageData ? (
          <div className="text-center py-10 text-slate-400 font-bold text-sm">
            Data halaman {hal} belum tersedia.
          </div>
        ) : (
          <div className="space-y-3 pb-20">
            {pageData.questions.map((q, idx) => (
              <div 
                key={q.id} 
                className={`flex flex-col bg-white rounded-[20px] p-4 border-2 shadow-sm transition-colors ${playingId === q.id ? 'border-[#00923F] bg-[#F2FDF5]' : 'border-slate-100'}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      {idx === 0 ? 'Judul (3x Rost)' : idx === 1 ? 'Judul (Evaluasi 1x)' : idx === pageData.questions.length - 1 ? 'Baris Bawah' : `Baris ${idx-1}`}
                    </div>
                    <div className="font-arabic text-3xl mb-1 leading-normal text-right pr-2">
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
                    className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-full text-white active:scale-90 transition-transform ${playingId === q.id ? 'bg-red-500 shadow-md' : 'bg-[#00923F] shadow-lg shadow-[#00923F]/20'}`}
                  >
                    {playingId === q.id ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="font-medium text-slate-400 truncate pr-4" title={q.audioUrl}>
                    {q.audioUrl.split('/').pop()}
                  </span>
                  <span className="font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
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
