import { motion } from "framer-motion";

const SPARKLES = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  const distance = 70 + (i % 4) * 22;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    size: 8 + (i % 3) * 4,
    delay: (i % 5) * 0.03,
    emoji: i % 3 === 0 ? "⭐" : i % 3 === 1 ? "✨" : "🌟",
  };
});

/**
 * Ledakan kilau emas saat jawaban benar (item roadmap 4B).
 * Ringan (framer-motion, tanpa dependensi confetti) + hormat reduced-motion.
 */
export function SparkleBurst({ burstKey }: { burstKey: string }) {
  return <div key={burstKey} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-visible">
    {SPARKLES.map((spark, i) => <motion.span
      key={i}
      initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
      animate={{ x: spark.x, y: spark.y, scale: [0.4, 1.2, 0.6], opacity: [1, 1, 0] }}
      transition={{ duration: 0.75, delay: spark.delay, ease: "easeOut" }}
      style={{ fontSize: spark.size }}
    >{spark.emoji}</motion.span>)}
  </div>;
}
