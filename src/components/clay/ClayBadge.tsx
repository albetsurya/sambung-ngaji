import { Star, Trophy, Heart } from "../ui/FontAwesomeIcons";
import type { ClayTone } from "./ClayCard";

type IconType = React.ComponentType<{ size?: number; className?: string }>;

const BADGE_ICONS: Record<string, IconType> = {
  star: Star,
  trophy: Trophy,
  heart: Heart,
};

interface ClayBadgeProps {
  icon?: keyof typeof BADGE_ICONS;
  tone?: ClayTone;
  label: string;
  sublabel?: string;
  size?: number;
}

/** Puffy reward badge (gamification): clay ring + pastel core + label. */
export function ClayBadge({
  icon = "star",
  tone = "warning",
  label,
  sublabel,
  size = 72,
}: ClayBadgeProps) {
  const Icon = BADGE_ICONS[icon];
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span
        className={`clay-badge-ring clay-tile-${tone} flex items-center justify-center`}
        style={{ width: size, height: size }}
      >
        <Icon size={size * 0.42} className="text-surface-text" />
      </span>
      <span>
        <span className="block font-display text-ios-subhead font-semibold text-surface-text leading-tight">
          {label}
        </span>
        {sublabel && (
          <span className="block text-ios-caption text-surface-muted leading-snug">
            {sublabel}
          </span>
        )}
      </span>
    </div>
  );
}
