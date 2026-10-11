import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, GraduationCap, Heart, ArrowRight, Check } from '../ui/FontAwesomeIcons';
import { Button } from '../ui';

const SLIDES = [
  {
    id: 'welcome',
    title: 'Selamat Datang di Sambung Ngaji',
    desc: 'Pusat ibadah dan pembelajaran digital dalam genggamanmu.',
    icon: BookOpen,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50'
  },
  {
    id: 'ceria',
    title: 'Belajar Ngaji Jadi Seru',
    desc: 'Metode Tilawati yang interaktif dengan game-game menarik untuk semua usia.',
    icon: GraduationCap,
    color: 'bg-green-500',
    lightColor: 'bg-green-50'
  },
  {
    id: 'personal',
    title: 'Pantau Ibadah Harian',
    desc: 'Catat progres tahfidz, jurnal sholat, dan temukan ketenangan melalui mood tracker.',
    icon: Heart,
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50'
  }
];

export function WelcomeOnboarding({ onFinish }: { onFinish: () => void }) {
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current < SLIDES.length - 1) {
      setCurrent(current + 1);
    } else {
      localStorage.setItem('sambung_ngaji_onboarded', 'true');
      onFinish();
    }
  };

  const activeSlide = SLIDES[current];
  const Icon = activeSlide.icon;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-between p-8">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="flex flex-col items-center"
          >
            <div className={`w-24 h-24 rounded-3xl ${activeSlide.lightColor} flex items-center justify-center mb-8`}>
              <Icon size={40} className={`text-${activeSlide.color.split('-')[1]}-500`} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">
              {activeSlide.title}
            </h2>
            <p className="text-slate-500 leading-relaxed px-4">
              {activeSlide.desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center gap-6 pb-8">
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 transition-all duration-300 rounded-full ${
                i === current ? 'w-8 bg-slate-900' : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={next}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-lg font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
        >
          {current === SLIDES.length - 1 ? (
            <>Mulai Sekarang <Check size={18} /></>
          ) : (
            <>Lanjutkan <ArrowRight size={18} /></>
          )}
        </Button>
      </div>
    </div>
  );
}
