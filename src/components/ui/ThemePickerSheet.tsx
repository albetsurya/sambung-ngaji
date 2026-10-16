import { Check, Palette, Sun, Moon } from "./FontAwesomeIcons";
import { BottomSheet, GroupedList, ListRow, ChevronRow } from "./index";
import { Segmented } from "./Segmented";
import {
  useTheme,
  THEME_PRESETS,
  PRESET_GROUPS,
  type ThemePreset,
  type ThemeMode,
} from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";

export function ThemePickerSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { preset, setPreset, mode, setMode, theme } = useTheme();
  const { showToast } = useToast();

  function pick(key: ThemePreset, label: string) {
    setPreset(key);
    showToast(`Tema ${label} diterapkan`);
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Pilih Tema Aplikasi">
      <div className="px-1 pt-1 pb-3">
        <Segmented<ThemeMode>
          options={[
            { value: "light", label: "Terang", icon: <Sun size={14} /> },
            { value: "dark", label: "Gelap", icon: <Moon size={14} /> },
            { value: "system", label: "Sistem", icon: <Palette size={14} /> },
          ]}
          value={mode}
          onChange={setMode}
          ariaLabel="Mode tampilan"
        />
        <p className="text-ios-caption text-surface-muted mt-2 px-1">
          {mode === "system"
            ? `Mengikuti sistem (${theme === "dark" ? "gelap" : "terang"} saat ini).`
            : mode === "dark"
              ? "Mode gelap aktif."
              : "Mode terang aktif."}
        </p>
      </div>
      {PRESET_GROUPS.map((g) => (
        <div key={g.key} className="mb-3">
          <p className="text-ios-footnote font-semibold text-surface-text px-4 mb-0.5">
            {g.label}
          </p>
          <p className="text-ios-caption text-surface-muted px-4 mb-1.5">
            {g.description}
          </p>
          <GroupedList flush>
            {THEME_PRESETS.filter((t) => t.group === g.key).map((t, i, arr) => (
              <ListRow
                key={t.key}
                onClick={() => pick(t.key, t.label)}
                insetDivider={i !== arr.length - 1}
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
        </div>
      ))}
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
