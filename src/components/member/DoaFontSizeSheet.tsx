import { BottomSheet } from "../common";
import { Check } from "../common/FontAwesomeIcons";
import {
  useDoaFontSize,
  FONT_SIZE_SPECS,
  type DoaFontSize,
} from "../../hooks/useDoaFontSize";

interface DoaFontSizeSheetProps {
  open: boolean;
  onClose: () => void;
}

const ORDER: DoaFontSize[] = ["small", "medium", "large"];

const PREVIEWS: Record<DoaFontSize, string> = {
  small: "A",
  medium: "A",
  large: "A",
};

export function DoaFontSizeSheet({ open, onClose }: DoaFontSizeSheetProps) {
  const { size, setSize } = useDoaFontSize();

  function handleSelect(next: DoaFontSize) {
    setSize(next);
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Ukuran Teks">
      <div className="mb-3">
        <p className="text-ios-footnote text-surface-muted leading-relaxed">
          Pilih ukuran yang paling nyaman untuk Anda. Pengaturan ini akan
          tersimpan otomatis.
        </p>
      </div>

      <div className="space-y-2">
        {ORDER.map((key) => {
          const spec = FONT_SIZE_SPECS[key];
          const active = size === key;
          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={
                "w-full rounded-2xl border p-3.5 flex items-center gap-3 transition-all duration-200 active:scale-[0.99] " +
                (active
                  ? "border-accent bg-accent-soft"
                  : "border-surface-border bg-surface-card hover:bg-surface-card2")
              }
            >
              <span
                className={
                  "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 " +
                  (active
                    ? "bg-accent text-white"
                    : "bg-surface-card2 text-surface-muted")
                }
                style={{
                  fontFamily:
                    '"Noto Naskh Arabic", "Amiri", "Scheherazade New", serif',
                  fontSize:
                    key === "small" ? 16 : key === "medium" ? 22 : 28,
                  fontWeight: 400,
                }}
              >
                {PREVIEWS[key]}
              </span>

              <div className="flex-1 min-w-0 text-left">
                <p className="text-ios-body font-medium text-surface-text">
                  {spec.label}
                </p>
                <p className="text-ios-caption text-surface-muted">
                  Arab {spec.arab}px · Latin {spec.body}px
                </p>
              </div>

              {active && (
                <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0">
                  <Check size={13} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-ios-caption text-surface-muted text-center leading-relaxed">
        Perubahan berlaku langsung ke semua doa.
      </p>
    </BottomSheet>
  );
}
