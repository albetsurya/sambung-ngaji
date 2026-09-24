import { useNavigate } from "react-router-dom";

/**
 * Tombol Masuk compact untuk header halaman publik.
 * Sengaja ramping (h-8) agar tidak menutupi judul di layar sempit.
 */
export function MasukButton({
  variant = "primary",
}: {
  variant?: "primary" | "secondary";
}) {
  const navigate = useNavigate();
  const to = variant === "primary" ? "/login" : "/daftar";
  const label = variant === "primary" ? "Masuk" : "Daftar";
  return (
    <button
      onClick={() => navigate(to)}
      className={
        "h-8 px-3 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all active:scale-[0.97] shrink-0 " +
        (variant === "primary"
          ? "bg-accent text-white"
          : "border border-surface-border bg-surface-card text-surface-text hover:bg-surface-card2")
      }
    >
      {label}
    </button>
  );
}
