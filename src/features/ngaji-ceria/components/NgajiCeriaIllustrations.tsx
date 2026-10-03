import React from "react";

/** Cute Bubbly Star Mascot SVG */
export function MascotStar({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`drop-shadow-md ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Soft shadow */}
      <ellipse cx="50" cy="90" rx="30" ry="6" fill="rgba(0,0,0,0.12)" />
      {/* Bubbly Star Body */}
      <path
        d="M50 8
           C54 24, 64 34, 80 38
           C64 44, 56 56, 58 72
           C46 62, 34 64, 22 72
           C26 56, 18 44, 2 38
           C18 34, 28 24, 30 8
           Z"
        fill="url(#starGrad)"
        stroke="#D97706"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Cute Eyes */}
      <circle cx="38" cy="38" r="4" fill="#1E293B" />
      <circle cx="62" cy="38" r="4" fill="#1E293B" />
      <circle cx="39.5" cy="36.5" r="1.5" fill="#FFFFFF" />
      <circle cx="63.5" cy="36.5" r="1.5" fill="#FFFFFF" />
      {/* Cheeks */}
      <ellipse cx="32" cy="43" rx="4.5" ry="2.5" fill="#F43F5E" opacity="0.6" />
      <ellipse cx="68" cy="43" rx="4.5" ry="2.5" fill="#F43F5E" opacity="0.6" />
      {/* Happy Smile */}
      <path d="M 43 45 Q 50 52 57 45" fill="none" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
      {/* Cute Peci / Songkok */}
      <path d="M 40 18 Q 50 12 60 18 L 62 25 Q 50 22 38 25 Z" fill="#0F766E" stroke="#0D9488" strokeWidth="1.5" />
      <rect x="48" y="11" width="4" height="4" rx="1" fill="#F59E0B" />
    </svg>
  );
}

/** Playful Crown Badge SVG */
export function CrownBadge({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={`drop-shadow-sm ${className}`} aria-hidden="true">
      <circle cx="40" cy="40" r="36" fill="rgba(var(--c-accent), 0.12)" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
      <circle cx="40" cy="40" r="28" fill="rgb(var(--c-accent))" />
      <path d="M26 48 L22 30 L32 38 L40 24 L48 38 L58 30 L54 48 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="22" cy="28" r="2.5" fill="#EF4444" />
      <circle cx="40" cy="22" r="3" fill="#3B82F6" />
      <circle cx="58" cy="28" r="2.5" fill="#EF4444" />
    </svg>
  );
}

/** Floating Cloud Decoration */
export function BubblyCloud({ className = "w-20 h-10 text-accent/20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" className={className} aria-hidden="true">
      <path
        d="M 20 50 
           A 20 20 0 0 1 30 18 
           A 25 25 0 0 1 75 15 
           A 20 20 0 0 1 105 40 
           A 15 15 0 0 1 100 50 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Rost Musical Tone Badge */
export function RostToneIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} aria-hidden="true">
      <rect width="60" height="60" rx="18" fill="rgba(var(--c-accent), 0.15)" />
      {/* Rost Wave: Datar -> Naik -> Turun */}
      <path d="M12 36 L24 36 L36 20 L48 38" fill="none" stroke="rgb(var(--c-accent))" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="36" r="3.5" fill="rgb(var(--c-accent))" />
      <circle cx="36" cy="20" r="3.5" fill="rgb(var(--c-accent))" />
      <circle cx="48" cy="38" r="3.5" fill="rgb(var(--c-accent))" />
    </svg>
  );
}
