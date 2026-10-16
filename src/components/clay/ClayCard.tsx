import type { ReactNode } from "react";

export type ClayTone = "accent" | "success" | "warning" | "danger" | "info" | "muted";

type IconType = React.ComponentType<{ size?: number; className?: string }>;

interface ClayCardProps {
  title?: string;
  subtitle?: string;
  icon?: IconType;
  tone?: ClayTone;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Chunky clay section card. Decorative only — no behavior change. */
export function ClayCard({
  title,
  subtitle,
  icon: Icon,
  tone = "muted",
  action,
  children,
  className = "",
}: ClayCardProps) {
  return (
    <section className={`clay p-5 ${className}`}>
      {(title || Icon || action) && (
        <div className="flex items-center gap-3 mb-4">
          {Icon && (
            <span className={`clay-tile clay-tile-${tone} w-11 h-11 flex items-center justify-center shrink-0`}>
              <Icon size={20} className="text-surface-text" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            {title && (
              <h2 className="font-display text-ios-body font-semibold text-surface-text tracking-[-0.01em] truncate">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-ios-caption text-surface-muted truncate">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
