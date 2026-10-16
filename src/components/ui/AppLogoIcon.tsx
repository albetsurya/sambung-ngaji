import { useTheme } from "../../contexts/ThemeContext";

export function AppLogoIcon({ size = 48, className = "" }: { size?: number; className?: string }) {
  const { theme } = useTheme();

  return (
    <img
      src={`/logo-sambung-ngaji-v2-${theme}.svg`}
      alt=""
      width={size}
      height={size}
      className={`block object-contain ${className}`}
      aria-hidden="true"
      draggable={false}
    />
  );
}
