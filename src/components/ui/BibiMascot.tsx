import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

export type BibiMood =
  | "idle"
  | "happy"
  | "wave"
  | "sad"
  | "surprised"
  | "thinking"
  | "sleepy"
  | "excited"
  | "love"
  | "wink"
  | "cool"
  | "wow";

export type BibiAnimation =
  | "none"
  | "float"
  | "walk"
  | "fly"
  | "jump"
  | "dance"
  | "spin"
  | "swing"
  | "bounce"
  | "shake";

export interface BibiMascotProps {
  size?: number | string;
  mood?: BibiMood;
  animation?: BibiAnimation;
  talking?: boolean;
  speech?: string;
  animated?: boolean;
  animationDelay?: number;
  className?: string;
  ariaLabel?: string;
  onTap?: () => void;
  src?: string;
  interactive?: boolean;
  onInteract?: (state: { mood: BibiMood; animation: BibiAnimation }) => void;
  draggable?: boolean;
  autoCycle?: boolean;
  blink?: boolean;
}

const MOOD_CYCLE: BibiMood[] = [
  "happy",
  "wave",
  "excited",
  "love",
  "wink",
  "surprised",
  "wow",
  "thinking",
  "cool",
  "sleepy",
  "idle",
  "sad",
];

const ANIM_CYCLE: BibiAnimation[] = [
  "float",
  "walk",
  "dance",
  "bounce",
  "jump",
  "swing",
  "fly",
  "spin",
];

const MOOD_MESSAGES: Record<BibiMood, string> = {
  idle: "Ayo lanjut pelan-pelan 🌟",
  happy: "Yeay! Kita belajar bersama ✨",
  wave: "Halo! Siap mengaji? 👋",
  sad: "Tidak apa-apa, Bibi menemanimu 💛",
  surprised: "Wah, kamu hebat!",
  thinking: "Hmm, mari kita renungkan…",
  sleepy: "Kita istirahat sebentar ya 😴",
  excited: "Luar biasa! Ayo lanjut! 🚀",
  love: "Bibi sayang kamu 💕",
  wink: "Hihihi 😉",
  cool: "Keren! B)",
  wow: "Wooow! 🤩",
};

const ANIM_CLASS: Record<BibiAnimation, string> = {
  none: "",
  float: "bibi-float",
  walk: "bibi-walk",
  fly: "bibi-fly",
  jump: "bibi-jump",
  dance: "bibi-dance",
  spin: "bibi-spin",
  swing: "bibi-swing",
  bounce: "bibi-bounce",
  shake: "bibi-shake",
};

/* ============================================================
   FACE GEOMETRY (user space 1024x1024)
   ============================================================ */
const FACE = {
  leftEyeX: 435,
  rightEyeX: 590,
  eyeY: 490,
  eyeRX: 36,
  eyeRY: 42,
  mouthX: 512,
  mouthY: 620,
  blushLeftX: 355,
  blushRightX: 670,
  blushY: 585,
  blushRX: 58,
  blushRY: 30,
};

/* ============================================================
   HOOKS
   ============================================================ */
function useTypewriter(text: string | undefined, speed = 45) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    if (!text) {
      setShown("");
      return;
    }
    setShown("");
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed]);
  return shown;
}

/* ============================================================
   FACE PARTS
   ============================================================ */
function Eye({
  cx,
  cy,
  lookX = 0,
  lookY = 0,
  closed = false,
  wide = false,
  sparkle = false,
}: {
  cx: number;
  cy: number;
  lookX?: number;
  lookY?: number;
  closed?: boolean;
  wide?: boolean;
  sparkle?: boolean;
}) {
  const rx = wide ? FACE.eyeRX + 6 : FACE.eyeRX;
  const ry = wide ? FACE.eyeRY + 8 : FACE.eyeRY;

  if (closed) {
    return (
      <path
        d={`M ${cx - 34} ${cy} Q ${cx} ${cy + 18} ${cx + 34} ${cy}`}
        stroke="#361e04"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
    );
  }

  return (
    <>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#2a1b0f" />
      <ellipse
        cx={cx + lookX}
        cy={cy + lookY}
        rx={rx + 4}
        ry={ry + 4}
        fill="#4a2c0e"
        opacity="0.4"
      />
      <ellipse
        cx={cx + lookX}
        cy={cy + lookY}
        rx={rx - 4}
        ry={ry - 4}
        fill="#1a0f05"
      />
      <ellipse cx={cx - 12} cy={cy - 14} rx="12" ry="14" fill="white" />
      <circle cx={cx + 10} cy={cy + 12} r="5" fill="white" opacity="0.75" />
      {sparkle && (
        <>
          <path
            d={`M ${cx + 18} ${cy - 22} l 3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z`}
            fill="white"
          />
          <path
            d={`M ${cx - 22} ${cy + 18} l 2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2 z`}
            fill="white"
          />
        </>
      )}
    </>
  );
}

function HeartEye({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <ellipse cx={cx} cy={cy} rx={FACE.eyeRX} ry={FACE.eyeRY} fill="#2a1b0f" />
      <path
        d={`M ${cx} ${cy + 20}
            c -20 -14 -34 -22 -34 -36
            c 0 -12 10 -18 18 -18
            c 8 0 14 5 16 11
            c 2 -6 8 -11 16 -11
            c 8 0 18 6 18 18
            c 0 14 -14 22 -34 36 z`}
        fill="#ff4060"
      />
      <path
        d={`M ${cx - 10} ${cy - 14} c -4 -3 -8 -3 -10 0 c -2 3 1 6 6 10`}
        stroke="white"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </>
  );
}

function StarEye({ cx, cy }: { cx: number; cy: number }) {
  const s = 32;
  return (
    <>
      <ellipse cx={cx} cy={cy} rx={FACE.eyeRX} ry={FACE.eyeRY} fill="#2a1b0f" />
      <path
        d={`M ${cx} ${cy - s}
            l ${s * 0.3} ${s * 0.6}
            l ${s * 0.7} ${s * 0.2}
            l -${s * 0.5} ${s * 0.4}
            l ${s * 0.15} ${s * 0.7}
            l -${s * 0.65} -${s * 0.4}
            l -${s * 0.65} ${s * 0.4}
            l ${s * 0.15} -${s * 0.7}
            l -${s * 0.5} -${s * 0.4}
            l ${s * 0.7} -${s * 0.2} z`}
        fill="#ffe066"
        stroke="#fff8cc"
        strokeWidth="2"
      />
      <circle cx={cx - 8} cy={cy - 10} r="4" fill="white" />
    </>
  );
}

function WinkEye({ cx, cy }: { cx: number; cy: number }) {
  return (
    <path
      d={`M ${cx - 32} ${cy + 6} Q ${cx} ${cy - 20} ${cx + 32} ${cy + 6}`}
      stroke="#361e04"
      strokeWidth="8"
      strokeLinecap="round"
      fill="none"
    />
  );
}

function Blush({
  cx,
  cy,
  intensity = 1,
}: {
  cx: number;
  cy: number;
  intensity?: number;
}) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={FACE.blushRX}
      ry={FACE.blushRY}
      fill="url(#bibiBlushGrad)"
      opacity={intensity}
    />
  );
}

function SmileMouth({ open = false }: { open?: boolean }) {
  if (open) {
    return (
      <>
        <path
          d={`M ${FACE.mouthX - 55} ${FACE.mouthY - 6}
              Q ${FACE.mouthX} ${FACE.mouthY + 60} ${FACE.mouthX + 55} ${FACE.mouthY - 6} z`}
          fill="#983310"
        />
        <path
          d={`M ${FACE.mouthX - 30} ${FACE.mouthY + 18}
              Q ${FACE.mouthX} ${FACE.mouthY + 48} ${FACE.mouthX + 30} ${FACE.mouthY + 18} z`}
          fill="#f76d53"
        />
      </>
    );
  }
  return (
    <path
      d={`M ${FACE.mouthX - 42} ${FACE.mouthY - 4}
          Q ${FACE.mouthX} ${FACE.mouthY + 32} ${FACE.mouthX + 42} ${FACE.mouthY - 4}`}
      stroke="#361e04"
      strokeWidth="8"
      strokeLinecap="round"
      fill="none"
    />
  );
}

function FrownMouth() {
  return (
    <path
      d={`M ${FACE.mouthX - 38} ${FACE.mouthY + 8}
          Q ${FACE.mouthX} ${FACE.mouthY - 18} ${FACE.mouthX + 38} ${FACE.mouthY + 8}`}
      stroke="#361e04"
      strokeWidth="8"
      strokeLinecap="round"
      fill="none"
    />
  );
}

function OMouth() {
  return (
    <>
      <ellipse
        cx={FACE.mouthX}
        cy={FACE.mouthY + 6}
        rx="28"
        ry="36"
        fill="#983310"
      />
      <ellipse
        cx={FACE.mouthX}
        cy={FACE.mouthY + 16}
        rx="16"
        ry="18"
        fill="#f76d53"
      />
    </>
  );
}

function YawnMouth() {
  return (
    <>
      <ellipse
        cx={FACE.mouthX}
        cy={FACE.mouthY + 8}
        rx="34"
        ry="42"
        fill="#6b1a08"
      />
      <ellipse
        cx={FACE.mouthX}
        cy={FACE.mouthY + 20}
        rx="20"
        ry="22"
        fill="#f76d53"
      />
    </>
  );
}

/* ============================================================
   EXPRESSION RENDERER
   ============================================================ */
function renderFace(expr: BibiMood): ReactNode {
  switch (expr) {
    case "idle":
      return (
        <>
          <Blush cx={FACE.blushLeftX} cy={FACE.blushY} intensity={0.85} />
          <Blush cx={FACE.blushRightX} cy={FACE.blushY} intensity={0.85} />
          <Eye cx={FACE.leftEyeX} cy={FACE.eyeY} />
          <Eye cx={FACE.rightEyeX} cy={FACE.eyeY} />
          <SmileMouth />
        </>
      );

    case "happy":
      return (
        <>
          <Blush cx={FACE.blushLeftX} cy={FACE.blushY} intensity={1} />
          <Blush cx={FACE.blushRightX} cy={FACE.blushY} intensity={1} />
          <Eye cx={FACE.leftEyeX} cy={FACE.eyeY} closed />
          <Eye cx={FACE.rightEyeX} cy={FACE.eyeY} closed />
          <SmileMouth open />
        </>
      );

    case "excited":
      return (
        <>
          <Blush cx={FACE.blushLeftX} cy={FACE.blushY} intensity={1} />
          <Blush cx={FACE.blushRightX} cy={FACE.blushY} intensity={1} />
          <StarEye cx={FACE.leftEyeX} cy={FACE.eyeY} />
          <StarEye cx={FACE.rightEyeX} cy={FACE.eyeY} />
          <SmileMouth open />
        </>
      );

    case "love":
      return (
        <>
          <Blush cx={FACE.blushLeftX} cy={FACE.blushY} intensity={1} />
          <Blush cx={FACE.blushRightX} cy={FACE.blushY} intensity={1} />
          <HeartEye cx={FACE.leftEyeX} cy={FACE.eyeY} />
          <HeartEye cx={FACE.rightEyeX} cy={FACE.eyeY} />
          <SmileMouth open />
        </>
      );

    case "wink":
      return (
        <>
          <Blush cx={FACE.blushLeftX} cy={FACE.blushY} intensity={0.75} />
          <Blush cx={FACE.blushRightX} cy={FACE.blushY} intensity={0.95} />
          <Eye cx={FACE.leftEyeX} cy={FACE.eyeY} />
          <WinkEye cx={FACE.rightEyeX} cy={FACE.eyeY} />
          <path
            d={`M ${FACE.mouthX - 40} ${FACE.mouthY + 2}
                Q ${FACE.mouthX + 5} ${FACE.mouthY + 30} ${FACE.mouthX + 42} ${FACE.mouthY - 8}`}
            stroke="#361e04"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
        </>
      );

    case "surprised":
      return (
        <>
          <Blush cx={FACE.blushLeftX} cy={FACE.blushY} intensity={0.6} />
          <Blush cx={FACE.blushRightX} cy={FACE.blushY} intensity={0.6} />
          <Eye cx={FACE.leftEyeX} cy={FACE.eyeY} wide />
          <Eye cx={FACE.rightEyeX} cy={FACE.eyeY} wide />
          <OMouth />
        </>
      );

    case "wow":
      return (
        <>
          <Blush cx={FACE.blushLeftX} cy={FACE.blushY} intensity={0.9} />
          <Blush cx={FACE.blushRightX} cy={FACE.blushY} intensity={0.9} />
          <Eye cx={FACE.leftEyeX} cy={FACE.eyeY} sparkle />
          <Eye cx={FACE.rightEyeX} cy={FACE.eyeY} sparkle />
          <OMouth />
        </>
      );

    case "thinking":
      return (
        <>
          <Blush cx={FACE.blushLeftX} cy={FACE.blushY} intensity={0.65} />
          <Blush cx={FACE.blushRightX} cy={FACE.blushY} intensity={0.65} />
          <Eye cx={FACE.leftEyeX} cy={FACE.eyeY} lookY={-6} lookX={6} />
          <Eye cx={FACE.rightEyeX} cy={FACE.eyeY} lookY={-6} lookX={6} />
          <path
            d={`M ${FACE.mouthX - 20} ${FACE.mouthY + 4}
                Q ${FACE.mouthX} ${FACE.mouthY - 4} ${FACE.mouthX + 20} ${FACE.mouthY + 6}`}
            stroke="#361e04"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
        </>
      );

    case "sleepy":
      return (
        <>
          <Blush cx={FACE.blushLeftX} cy={FACE.blushY} intensity={0.55} />
          <Blush cx={FACE.blushRightX} cy={FACE.blushY} intensity={0.55} />
          <Eye cx={FACE.leftEyeX} cy={FACE.eyeY} closed />
          <Eye cx={FACE.rightEyeX} cy={FACE.eyeY} closed />
          <YawnMouth />
        </>
      );

    case "sad":
      return (
        <>
          <Blush cx={FACE.blushLeftX} cy={FACE.blushY} intensity={0.55} />
          <Blush cx={FACE.blushRightX} cy={FACE.blushY} intensity={0.55} />
          <Eye cx={FACE.leftEyeX} cy={FACE.eyeY} lookY={4} />
          <Eye cx={FACE.rightEyeX} cy={FACE.eyeY} lookY={4} />
          <FrownMouth />
          <ellipse
            cx={FACE.leftEyeX + 20}
            cy={FACE.eyeY + 46}
            rx="7"
            ry="11"
            fill="#8ecbee"
            opacity="0.9"
            className="bibi-falling-tear"
          />
          <ellipse
            cx={FACE.rightEyeX + 20}
            cy={FACE.eyeY + 46}
            rx="7"
            ry="11"
            fill="#8ecbee"
            opacity="0.9"
            className="bibi-falling-tear"
            style={{ animationDelay: "0.9s" }}
          />
        </>
      );

    case "cool":
      return (
        <>
          <Blush cx={FACE.blushLeftX} cy={FACE.blushY} intensity={0.6} />
          <Blush cx={FACE.blushRightX} cy={FACE.blushY} intensity={0.6} />
          <path
            d={`M ${FACE.leftEyeX - 55} ${FACE.eyeY - 15}
                L ${FACE.leftEyeX + 55} ${FACE.eyeY - 15}
                Q ${FACE.leftEyeX + 55} ${FACE.eyeY + 40} ${FACE.leftEyeX} ${FACE.eyeY + 40}
                Q ${FACE.leftEyeX - 55} ${FACE.eyeY + 40} ${FACE.leftEyeX - 55} ${FACE.eyeY - 15} z`}
            fill="#0f0f13"
          />
          <path
            d={`M ${FACE.rightEyeX - 55} ${FACE.eyeY - 15}
                L ${FACE.rightEyeX + 55} ${FACE.eyeY - 15}
                Q ${FACE.rightEyeX + 55} ${FACE.eyeY + 40} ${FACE.rightEyeX} ${FACE.eyeY + 40}
                Q ${FACE.rightEyeX - 55} ${FACE.eyeY + 40} ${FACE.rightEyeX - 55} ${FACE.eyeY - 15} z`}
            fill="#0f0f13"
          />
          <path
            d={`M ${FACE.leftEyeX + 55} ${FACE.eyeY - 10} L ${FACE.rightEyeX - 55} ${FACE.eyeY - 10}`}
            stroke="#0f0f13"
            strokeWidth="10"
          />
          <path
            d={`M ${FACE.leftEyeX - 40} ${FACE.eyeY - 10} l 20 20 l 20 -20`}
            stroke="#3a3a44"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M ${FACE.rightEyeX - 40} ${FACE.eyeY - 10} l 20 20 l 20 -20`}
            stroke="#3a3a44"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M ${FACE.mouthX - 40} ${FACE.mouthY + 2}
                Q ${FACE.mouthX + 5} ${FACE.mouthY + 30} ${FACE.mouthX + 42} ${FACE.mouthY - 8}`}
            stroke="#361e04"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
        </>
      );

    case "wave":
      return (
        <>
          <Blush cx={FACE.blushLeftX} cy={FACE.blushY} intensity={0.9} />
          <Blush cx={FACE.blushRightX} cy={FACE.blushY} intensity={0.9} />
          <Eye cx={FACE.leftEyeX} cy={FACE.eyeY} />
          <Eye cx={FACE.rightEyeX} cy={FACE.eyeY} />
          <SmileMouth open />
        </>
      );
  }
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export function BibiMascot({
  size = 120,
  mood = "idle",
  animation = "float",
  talking = false,
  speech,
  animated = true,
  animationDelay = 0,
  className = "",
  ariaLabel,
  onTap,
  src = "/bibi.svg",
  interactive = false,
  onInteract,
  draggable = false,
  autoCycle = false,
  blink = true,
}: BibiMascotProps) {
  const [stateMood, setStateMood] = useState<BibiMood | null>(null);
  const [stateAnim, setStateAnim] = useState<BibiAnimation | null>(null);
  const [stateSpeech, setStateSpeech] = useState<string>();
  const [stateTalking, setStateTalking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState({ x: 0, y: 0 });

  const talkingTimer = useRef<number | null>(null);
  const cycleTimer = useRef<number | null>(null);
  const dragStart = useRef<{
    x: number;
    y: number;
    dx: number;
    dy: number;
  } | null>(null);

  const dimension = typeof size === "number" ? `${size}px` : size;
  const effMood = stateMood ?? mood;
  const effAnim = stateAnim ?? animation;
  const effSpeech = speech ?? stateSpeech;
  const typedSpeech = useTypewriter(effSpeech);
  const isTalking = talking || stateTalking;

  const isClickable = interactive || Boolean(onTap);
  const isSad = effMood === "sad";
  const isSurprised = effMood === "surprised";
  const isSleepy = effMood === "sleepy";
  const isHappy =
    effMood === "happy" || effMood === "excited" || effMood === "love";
  const isThinking = effMood === "thinking";
  const isWaving =
    effMood === "wave" || effAnim === "walk" || effAnim === "dance";
  const isWalking = effAnim === "walk";
  const isFlying = effAnim === "fly";
  const isDancing = effAnim === "dance";

  const hasSpeech = Boolean(effSpeech);

  /* ---------- Blink auto ---------- */
  useEffect(() => {
    if (!blink) return;
    if (isSleepy || effMood === "happy" || effMood === "wink") return;
    let tid: number;
    const schedule = () => {
      const next = 2400 + Math.random() * 3200;
      tid = window.setTimeout(() => {
        setIsBlinking(true);
        window.setTimeout(() => setIsBlinking(false), 140);
        schedule();
      }, next);
    };
    schedule();
    return () => window.clearTimeout(tid);
  }, [blink, isSleepy, effMood]);

  useEffect(
    () => () => {
      if (talkingTimer.current !== null)
        window.clearTimeout(talkingTimer.current);
      if (cycleTimer.current !== null) window.clearInterval(cycleTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!autoCycle || !interactive) return;
    let i = 0;
    cycleTimer.current = window.setInterval(() => {
      i++;
      const nextMood = MOOD_CYCLE[i % MOOD_CYCLE.length];
      const nextAnim = ANIM_CYCLE[i % ANIM_CYCLE.length];
      setStateMood(nextMood);
      setStateAnim(nextAnim);
      if (speech === undefined) setStateSpeech(MOOD_MESSAGES[nextMood]);
    }, 4200);
    return () => {
      if (cycleTimer.current !== null) window.clearInterval(cycleTimer.current);
    };
  }, [autoCycle, interactive, speech]);

  const handleTap = useCallback(() => {
    onTap?.();
    if (!interactive) return;

    const mi = stateMood === null ? -1 : MOOD_CYCLE.indexOf(stateMood);
    const ai = stateAnim === null ? -1 : ANIM_CYCLE.indexOf(stateAnim);
    const nextMood = MOOD_CYCLE[(mi + 1) % MOOD_CYCLE.length];
    const nextAnim = ANIM_CYCLE[(ai + 1) % ANIM_CYCLE.length];

    setStateMood(nextMood);
    setStateAnim(nextAnim);
    if (speech === undefined) setStateSpeech(MOOD_MESSAGES[nextMood]);
    setStateTalking(true);
    onInteract?.({ mood: nextMood, animation: nextAnim });

    if (talkingTimer.current !== null)
      window.clearTimeout(talkingTimer.current);
    talkingTimer.current = window.setTimeout(
      () => setStateTalking(false),
      2200,
    );
  }, [interactive, onTap, onInteract, stateMood, stateAnim, speech]);

  const handlePointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (draggable && dragStart.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setDrag({ x: dragStart.current.dx + dx, y: dragStart.current.dy + dy });
      return;
    }
    if (!isClickable) return;
    const b = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - b.left) / b.width - 0.5) * 10;
    const y = ((e.clientY - b.top) / b.height - 0.5) * -10;
    setTilt({ x: Number(y.toFixed(2)), y: Number(x.toFixed(2)) });
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    setIsPressed(true);
    if (draggable) {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        dx: drag.x,
        dy: drag.y,
      };
    }
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLElement>) => {
    setIsPressed(false);
    if (draggable) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      dragStart.current = null;
    }
  };

  const rootClass = [
    "bibi-root relative inline-flex flex-col items-center",
    animated ? "bibi-animated" : "",
    isClickable ? "bibi-is-interactive" : "",
    isHovered ? "bibi-is-hovered" : "",
    isPressed ? "bibi-is-pressed" : "",
    draggable ? "bibi-is-draggable" : "",
    `bibi-mood-${effMood}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const rootStyle: CSSProperties = {
    width: dimension,
    ["--bibi-delay" as string]: `${animationDelay}ms`,
    ["--bibi-tilt-x" as string]: `${tilt.x}deg`,
    ["--bibi-tilt-y" as string]: `${tilt.y}deg`,
    ["--bibi-drag-x" as string]: `${drag.x}px`,
    ["--bibi-drag-y" as string]: `${drag.y}px`,
  };

  const imageFilter: CSSProperties = isSad
    ? { filter: "saturate(0.75) brightness(0.98)" }
    : isSleepy
      ? { filter: "brightness(0.94)" }
      : {};

  const faceExpression: BibiMood =
    isBlinking &&
    (effMood === "idle" ||
      effMood === "surprised" ||
      effMood === "thinking" ||
      effMood === "wave")
      ? "sleepy"
      : effMood;

  const artwork = (
    <>
      <span className="bibi-aura" aria-hidden="true" />

      <svg
        className={`bibi-stage-svg ${animated ? ANIM_CLASS[effAnim] : ""}`}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ ...imageFilter, animationDelay: `${animationDelay}ms` }}
        aria-hidden="true"
      >
        <defs>
          <mask id="bibiFaceMask" maskContentUnits="userSpaceOnUse">
            <rect x="0" y="0" width="100" height="100" fill="white" />
            <rect x="28" y="38" width="44" height="30" rx="12" fill="black" />
          </mask>
          <radialGradient id="bibiBlushGrad" cx="0.5" cy="0.5" r="0.55">
            <stop offset="0%" stopColor="#ff5a7a" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#ff5a7a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ff5a7a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bibiHandGrad" cx="0.5" cy="0.4" r="0.7">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="100%" stopColor="#FFCB45" />
          </radialGradient>
          <linearGradient id="bibiFootGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFCB45" />
            <stop offset="100%" stopColor="#E89B1E" />
          </linearGradient>
        </defs>

        <image
          href={src}
          x="0"
          y="0"
          width="100"
          height="100"
          mask="url(#bibiFaceMask)"
          preserveAspectRatio="xMidYMid meet"
        />

        <rect x="28" y="38" width="44" height="30" rx="12" fill="#FDC21A" />

        <svg
          viewBox="0 0 1024 1024"
          x="0"
          y="0"
          width="100"
          height="100"
          preserveAspectRatio="xMidYMid meet"
        >
          {renderFace(faceExpression)}
        </svg>

        {(isWalking || isDancing) && (
          <g className="bibi-feet">
            <ellipse
              cx="42"
              cy="88"
              rx="4.5"
              ry="3"
              fill="url(#bibiFootGrad)"
              stroke="#E89B1E"
              strokeWidth="0.8"
              className="bibi-foot-left"
            />
            <ellipse
              cx="58"
              cy="88"
              rx="4.5"
              ry="3"
              fill="url(#bibiFootGrad)"
              stroke="#E89B1E"
              strokeWidth="0.8"
              className="bibi-foot-right"
            />
          </g>
        )}

        {isWaving && (
          <g className="bibi-hand" style={{ transformOrigin: "82px 52px" }}>
            <ellipse
              cx="86"
              cy="52"
              rx="5.5"
              ry="6.5"
              fill="url(#bibiHandGrad)"
              stroke="#E89B1E"
              strokeWidth="1.2"
            />
            <circle
              cx="89"
              cy="47"
              r="1.6"
              fill="#FFCB45"
              stroke="#E89B1E"
              strokeWidth="0.6"
            />
            <circle
              cx="91"
              cy="51"
              r="1.6"
              fill="#FFCB45"
              stroke="#E89B1E"
              strokeWidth="0.6"
            />
            <circle
              cx="89"
              cy="55"
              r="1.6"
              fill="#FFCB45"
              stroke="#E89B1E"
              strokeWidth="0.6"
            />
          </g>
        )}

        {isDancing && (
          <g
            className="bibi-hand-left"
            style={{ transformOrigin: "18px 52px" }}
          >
            <ellipse
              cx="14"
              cy="52"
              rx="5.5"
              ry="6.5"
              fill="url(#bibiHandGrad)"
              stroke="#E89B1E"
              strokeWidth="1.2"
            />
          </g>
        )}

        {isFlying && (
          <g
            className="bibi-speed-lines"
            stroke="#FFCB45"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          >
            <line x1="20" y1="100" x2="20" y2="115" />
            <line x1="35" y1="102" x2="35" y2="118" />
            <line x1="50" y1="100" x2="50" y2="116" />
            <line x1="65" y1="102" x2="65" y2="118" />
            <line x1="80" y1="100" x2="80" y2="115" />
          </g>
        )}

        {isSleepy && (
          <g
            className="bibi-zzz"
            fill="none"
            stroke="#7A5A2A"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M68 34 h6 l-6 7 h6" opacity="0.9" />
            <path d="M76 22 h5 l-5 6 h5" opacity="0.7" />
            <path d="M83 10 h4 l-4 5 h4" opacity="0.5" />
          </g>
        )}

        {isSurprised && (
          <circle cx="28" cy="36" r="1.4" fill="#FFE082" className="bibi-pop" />
        )}

        {isHappy && (
          <g className="bibi-hearts">
            <path
              d="M26 32 c-2 -3 -6 -3 -7 0 c-1 3 3 6 7 9 c4 -3 8 -6 7 -9 c-1 -3 -5 -3 -7 0 z"
              fill="#FF7A8A"
              className="bibi-heart"
            />
            <path
              d="M70 24 c-1.5 -2 -4.5 -2 -5 0 c-0.7 2 2 4.5 5 6.5 c3 -2 5.7 -4.5 5 -6.5 c-0.5 -2 -3.5 -2 -5 0 z"
              fill="#FF9AAB"
              className="bibi-heart"
              style={{ animationDelay: "300ms" }}
            />
            <path
              d="M78 62 c-1 -1.5 -3 -1.5 -3.5 0 c-0.5 1.5 1.5 3 3.5 4.5 c2 -1.5 4 -3 3.5 -4.5 c-0.5 -1.5 -2.5 -1.5 -3.5 0 z"
              fill="#FFB0BE"
              className="bibi-heart"
              style={{ animationDelay: "600ms" }}
            />
          </g>
        )}

        {isWaving && !isDancing && (
          <g className="bibi-stars">
            <path
              d="M20 30 l1.5 3 3 1.5 -3 1.5 -1.5 3 -1.5 -3 -3 -1.5 3 -1.5z"
              fill="#FFCB45"
              className="bibi-pop"
            />
            <path
              d="M82 36 l1.2 2.4 2.4 1.2 -2.4 1.2 -1.2 2.4 -1.2 -2.4 -2.4 -1.2 2.4 -1.2z"
              fill="#FFE082"
              className="bibi-pop"
              style={{ animationDelay: "220ms" }}
            />
          </g>
        )}

        {isThinking && (
          <>
            <circle
              cx="72"
              cy="42"
              r="2"
              fill="#FFF6D5"
              stroke="#F5DDB5"
              strokeWidth="0.8"
              className="bibi-thought-dot"
            />
            <circle
              cx="78"
              cy="34"
              r="2.6"
              fill="#FFF6D5"
              stroke="#F5DDB5"
              strokeWidth="0.8"
              className="bibi-thought-dot"
              style={{ animationDelay: "150ms" }}
            />
            <ellipse
              cx="84"
              cy="22"
              rx="8"
              ry="5.5"
              fill="#FFF6D5"
              stroke="#F5DDB5"
              strokeWidth="0.8"
              className="bibi-thought-dot"
              style={{ animationDelay: "300ms" }}
            />
            <circle cx="80" cy="22" r="0.9" fill="#C9A66B" />
            <circle cx="84" cy="22" r="0.9" fill="#C9A66B" />
            <circle cx="88" cy="22" r="0.9" fill="#C9A66B" />
          </>
        )}
      </svg>

      {isTalking && (
        <span className="bibi-soundwave" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      )}
    </>
  );

  const imageFrame =
    isClickable || draggable ? (
      <button
        type="button"
        className="bibi-frame"
        onClick={handleTap}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
          setTilt({ x: 0, y: 0 });
        }}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        aria-label={ariaLabel ?? "Sapa Bibi"}
      >
        {artwork}
      </button>
    ) : (
      <span className="bibi-frame">{artwork}</span>
    );

  return (
    <span
      className={rootClass}
      style={rootStyle}
      role={ariaLabel && !isClickable ? "img" : undefined}
      aria-label={ariaLabel && !isClickable ? ariaLabel : undefined}
      aria-hidden={!ariaLabel && !isClickable && !hasSpeech ? true : undefined}
    >
      {hasSpeech && (
        <span className="bibi-speech-bubble" role="status" aria-live="polite">
          {typedSpeech}
          <span className="bibi-caret" aria-hidden="true" />
        </span>
      )}
      <span
        className="bibi-stage"
        style={{ width: dimension, height: dimension }}
      >
        {imageFrame}
      </span>

      <style>{STYLES}</style>
    </span>
  );
}

/* ============================================================
   STYLES
   ============================================================ */
const STYLES = `
.bibi-root {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  transform-origin: center bottom;
  will-change: transform;
}
.bibi-stage {
  position: relative;
  display: inline-block;
  transform-origin: center bottom;
}
.bibi-frame {
  position: absolute;
  inset: 0;
  display: block;
  border: 0;
  padding: 0;
  margin: 0;
  background: transparent;
  cursor: default;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
.bibi-is-interactive .bibi-frame,
.bibi-is-draggable .bibi-frame {
  cursor: pointer;
}
.bibi-is-draggable .bibi-frame {
  cursor: grab;
  touch-action: none;
}
.bibi-is-draggable.bibi-is-pressed .bibi-frame {
  cursor: grabbing;
}
.bibi-frame:focus-visible {
  outline: 2px solid #FFCB45;
  outline-offset: 4px;
  border-radius: 20px;
}
.bibi-stage-svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  transform-origin: center center;
  will-change: transform;
}

.bibi-aura {
  position: absolute;
  inset: 6%;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(255,203,69,0.35) 0%, rgba(255,203,69,0.08) 60%, transparent 75%);
  filter: blur(8px);
  animation: bibiAura 4s ease-in-out infinite;
  pointer-events: none;
}
@keyframes bibiAura {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50%      { opacity: 1;   transform: scale(1.06); }
}

.bibi-is-draggable .bibi-stage {
  transform: translate(var(--bibi-drag-x, 0), var(--bibi-drag-y, 0));
  transition: transform 0ms;
}
.bibi-is-draggable .bibi-frame {
  animation: none !important;
}

.bibi-frame {
  transform: perspective(600px)
    rotateX(var(--bibi-tilt-x, 0deg))
    rotateY(var(--bibi-tilt-y, 0deg));
  transition: transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.bibi-is-hovered .bibi-frame {
  transform: perspective(600px)
    rotateX(var(--bibi-tilt-x, 0deg))
    rotateY(var(--bibi-tilt-y, 0deg))
    scale(1.04);
}
.bibi-is-pressed .bibi-frame {
  transform: perspective(600px)
    rotateX(var(--bibi-tilt-x, 0deg))
    rotateY(var(--bibi-tilt-y, 0deg))
    scale(0.96);
}

.bibi-float {
  animation: bibiFloat 3.2s ease-in-out infinite;
  animation-delay: var(--bibi-delay, 0ms);
}
@keyframes bibiFloat {
  0%, 100% { transform: translateY(0) rotate(0); }
  50%      { transform: translateY(-6px) rotate(-1.5deg); }
}

.bibi-walk {
  animation: bibiWalkBody 0.9s ease-in-out infinite;
  animation-delay: var(--bibi-delay, 0ms);
}
@keyframes bibiWalkBody {
  0%   { transform: translateY(0)     translateX(-4%) rotate(-3deg); }
  25%  { transform: translateY(-5px)  translateX(0)   rotate(0); }
  50%  { transform: translateY(0)     translateX(4%)  rotate(3deg); }
  75%  { transform: translateY(-5px)  translateX(0)   rotate(0); }
  100% { transform: translateY(0)     translateX(-4%) rotate(-3deg); }
}

.bibi-fly {
  animation: bibiFlyBody 2.2s ease-in-out infinite;
  animation-delay: var(--bibi-delay, 0ms);
}
@keyframes bibiFlyBody {
  0%, 100% { transform: translateY(0)      rotate(-5deg); }
  50%      { transform: translateY(-14px)  rotate(5deg); }
}

.bibi-jump {
  animation: bibiJumpBody 1.6s ease-in-out infinite;
  animation-delay: var(--bibi-delay, 0ms);
}
@keyframes bibiJumpBody {
  0%, 100% { transform: translateY(0)     scale(1, 1); }
  15%      { transform: translateY(0)     scale(1.08, 0.92); }
  45%      { transform: translateY(-24px) scale(0.94, 1.08); }
  75%      { transform: translateY(0)     scale(1.06, 0.94); }
}

.bibi-dance {
  animation: bibiDanceBody 1.1s ease-in-out infinite;
  animation-delay: var(--bibi-delay, 0ms);
}
@keyframes bibiDanceBody {
  0%   { transform: rotate(-8deg) translateY(0); }
  25%  { transform: rotate(0)     translateY(-8px); }
  50%  { transform: rotate(8deg)  translateY(0); }
  75%  { transform: rotate(0)     translateY(-8px); }
  100% { transform: rotate(-8deg) translateY(0); }
}

.bibi-spin {
  animation: bibiSpinBody 2s linear infinite;
  animation-delay: var(--bibi-delay, 0ms);
}
@keyframes bibiSpinBody {
  0%   { transform: rotate(0); }
  100% { transform: rotate(360deg); }
}

.bibi-swing {
  animation: bibiSwingBody 2s ease-in-out infinite;
  animation-delay: var(--bibi-delay, 0ms);
  transform-origin: 50% 0%;
}
@keyframes bibiSwingBody {
  0%, 100% { transform: rotate(-12deg); }
  50%      { transform: rotate(12deg); }
}

.bibi-bounce {
  animation: bibiBounceBody 0.8s ease-in-out infinite;
  animation-delay: var(--bibi-delay, 0ms);
}
@keyframes bibiBounceBody {
  0%, 100% { transform: translateY(0)     scale(1, 1); }
  50%      { transform: translateY(-16px) scale(0.96, 1.06); }
}

.bibi-shake {
  animation: bibiShakeBody 0.5s ease-in-out infinite;
  animation-delay: var(--bibi-delay, 0ms);
}
@keyframes bibiShakeBody {
  0%, 100% { transform: translateX(0) rotate(0); }
  25%      { transform: translateX(-4px) rotate(-3deg); }
  75%      { transform: translateX(4px)  rotate(3deg); }
}

.bibi-hand {
  transform-origin: 82px 52px;
  animation: bibiHandWave 0.7s ease-in-out infinite;
  animation-delay: var(--bibi-delay, 0ms);
}
@keyframes bibiHandWave {
  0%, 100% { transform: rotate(-22deg) translateY(0); }
  50%      { transform: rotate(28deg)  translateY(-2px); }
}

.bibi-hand-left {
  transform-origin: 18px 52px;
  animation: bibiHandLeft 0.7s ease-in-out infinite;
  animation-delay: 350ms;
}
@keyframes bibiHandLeft {
  0%, 100% { transform: rotate(18deg); }
  50%      { transform: rotate(-22deg); }
}

.bibi-foot-left {
  animation: bibiFootLeft 0.45s ease-in-out infinite;
}
.bibi-foot-right {
  animation: bibiFootRight 0.45s ease-in-out infinite;
}
@keyframes bibiFootLeft {
  0%, 100% { transform: translateY(0) translateX(-1.5px); }
  50%      { transform: translateY(-2.5px) translateX(1.5px); }
}
@keyframes bibiFootRight {
  0%, 100% { transform: translateY(-2.5px) translateX(1.5px); }
  50%      { transform: translateY(0) translateX(-1.5px); }
}

.bibi-zzz {
  animation: bibiZzz 3s ease-in-out infinite;
}
@keyframes bibiZzz {
  0%   { opacity: 0; transform: translate(0, 4px); }
  30%  { opacity: 1; transform: translate(0, 0); }
  100% { opacity: 0; transform: translate(4px, -6px); }
}

.bibi-falling-tear {
  animation: bibiFallingTear 2.4s ease-in infinite;
  transform-origin: center;
}
@keyframes bibiFallingTear {
  0%   { opacity: 0; transform: translateY(0) scale(0.6); }
  20%  { opacity: 1; transform: translateY(6px) scale(1); }
  100% { opacity: 0; transform: translateY(46px) scale(1.1); }
}

.bibi-pop {
  animation: bibiPop 1.8s ease-in-out infinite;
  transform-origin: center;
}
@keyframes bibiPop {
  0%, 100% { opacity: 0.3; transform: scale(0.6); }
  50%      { opacity: 1;   transform: scale(1.3); }
}

.bibi-heart {
  transform-origin: center;
  animation: bibiHeart 2.6s ease-in-out infinite;
}
@keyframes bibiHeart {
  0%   { opacity: 0; transform: translateY(4px) scale(0.5); }
  30%  { opacity: 1; transform: translateY(-2px) scale(1); }
  70%  { opacity: 1; transform: translateY(-6px) scale(1.05); }
  100% { opacity: 0; transform: translateY(-12px) scale(0.7); }
}

.bibi-thought-dot {
  animation: bibiThought 2.4s ease-in-out infinite;
  transform-origin: center;
}
@keyframes bibiThought {
  0%, 100% { opacity: 0.4; transform: scale(0.85); }
  50%      { opacity: 1;   transform: scale(1.05); }
}

.bibi-speed-lines line {
  animation: bibiSpeedLine 0.9s linear infinite;
}
.bibi-speed-lines line:nth-child(2) { animation-delay: 0.1s; }
.bibi-speed-lines line:nth-child(3) { animation-delay: 0.2s; }
.bibi-speed-lines line:nth-child(4) { animation-delay: 0.3s; }
.bibi-speed-lines line:nth-child(5) { animation-delay: 0.4s; }
@keyframes bibiSpeedLine {
  0%   { opacity: 0;   transform: translateY(0); }
  30%  { opacity: 0.9; }
  100% { opacity: 0;   transform: translateY(-22px); }
}

.bibi-speech-bubble {
  position: relative;
  margin-bottom: 8px;
  max-width: 220px;
  padding: 8px 12px;
  border-radius: 16px;
  background: #FFFFFF;
  color: #2A1B0F;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.35;
  text-align: center;
  box-shadow: 0 6px 20px -8px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.04);
  animation: bibiBubbleIn 320ms cubic-bezier(0.34,1.56,0.64,1);
  white-space: pre-wrap;
  z-index: 2;
}
.bibi-speech-bubble::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -5px;
  width: 10px;
  height: 10px;
  background: #FFFFFF;
  transform: translateX(-50%) rotate(45deg);
  border-radius: 2px;
}
@keyframes bibiBubbleIn {
  0%   { opacity: 0; transform: translateY(6px) scale(0.85); }
  100% { opacity: 1; transform: translateY(0)  scale(1); }
}

.bibi-caret {
  display: inline-block;
  width: 2px;
  height: 12px;
  margin-left: 1px;
  background: #FFCB45;
  vertical-align: text-bottom;
  animation: bibiCaret 700ms steps(2) infinite;
}
@keyframes bibiCaret {
  0%, 50%       { opacity: 1; }
  50.01%, 100%  { opacity: 0; }
}

.bibi-soundwave {
  position: absolute;
  right: -6px;
  bottom: 12%;
  display: flex;
  gap: 2px;
  align-items: flex-end;
  height: 14px;
}
.bibi-soundwave span {
  display: block;
  width: 2.5px;
  background: #FFCB45;
  border-radius: 999px;
  animation: bibiWave 700ms ease-in-out infinite;
}
.bibi-soundwave span:nth-child(1) { height: 6px;  animation-delay: 0ms; }
.bibi-soundwave span:nth-child(2) { height: 12px; animation-delay: 140ms; }
.bibi-soundwave span:nth-child(3) { height: 8px;  animation-delay: 280ms; }
@keyframes bibiWave {
  0%, 100% { transform: scaleY(0.5); opacity: 0.7; }
  50%      { transform: scaleY(1);   opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .bibi-root *,
  .bibi-root *::before,
  .bibi-root *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
`;
