import { useEffect, useState } from "react";
import { ACHIEVEMENT_LABELS, getProgress, getRank, subscribeProgress } from "../pages/games/_shared/progression";

interface Notice {
  title: string;
  description: string;
}

export function ProgressionNotice() {
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    let previous = getProgress();
    let timer: number | undefined;
    const refresh = () => {
      const next = getProgress();
      const previousRank = getRank(previous.xp);
      const nextRank = getRank(next.xp);
      const newAchievement = next.achievements.find((id) => !previous.achievements.includes(id));
      const nextNotice = newAchievement && ACHIEVEMENT_LABELS[newAchievement]
        ? { title: `Lencana baru: ${ACHIEVEMENT_LABELS[newAchievement].title}`, description: ACHIEVEMENT_LABELS[newAchievement].description }
        : nextRank.title !== previousRank.title
        ? { title: `Naik pangkat: ${nextRank.title}`, description: `${next.xp} XP terkumpul. Teruskan belajar!` }
        : null;
      previous = next;
      if (!nextNotice) return;
      setNotice(nextNotice);
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => setNotice(null), 4500);
    };
    const unsubscribe = subscribeProgress(refresh);
    return () => { unsubscribe(); if (timer) window.clearTimeout(timer); };
  }, []);

  if (!notice) return null;
  return <div role="status" aria-live="polite" className="fixed left-1/2 top-20 z-[70] w-[min(90vw,22rem)] -translate-x-1/2 rounded-2xl border-2 border-[#FCD882] bg-[#FFF6D5] px-4 py-3 text-center shadow-xl">
    <p className="font-display text-sm font-black text-[#5A3A2A]">✨ {notice.title}</p>
    <p className="mt-0.5 text-xs font-bold text-[#8C7A68]">{notice.description}</p>
  </div>;
}
