import { Lock } from "../common/FontAwesomeIcons";

export function TranslationLockedNote({
  className = "",
}: {
  className?: string;
}) {
  return (
    <p
      className={`text-ios-caption text-surface-muted leading-relaxed flex items-center gap-1.5 ${className}`}
    >
      <Lock size={12} className="flex-shrink-0" />
      Terjemahan khusus mubaligh
    </p>
  );
}
