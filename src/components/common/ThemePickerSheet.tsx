import { Check, Palette, Sun, Moon } from "./FontAwesomeIcons";
import { BottomSheet, GroupedList, ListRow, ChevronRow } from "./index";
import {
  useTheme,
  THEME_PRESETS,
  type ThemePreset,
} from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";

export function ThemePickerSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { preset, setPreset, theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  function pick(key: ThemePreset, label: string) {
    setPreset(key);
    showToast(`Tema ${label} diterapkan`);
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Pilih Tema Aplikasi">
      <GroupedList flush>
        <ListRow onClick={toggleTheme} insetDivider>
          <div className="flex items-center gap-3 w-full">
            <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-ios-body font-medium text-surface-text">
                Mode {theme === "dark" ? "Gelap" : "Terang"}
              </p>
              <p className="text-ios-caption text-surface-muted truncate">
                Ketuk untuk ganti
              </p>
            </div>
            <span
              className={`relative inline-flex items-center w-11 h-6 rounded-full border border-surface-border transition-colors duration-300 shrink-0 ${
                theme === "dark" ? "bg-accent" : "bg-surface-card2"
              }`}
              aria-hidden="true"
            >
              <span
                className={`toggle-knob absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                  theme === "dark" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </span>
          </div>
        </ListRow>
        {THEME_PRESETS.map((t, i) => (
          <ListRow
            key={t.key}
            onClick={() => pick(t.key, t.label)}
            insetDivider={i !== THEME_PRESETS.length - 1}
            leading={
              <span className="w-9 h-9 rounded-xl overflow-hidden shrink-0 flex border border-surface-border">
                {t.swatch.map((c, idx) => (
                  <span
                    key={idx}
                    className="flex-1 h-full"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </span>
            }
          >
            <ChevronRow>
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="min-w-0 flex-1">
                  <p className="text-ios-body font-medium text-surface-text truncate">
                    {t.label}
                  </p>
                  <p className="text-ios-caption text-surface-muted truncate">
                    {t.description}
                  </p>
                </div>
                {preset === t.key && (
                  <Check size={16} className="text-accent shrink-0" />
                )}
              </div>
            </ChevronRow>
          </ListRow>
        ))}
      </GroupedList>
    </BottomSheet>
  );
}

export function ThemePickerRow({
  onClick,
  insetDivider = false,
}: {
  onClick: () => void;
  insetDivider?: boolean;
}) {
  const { preset } = useTheme();
  const current = THEME_PRESETS.find((t) => t.key === preset);

  return (
    <ListRow
      onClick={onClick}
      insetDivider={insetDivider}
      leading={
        <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent shrink-0">
          <Palette size={16} />
        </span>
      }
    >
      <ChevronRow>
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="min-w-0 flex-1">
            <p className="text-ios-body font-medium text-surface-text truncate">
              Tema Aplikasi
            </p>
            <p className="text-ios-caption text-surface-muted truncate">
              {current?.label || "Default"}
            </p>
          </div>
          <span className="flex shrink-0 rounded-full overflow-hidden border border-surface-border">
            {current?.swatch.map((c, i) => (
              <span
                key={i}
                className="w-3 h-3"
                style={{ backgroundColor: c }}
              />
            ))}
          </span>
        </div>
      </ChevronRow>
    </ListRow>
  );
}
