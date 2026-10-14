import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { BibiMascot, type BibiAnimation, type BibiMood } from "./BibiMascot";

interface BibiCompanionProps {
  size?: number;
  parallaxFactor?: number;
  autoRoam?: boolean;
  reactiveSpeech?: boolean;
  className?: string;
}

const SCROLL_MILESTONES = [0, 400, 900, 1600, 2600, 4000];
const SCROLL_MESSAGES = [
  "Hai! Bibi temani kamu ya 👋",
  "Yuk scroll pelan-pelan 👇",
  "Banyak yang menarik di bawah! ✨",
  "Bibi ikut kamu terus 🚶",
  "Kamu rajin menjelajah! ⭐",
  "Sampai bawah nih, hebat! 🎉",
];

const ENTRANCE_DURATION = 2200;

const ROAM_MIN = -30;
const ROAM_MAX = 8;
const ROAM_SPEED = 16;

export function BibiCompanion({
  size = 110,
  parallaxFactor = 0.08,
  autoRoam = true,
  reactiveSpeech = true,
  className = "",
}: BibiCompanionProps) {
  const [phase, setPhase] = useState<"entering" | "idle">("entering");
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [roamDir, setRoamDir] = useState<1 | -1>(1);
  const [mood, setMood] = useState<BibiMood>("excited");
  const [anim, setAnim] = useState<BibiAnimation>("walk");
  const [speech, setSpeech] = useState<string | undefined>(undefined);
  const [talking, setTalking] = useState(false);

  const dragRef = useRef<{
    x: number;
    y: number;
    startX: number;
    startY: number;
  } | null>(null);
  const lastScrollY = useRef(0);
  const milestoneIndex = useRef(0);
  const roamPos = useRef(0);
  const walkTimer = useRef<number | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setPhase("idle");
      setAnim("float");
      setMood("happy");
      setSpeech("Hai! Bibi temani kamu ya 👋");
      setTalking(true);
      window.setTimeout(() => setTalking(false), 2400);
    }, ENTRANCE_DURATION);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      lastScrollY.current = y;

      setOffset((prev) => ({ ...prev, y: -y * parallaxFactor }));

      if (phase !== "idle") return;

      if (Math.abs(delta) > 10) {
        if (delta > 0) setRoamDir(1);
        else setRoamDir(-1);

        setAnim("walk");
        if (walkTimer.current !== null) window.clearTimeout(walkTimer.current);
        walkTimer.current = window.setTimeout(() => setAnim("float"), 900);
      }

      if (reactiveSpeech && y >= SCROLL_MILESTONES[milestoneIndex.current]) {
        const next = milestoneIndex.current;
        if (next < SCROLL_MESSAGES.length) {
          setSpeech(SCROLL_MESSAGES[next]);
          setTalking(true);
          setMood(next % 2 === 0 ? "happy" : "excited");
          window.setTimeout(() => setTalking(false), 2400);
          milestoneIndex.current += 1;
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [parallaxFactor, reactiveSpeech, phase]);

  useEffect(() => {
    if (!autoRoam || phase !== "idle") return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      roamPos.current += roamDir * ROAM_SPEED * dt;
      if (roamPos.current > ROAM_MAX) {
        roamPos.current = ROAM_MAX;
        setRoamDir(-1);
      }
      if (roamPos.current < ROAM_MIN) {
        roamPos.current = ROAM_MIN;
        setRoamDir(1);
      }
      setOffset((prev) => ({ ...prev, x: roamPos.current }));
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [autoRoam, phase, roamDir]);

  useEffect(
    () => () => {
      if (walkTimer.current !== null) window.clearTimeout(walkTimer.current);
    },
    [],
  );

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (phase !== "idle") return;
    dragRef.current = {
      x: offset.x,
      y: offset.y,
      startX: e.clientX,
      startY: e.clientY,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset({ x: dragRef.current.x + dx, y: dragRef.current.y + dy });
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleTap = useCallback(() => {
    if (phase !== "idle") return;
    setMood("love");
    setSpeech("Hai! Ada yang bisa Bibi bantu? 💕");
    setTalking(true);
    setAnim("bounce");
    window.setTimeout(() => setTalking(false), 2200);
    window.setTimeout(() => setAnim("float"), 1600);
    window.setTimeout(() => setMood("wave"), 2600);
  }, [phase]);

  return (
    <div className={`bibi-companion ${className}`}>
      <div className={phase === "entering" ? "bibi-entrance" : ""}>
        <div
          className="bibi-offset"
          style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
        >
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="bibi-companion-drag"
          >
            <BibiMascot
              size={size}
              mood={mood}
              animation={anim}
              talking={talking}
              speech={speech}
              blink
              onTap={handleTap}
              ariaLabel="Bibi, teman setiamu"
            />
          </div>
        </div>
      </div>
      <style>{`
        .bibi-companion {
          position: fixed;
          right: 12px;
          bottom: 92px;
          z-index: 40;
          pointer-events: auto;
          will-change: transform;
        }
        .bibi-offset {
          transition: transform 120ms linear;
          will-change: transform;
        }
        .bibi-companion-drag {
          touch-action: none;
          cursor: grab;
        }
        .bibi-companion-drag:active { cursor: grabbing; }

        .bibi-entrance {
          transform-origin: center bottom;
          animation: bibiEntrance 2.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          opacity: 0;
          pointer-events: none;
        }

        @keyframes bibiEntrance {
          0% {
            transform: translate3d(140px, -30px, 0) scale(0.12);
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          18% {
            transform: translate3d(112px, 28px, 0) scale(0.30);
          }
          32% {
            transform: translate3d(84px, -22px, 0) scale(0.46);
          }
          46% {
            transform: translate3d(56px, 22px, 0) scale(0.60);
          }
          60% {
            transform: translate3d(32px, -16px, 0) scale(0.74);
          }
          74% {
            transform: translate3d(14px, 10px, 0) scale(0.86);
          }
          88% {
            transform: translate3d(4px, -4px, 0) scale(0.95);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 1;
          }
        }

        @media (max-width: 360px) {
          .bibi-companion { right: 6px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .bibi-entrance {
            animation: none;
            opacity: 1;
          }
          .bibi-offset { transition: none; }
        }
      `}</style>
    </div>
  );
}
