import type { MoodKey } from "../data/mood";
import bersyukur from "../../../assets/mood/bersyukur.svg";
import butuhTenang from "../../../assets/mood/butuh-tenang.svg";
import cemas from "../../../assets/mood/cemas.svg";
import lelah from "../../../assets/mood/lelah.svg";
import marah from "../../../assets/mood/marah.svg";
import putusAsa from "../../../assets/mood/putus-asa.svg";
import takut from "../../../assets/mood/takut.svg";
import teduh from "../../../assets/mood/teduh.svg";

export interface MoodVisual {
  asset: string;
  gradient: string;
  iconSurface: string;
  iconColor: string;
}

export const MOOD_VISUALS: Record<MoodKey, MoodVisual> = {
  sedih: {
    asset: teduh,
    gradient: "from-sky-100 via-blue-50 to-indigo-100",
    iconSurface: "bg-sky-500/15",
    iconColor: "text-sky-600",
  },
  cemas: {
    asset: cemas,
    gradient: "from-amber-100 via-orange-50 to-yellow-100",
    iconSurface: "bg-amber-500/15",
    iconColor: "text-amber-600",
  },
  syukur: {
    asset: bersyukur,
    gradient: "from-emerald-100 via-teal-50 to-lime-100",
    iconSurface: "bg-emerald-500/15",
    iconColor: "text-emerald-600",
  },
  marah: {
    asset: marah,
    gradient: "from-rose-100 via-red-50 to-orange-100",
    iconSurface: "bg-rose-500/15",
    iconColor: "text-rose-600",
  },
  lelah: {
    asset: lelah,
    gradient: "from-violet-100 via-purple-50 to-indigo-100",
    iconSurface: "bg-violet-500/15",
    iconColor: "text-violet-600",
  },
  takut: {
    asset: takut,
    gradient: "from-slate-100 via-blue-50 to-cyan-100",
    iconSurface: "bg-slate-500/15",
    iconColor: "text-slate-600",
  },
  "putus-asa": {
    asset: putusAsa,
    gradient: "from-blue-100 via-indigo-50 to-violet-100",
    iconSurface: "bg-blue-500/15",
    iconColor: "text-blue-600",
  },
  tenang: {
    asset: butuhTenang,
    gradient: "from-teal-100 via-cyan-50 to-sky-100",
    iconSurface: "bg-teal-500/15",
    iconColor: "text-teal-600",
  },
};

export function getMoodVisual(key: MoodKey): MoodVisual {
  return MOOD_VISUALS[key];
}

export function MoodIcon({
  mood,
  size = 20,
  className = "",
}: {
  mood: MoodKey;
  size?: number;
  className?: string;
}) {
  const { asset } = getMoodVisual(mood);
  return (
    <img
      src={asset}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      draggable={false}
    />
  );
}
