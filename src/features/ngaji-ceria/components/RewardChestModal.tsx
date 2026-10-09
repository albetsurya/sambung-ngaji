import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NGAJI_CERIA_ASSETS } from "../data/assets";
import { takeRewards, subscribeRewards, type PendingReward } from "../pages/games/_shared/progression";
import { playSfx } from "../pages/games/_shared/audio";
import { tapFeedback } from "../../../lib/haptics";

export function RewardChestModal() {
  const [reward, setReward] = useState<PendingReward | null>(null);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const checkQueue = () => {
      if (reward) return; // sedang buka reward
      const pending = takeRewards();
      if (pending.length > 0) {
        // Gabungkan total koin jika ada beberapa hadiah masuk bersamaan
        const totalCoins = pending.reduce((sum, r) => sum + r.coins, 0);
        const labels = pending.map((r) => r.label).join(" & ");
        setReward({ id: pending[0].id, coins: totalCoins, label: labels });
        setOpened(false);
      }
    };

    checkQueue();
    return subscribeRewards(checkQueue);
  }, [reward]);

  if (!reward) return null;

  const handleChestClick = () => {
    if (opened) return;
    tapFeedback([10, 30, 20]);
    playSfx("powerup");
    setOpened(true);
  };

  const handleClaim = () => {
    tapFeedback(12);
    setReward(null);
    setOpened(false);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#2A1A10]/70 backdrop-blur-sm"
      />

      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="relative z-10 w-full max-w-sm rounded-[32px] border-4 border-white bg-gradient-to-b from-[#FFF8EE] to-[#FFF0D4] p-6 text-center shadow-2xl shadow-[#5A3A2A]/40"
      >
        <p className="text-[10px] font-black uppercase tracking-widest text-[#F58A3A]">
          {opened ? "Bonus Didapatkan!" : "Hadiah Menanti"}
        </p>
        <h2 className="mt-1 font-display text-xl font-black text-[#5A3A2A]">
          {reward.label}
        </h2>

        {/* Peti & Animasi Buka */}
        <div className="relative my-6 flex h-36 items-center justify-center">
          <AnimatePresence mode="wait">
            {!opened ? (
              <motion.button
                key="closed"
                type="button"
                onClick={handleChestClick}
                animate={{ scale: [1, 1.05, 1], rotate: [0, -3, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                whileTap={{ scale: 0.9 }}
                className="relative cursor-pointer focus:outline-none"
              >
                <img
                  src={NGAJI_CERIA_ASSETS.petiHarta}
                  alt="Peti Harta"
                  draggable={false}
                  className="h-28 w-28 object-contain drop-shadow-2xl"
                />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#F58A3A] px-3 py-1 text-[10px] font-black text-white shadow-md animate-bounce">
                  Ketuk untuk Buka! 🎁
                </span>
              </motion.button>
            ) : (
              <motion.div
                key="open"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 14 }}
                className="flex flex-col items-center justify-center gap-2"
              >
                {/* Visual Peti Terbuka / Bonus Emas */}
                <div className="relative flex items-center justify-center">
                  <img
                    src={NGAJI_CERIA_ASSETS.petiHartaTerbuka}
                    alt="Peti Terbuka"
                    draggable={false}
                    className="h-24 w-24 object-contain drop-shadow-2xl"
                  />
                  <motion.img
                    initial={{ y: 20, scale: 0 }}
                    animate={{ y: -30, scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    src={NGAJI_CERIA_ASSETS.koinHijaiyah}
                    alt="Koin"
                    draggable={false}
                    className="absolute h-14 w-14 object-contain drop-shadow-xl"
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-2 rounded-full border-2 border-[#FCD882] bg-[#FFF6D5] px-4 py-1.5 shadow-sm"
                >
                  <img
                    src={NGAJI_CERIA_ASSETS.koinHijaiyah}
                    alt="Koin"
                    draggable={false}
                    className="h-5 w-5 object-contain"
                  />
                  <span className="font-display text-lg font-black text-[#5A3A2A]">
                    +{reward.coins} Koin
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {opened && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            type="button"
            onClick={handleClaim}
            className="w-full rounded-2xl bg-[#00662C] py-3 text-sm font-black text-white shadow-md shadow-[#003D1B]/40 hover:bg-[#007C36] active:scale-95"
          >
            Ambil Hadiah ✨
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
