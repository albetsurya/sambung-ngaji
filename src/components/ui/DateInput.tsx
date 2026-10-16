import { useEffect, useRef, useState } from "react";
import { Calendar } from "./FontAwesomeIcons";

interface Props {
  label?: string;
  value: string;
  onChange: (isoDate: string) => void;
  hint?: string;
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
}

function isoToDisplay(iso: string): string {
  if (!iso) return "";
  const parts = iso.slice(0, 10).split("-");
  if (parts.length !== 3) return "";
  const [y, m, d] = parts;
  return `${d}-${m}-${y}`;
}

function displayToIso(display: string): string | null {
  const parts = display.split("-");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  if (d.length !== 2 || m.length !== 2 || y.length !== 4) return null;
  const day = Number(d);
  const month = Number(m);
  const year = Number(y);
  if (!day || !month || !year) return null;
  const test = new Date(year, month - 1, day);
  if (
    test.getFullYear() !== year ||
    test.getMonth() !== month - 1 ||
    test.getDate() !== day
  ) {
    return null;
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function DateInput({
  label,
  value,
  onChange,
  hint,
  min,
  max,
  required,
  disabled,
}: Props) {
  const [display, setDisplay] = useState(() => isoToDisplay(value));
  const [focused, setFocused] = useState(false);
  const nativeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!focused) {
      setDisplay(isoToDisplay(value));
    }
  }, [value, focused]);

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    let raw = e.target.value.replace(/[^0-9]/g, "").slice(0, 8);
    let formatted = raw;
    if (raw.length > 4) {
      formatted = `${raw.slice(0, 2)}-${raw.slice(2, 4)}-${raw.slice(4)}`;
    } else if (raw.length > 2) {
      formatted = `${raw.slice(0, 2)}-${raw.slice(2)}`;
    }
    setDisplay(formatted);

    if (raw.length === 8) {
      const iso = displayToIso(formatted);
      if (iso) onChange(iso);
    }
  }

  function handleBlur() {
    setFocused(false);
    const iso = displayToIso(display);
    if (!iso && display.length > 0) {
      setDisplay(isoToDisplay(value));
    } else if (iso) {
      onChange(iso);
      setDisplay(isoToDisplay(iso));
    }
  }

  function openNativePicker() {
    const el = nativeRef.current;
    if (!el) return;
    if (typeof (el as any).showPicker === "function") {
      try {
        (el as any).showPicker();
      } catch {
        el.focus();
      }
    } else {
      el.focus();
    }
  }

  return (
    <label className="block mb-4">
      {label && (
        <span className="block text-ios-footnote font-medium text-surface-muted mb-2 px-1">
          {label}
        </span>
      )}
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          placeholder="DD-MM-YYYY"
          value={display}
          onChange={handleTextChange}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          maxLength={10}
          required={required}
          disabled={disabled}
          className="w-full min-h-[48px] rounded-2xl border border-surface-border bg-surface-card pl-4 pr-12 text-[16px] text-surface-text placeholder:text-surface-muted/50 shadow-sm transition-all focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={openNativePicker}
          disabled={disabled}
          aria-label="Buka kalender"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center text-surface-muted transition-colors hover:bg-surface-card2 hover:text-accent active:scale-[0.95] disabled:opacity-40"
        >
          <Calendar size={16} />
        </button>
        <input
          ref={nativeRef}
          type="date"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setDisplay(isoToDisplay(e.target.value));
          }}
          min={min}
          max={max}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute right-0 bottom-0 w-1 h-1 opacity-0 pointer-events-none"
        />
      </div>
      {hint && (
        <span className="block text-ios-caption text-surface-muted mt-2 px-1">
          {hint}
        </span>
      )}
    </label>
  );
}
