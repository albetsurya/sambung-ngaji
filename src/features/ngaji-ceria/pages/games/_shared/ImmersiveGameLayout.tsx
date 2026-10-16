import { useEffect, type ReactNode } from "react";
import { Pause, Volume2, VolumeX, X } from "@/components/ui/FontAwesomeIcons";
import { NgajiCeriaLayout } from "../../../components/NgajiCeriaLayout";
import { PauseOverlay } from "./PauseOverlay";
import { useGameAudio } from "./audio";
import { useGameExit } from "./hooks";
import { ACCENTS, type GameAccent, type GamePhase } from "./types";
import "./games.css";
import { soundManager, type BgmTrack } from "../../../services/soundManager";
import { useTilawatiAudio, type TilawatiAudioRequest } from "../../../services/tilawatiAudio";

/**
 * Pembungkus imersif untuk semua game: memenuhi viewport (100dvh) tanpa
 * scroll halaman, bottom nav tersembunyi, header minimal mengambang berisi
 * keluar/pause/mute. Progress/HP/waktu/skor ditampilkan tiap game via HUD.
 */
export function ImmersiveGameLayout({ title, phase, onPause, onResume, accent, children, fitViewport = false, recitation, recitationKey }: {
  title: string;
  phase: GamePhase;
  onPause: () => void;
  onResume: () => void;
  accent: GameAccent;
  children: ReactNode;
  fitViewport?: boolean;
  recitation?: TilawatiAudioRequest;
  recitationKey?: string;
}) {
  const exit = useGameExit();
  const { muted, toggle } = useGameAudio();
  const audio = useTilawatiAudio(recitation ?? { jilid: 1, pageNumber: 1, questionIndex: 2, audioUrl: "/audio/tilawati/jilid_1/hal1/hal1_isi_01.ogg" });
  useEffect(() => {
    if (phase === "playing" && recitation && !muted) void audio.play();
    else audio.stop();
    return () => audio.stop();
  }, [phase, audio.play, audio.stop, Boolean(recitation), recitationKey, muted]);
  useEffect(() => {
    const track: BgmTrack = title.toLowerCase().includes("battle") || title.toLowerCase().includes("dungeon") ? "battle" : "quiz";
    soundManager.playBgm(track, 0.18);
    return () => soundManager.stopBgm();
  }, [title]);
  useEffect(() => {
    soundManager.preload(["tap", "correct", "wrong", "streak", "victory", "defeat"]);
    const handleTap = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest("button:not(:disabled), [role='button']:not([aria-disabled='true'])")) soundManager.playSfx("tap", 0.55);
    };
    document.addEventListener("pointerdown", handleTap, { passive: true });
    return () => document.removeEventListener("pointerdown", handleTap);
  }, []);
  useEffect(() => {
    const handleVisibility = () => { if (document.hidden && phase === "playing") onPause(); };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { if (phase === "playing") onPause(); else if (phase === "paused") onResume(); }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("visibilitychange", handleVisibility); document.removeEventListener("keydown", handleKey); };
  }, [phase, onPause, onResume]);
  return <NgajiCeriaLayout title={title} showBack hideNav hideHeader onBack={exit}>
    <section data-game-phase={phase} aria-label={title}
      className={`ceria-game relative flex h-full min-h-0 flex-col overflow-hidden bg-gradient-to-br text-white ${ACCENTS[accent].background}`}>
      <div className="z-20 shrink-0 border-b border-white/10 bg-black/25 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <button onClick={exit} aria-label="Keluar permainan" className="game-control">
              <X size={14} /><span className="text-[10px]">Keluar</span>
            </button>
             <span className="truncate text-xs font-black text-white/90">{title}</span>
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" disabled={muted} onClick={() => audio.isPlaying ? audio.stop() : void audio.play()} aria-label={audio.isPlaying ? "Hentikan bacaan" : recitation ? "Dengarkan bacaan" : "Latihan Tilawati"} className="game-control" title={recitation ? "Bacaan soal" : "Latihan Tilawati Jilid 1"}><Volume2 size={14} /><span className="text-[10px]">{audio.isPlaying ? "Stop" : "Baca"}</span></button>
            <button onClick={toggle} aria-label={muted ? "Aktifkan suara" : "Matikan suara"} aria-pressed={muted} className="game-control">{muted ? <VolumeX size={14} /> : <Volume2 size={14} />}<span className="text-[10px]">{muted ? "Mati" : "Suara"}</span></button>
            {(phase === "playing" || phase === "paused") && <button onClick={onPause} aria-label="Jeda permainan" className="game-control"><Pause size={14} /></button>}
          </div>
        </div>
      </div>
      <div className={`min-h-0 flex-1 overscroll-contain p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 sm:pb-[max(1rem,env(safe-area-inset-bottom))] ${fitViewport && phase !== "idle" ? "flex flex-col overflow-hidden" : "overflow-y-auto"}`}>
        {children}
        {audio.error && <p role="status" className="shrink-0 text-center text-xs text-amber-200">{audio.error}</p>}
      </div>
    </section>
    <PauseOverlay visible={phase === "paused"} onResume={onResume} onExit={exit} accent={accent} />
  </NgajiCeriaLayout>;
}
