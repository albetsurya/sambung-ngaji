import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  Volume2,
} from "../common/FontAwesomeIcons";

export interface AudioTrack {
  url: string;
  title: string;
  subtitle?: string;
  index: number;
  total: number;
}

interface AudioPlayerMiniProps {
  track: AudioTrack | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  autoPlay?: boolean;
}

export function AudioPlayerMini({
  track,
  onClose,
  onPrev,
  onNext,
  autoPlay = true,
}: AudioPlayerMiniProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!track) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      setPlaying(false);
      setProgress(0);
      setDuration(0);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    audio.src = track.url;
    audio.load();
    setLoading(true);
    setProgress(0);

    if (autoPlay) {
      audio.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      );
    }
  }, [track?.url, autoPlay, track]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    function onTimeUpdate() {
      if (audio) setProgress(audio.currentTime);
    }
    function onLoadedMetadata() {
      if (audio && isFinite(audio.duration)) setDuration(audio.duration);
      setLoading(false);
    }
    function onEnded() {
      setPlaying(false);
      setLoading(false);
      if (onNext) onNext();
    }
    function onPlay() {
      setPlaying(true);
    }
    function onPause() {
      setPlaying(false);
    }

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [onNext]);

  if (!track) return null;

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      );
    } else {
      audio.pause();
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    const value = Number(e.target.value);
    audio.currentTime = value;
    setProgress(value);
  }

  function formatTime(s: number): string {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ":" + String(sec).padStart(2, "0");
  }

  return (
    <>
      <audio ref={audioRef} preload="metadata" />

      <div className="fixed bottom-0 left-0 right-0 md:left-64 z-50 pb-safe pointer-events-none">
        <div className="app-shell px-3 pb-3">
          <div className="pointer-events-auto rounded-2xl bg-surface-card border border-surface-border shadow-lg shadow-black/10 backdrop-blur-xl overflow-hidden">
            
            <div className="h-1 bg-surface-card2">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{
                  width: duration > 0 ? (progress / duration) * 100 + "%" : "0%",
                }}
              />
            </div>

            
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={progress}
              onChange={handleSeek}
              aria-label="Seek audio"
              className="sr-only"
            />

            <div className="flex items-center gap-2 px-3 py-2.5">
              
              <button
                onClick={togglePlay}
                aria-label={playing ? "Pause" : "Play"}
                className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:bg-accent-dark active:scale-95"
              >
                {loading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                ) : playing ? (
                  <Pause size={16} />
                ) : (
                  <Play size={16} className="ml-0.5" />
                )}
              </button>

              
              <div className="flex-1 min-w-0">
                <p className="text-ios-body font-medium text-surface-text truncate">
                  {track.title}
                </p>
                <p className="text-ios-caption text-surface-muted truncate tabular-nums">
                  {track.subtitle ? track.subtitle + " · " : ""}
                  {formatTime(progress)} / {formatTime(duration)}
                </p>
              </div>

              
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {onPrev && (
                  <button
                    onClick={onPrev}
                    disabled={track.index <= 0}
                    aria-label="Ayat sebelumnya"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-muted transition-colors duration-200 hover:bg-surface-card2 hover:text-surface-text active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <SkipBack size={14} />
                  </button>
                )}
                {onNext && (
                  <button
                    onClick={onNext}
                    disabled={track.index >= track.total - 1}
                    aria-label="Ayat berikutnya"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-muted transition-colors duration-200 hover:bg-surface-card2 hover:text-surface-text active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <SkipForward size={14} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  aria-label="Tutup player"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-muted transition-colors duration-200 hover:bg-danger-soft hover:text-danger active:scale-95"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

void Volume2;
