import type { Meeting } from "../../types";
import { Segmented } from "../common/Segmented";

export type GenderTarget = "" | "L" | "P";

export function GenderTargetPicker({
  value,
  onChange,
}: {
  value: GenderTarget;
  onChange: (v: GenderTarget) => void;
}) {
  return (
    <div className="mb-4">
      <label className="block text-ios-footnote font-medium text-surface-text mb-2 px-1">
        Target Gender
      </label>
      <p className="text-ios-caption text-surface-muted mb-3 px-1">
        Filter jamaah yang tampil di absensi
      </p>
      <Segmented<GenderTarget>
        ariaLabel="Target gender"
        size="sm"
        value={value}
        onChange={onChange}
        options={[
          { value: "", label: "Semua" },
          { value: "L", label: "Laki-laki" },
          { value: "P", label: "Perempuan" },
        ]}
      />
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
