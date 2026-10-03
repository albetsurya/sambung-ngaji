import type { ClayTone } from "./ClayCard";

type IconType = React.ComponentType<{ size?: number; className?: string }>;

interface ClayTileProps {
  label: string;
  description?: string;
  icon: IconType;
  tone?: ClayTone;
  onClick?: () => void;
  badge?: number;
}

/** Chunky pastel menu tile for member home grids. */
export function ClayTile({
  label,
  description,
  icon: Icon,
  tone = "muted",
  onClick,
  badge,
}: ClayTileProps) {
  return (
    <button
      onClick={onClick}
      className="clay clay-pressable relative flex flex-col items-center text-center gap-2 !rounded-3xl p-4 w-full"
    >
      {typeof badge === "number" && badge > 0 && (
        <span className="absolute -top-2 -right-2 min-w-[24px] h-6 px-1.5 rounded-full bg-danger text-white text-[11px] font-bold flex items-center justify-center shadow-md">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      <span className={`clay-tile clay-tile-${tone} w-14 h-14 flex items-center justify-center`}>
        <Icon size={24} className="text-surface-text" />
      </span>
      <span className="font-display text-ios-subhead font-semibold text-surface-text leading-tight">
        {label}
      </span>
      {description && (
        <span className="text-ios-caption text-surface-muted leading-snug">
          {description}
        </span>
      )}
    </button>
  );
}
