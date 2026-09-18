import type { Meeting } from "../../types";

export type GenderTarget = "" | "L" | "P";

export function GenderTargetPicker({
  value,
  onChange,
}: {
  value: GenderTarget;
  onChange: (v: GenderTarget) => void;
}) {
  const options: { value: GenderTarget; label: string }[] = [
    { value: "", label: "Semua" },
    { value: "L", label: "Laki-laki" },
    { value: "P", label: "Perempuan" },
  ];

  return (
    <div className="mb-4">
      <label className="block text-ios-footnote font-medium text-surface-text mb-2 px-1">
        Target Gender
      </label>
      <p className="text-ios-caption text-surface-muted mb-3 px-1">
        Filter jamaah yang tampil di absensi
      </p>
      <div className="flex rounded-xl bg-surface-card2 border border-surface-border overflow-hidden">
        {options.map((opt, idx) => {
          const active = value === opt.value;
          return (
            <div key={opt.value || "all"} className="flex-1 flex">
              {idx > 0 && <div className="w-px bg-surface-border" />}
              <button
                type="button"
                onClick={() => onChange(opt.value)}
                className={`flex-1 min-h-[40px] flex items-center justify-center text-ios-footnote font-medium transition-all duration-200 active:scale-[0.98] ${
                  active
                    ? "bg-accent text-white"
                    : "text-surface-muted hover:bg-surface-card"
                }`}
              >
                {opt.label}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function getGenderTarget(m: Meeting | null | undefined): GenderTarget {
  if (!m || !m.gender_target) return "";
  if (m.gender_target === "L" || m.gender_target === "P") {
    return m.gender_target;
  }
  return "";
}
