/* Code-made clay-style SVG decorations: blobs, Islamic star pattern,
   crescent, mini mosque, sparkles. Matte two-tone fills, theme-aware. */

interface DecorProps {
  className?: string;
}

/** Soft organic blob. Fill via className text color (e.g. text-accent/10). */
export function ClayBlob({ className = "" }: DecorProps) {
  return (
    <svg viewBox="0 0 200 200" className={`clay-decor ${className}`} aria-hidden="true">
      <path
        fill="currentColor"
        d="M42 22C66 8 104 6 132 24c30 19 48 52 42 84-6 33-34 60-66 66-32 7-68-6-84-34C5 113 4 78 17 54 24 41 32 27 42 22Z"
      />
      <path
        fill="rgb(255 255 255 / 0.35)"
        d="M52 40c16-10 42-12 60-2-14 1-30 3-42 10-13 7-20 20-22 34-8-14-8-30 4-42Z"
      />
    </svg>
  );
}

/** Repeating 8-point Islamic star band for section dividers/headers. */
export function IslamicPattern({ className = "" }: DecorProps) {
  return (
    <svg className={`clay-decor ${className}`} aria-hidden="true">
      <defs>
        <pattern id="clay-islamic-star" width="48" height="48" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5">
            <rect x="14" y="14" width="20" height="20" rx="2" />
            <rect x="14" y="14" width="20" height="20" rx="2" transform="rotate(45 24 24)" />
            <circle cx="24" cy="24" r="3" fill="currentColor" stroke="none" opacity="0.7" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#clay-islamic-star)" />
    </svg>
  );
}

/** Puffy crescent moon with sleepy highlight. */
export function CrescentMoon({ className = "" }: DecorProps) {
  return (
    <svg viewBox="0 0 120 120" className={`clay-decor ${className}`} aria-hidden="true">
      <path
        fill="currentColor"
        d="M78 12a46 46 0 1 0 30 80A56 56 0 0 1 78 12Z"
      />
      <path
        fill="rgb(255 255 255 / 0.4)"
        d="M52 30a34 34 0 0 0-8 60 40 40 0 0 1 8-60Z"
      />
      <path fill="currentColor" d="M88 34l2.2 5.4 5.4 2.2-5.4 2.2-2.2 5.4-2.2-5.4-5.4-2.2 5.4-2.2 2.2-5.4Z" />
    </svg>
  );
}

/** Cute mini mosque: dome + base + minarets, matte two-tone. */
export function MiniMosque({ className = "" }: DecorProps) {
  return (
    <svg viewBox="0 0 160 120" className={`clay-decor ${className}`} aria-hidden="true">
      <rect x="20" y="52" width="18" height="56" rx="9" fill="currentColor" opacity="0.75" />
      <rect x="122" y="52" width="18" height="56" rx="9" fill="currentColor" opacity="0.75" />
      <circle cx="29" cy="46" r="8" fill="currentColor" opacity="0.9" />
      <circle cx="131" cy="46" r="8" fill="currentColor" opacity="0.9" />
      <rect x="44" y="66" width="72" height="42" rx="12" fill="currentColor" />
      <rect x="50" y="72" width="60" height="10" rx="5" fill="rgb(255 255 255 / 0.35)" />
      <path d="M80 14c-18 8-30 22-30 36h60c0-14-12-28-30-36Z" fill="currentColor" />
      <rect x="77" y="4" width="6" height="12" rx="3" fill="currentColor" opacity="0.9" />
      <rect x="70" y="78" width="20" height="30" rx="10" fill="rgb(0 0 0 / 0.12)" />
    </svg>
  );
}

/** Four-point sparkle for badges and empty states. */
export function StarSparkle({ className = "" }: DecorProps) {
  return (
    <svg viewBox="0 0 60 60" className={`clay-decor ${className}`} aria-hidden="true">
      <path
        fill="currentColor"
        d="M30 4c1.8 12 7 20 22 22-15 2-20.2 10-22 22-1.8-12-7-20-22-22 15-2 20.2-10 22-22Z"
      />
      <path fill="rgb(255 255 255 / 0.5)" d="M26 14c.8 5 3 8.5 9 10-4 .7-6.5 2.5-7.5 6-.5-4-2-7-6-8 2-1.5 3.5-4 4.5-8Z" />
    </svg>
  );
}

interface ClayBackdropProps {
  className?: string;
  patternClassName?: string;
}

/** Absolute decorative backdrop: two blobs + top pattern band. Place inside relative parent. */
export function ClayBackdrop({ className = "", patternClassName = "text-accent" }: ClayBackdropProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <ClayBlob className="absolute -top-16 -right-16 w-56 h-56 text-accent opacity-[0.08]" />
      <ClayBlob className="absolute top-1/3 -left-20 w-64 h-64 text-accent opacity-[0.06] clay-bob-slow" />
      <IslamicPattern className={`absolute top-0 inset-x-0 h-16 opacity-[0.10] ${patternClassName}`} />
    </div>
  );
}
