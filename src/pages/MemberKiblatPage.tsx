import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  Navigation,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Check,
} from "../components/common/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { useQiblaDirection } from "../hooks/useQiblaDirection";

const LATUKAN = { lat: -6.9879, lng: 112.3729 };

export default function MemberKiblatPage() {
  const navigate = useNavigate();
  const {
    qiblaBearing,
    deviceHeading,
    relativeToDevice,
    coords,
    accuracy,
    permission,
    locationError,
    loading,
    requestLocation,
    requestOrientation,
  } = useQiblaDirection();

  const [usingDefault, setUsingDefault] = useState(false);

  // Auto pakai default Latukan kalau user tidak mau kasih location
  useEffect(() => {
    if (locationError && !coords) {
      setUsingDefault(true);
    }
  }, [locationError, coords]);

  const effectiveBearing = usingDefault
    ? calcBearing(LATUKAN.lat, LATUKAN.lng)
    : qiblaBearing;

  const effectiveRelative = usingDefault
    ? effectiveBearing
    : relativeToDevice;

  const canShowCompass = deviceHeading !== null;
  const needleRotation = canShowCompass
    ? effectiveRelative ?? effectiveBearing ?? 0
    : effectiveBearing ?? 0;

  return (
    <AppLayout hideNav showAiChat={false}>
      <Header
        title="Arah Kiblat"
        subtitle={
          usingDefault
            ? "Menggunakan lokasi default (Latukan)"
            : coords
              ? "Lokasi Anda saat ini"
              : "Mencari lokasi..."
        }
        onBack={() => navigate("/member")}
        backLabel="Home"
        showSyncButton={false}
        right={
          <button
            onClick={() => {
              setUsingDefault(false);
              requestLocation();
            }}
            aria-label="Refresh lokasi"
            title="Refresh lokasi"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-card border border-surface-border text-surface-text transition-all duration-200 hover:bg-surface-card2 active:scale-95"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        }
      />

      <div className="px-4 py-4 space-y-4 pb-8">
        {/* Info lokasi */}
        <div className="rounded-2xl border border-surface-border bg-surface-card px-4 py-3">
          <div className="flex items-start gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center text-accent flex-shrink-0">
              <MapPin size={14} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-ios-footnote font-medium text-surface-text">
                {usingDefault ? "Latukan, Karanggeneng, Lamongan" : "Lokasi GPS"}
              </p>
              {coords && !usingDefault && (
                <p className="text-ios-caption text-surface-muted truncate tabular-nums">
                  {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                  {accuracy !== null && (
                    <span> · ±{Math.round(accuracy)}m</span>
                  )}
                </p>
              )}
              {usingDefault && (
                <p className="text-ios-caption text-surface-muted">
                  Anda bisa aktifkan GPS untuk hasil lebih akurat
                </p>
              )}
              {locationError && !usingDefault && (
                <p className="text-ios-caption text-danger">{locationError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Kompas */}
        <div className="flex flex-col items-center py-4">
          <div className="relative w-[280px] h-[280px]">
            {/* Compass dial — static, selalu utara di atas */}
            <CompassDial />

            {/* Needle kiblat — rotate sesuai bearing atau relative */}
            <div
              className="absolute inset-0 flex items-start justify-center transition-transform duration-300 ease-out"
              style={{
                transform: "rotate(" + needleRotation + "deg)",
              }}
            >
              <div className="flex flex-col items-center pt-1">
                <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-b-[36px] border-l-transparent border-r-transparent border-b-success" />
                <span className="mt-1 text-[10px] font-bold text-success tabular-nums">
                  KIBLAT
                </span>
              </div>
            </div>

            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-3 h-3 rounded-full bg-accent shadow-md" />
            </div>
          </div>

          {/* Bearing info */}
          {effectiveBearing !== null && (
            <div className="mt-6 text-center">
              <p className="text-ios-caption text-surface-muted mb-1">
                Arah kiblat dari utara
              </p>
              <p className="text-[32px] font-bold text-accent tabular-nums leading-none tracking-[-0.02em]">
                {Math.round(effectiveBearing)}°
              </p>
              {canShowCompass && (
                <p className="text-ios-caption text-success mt-2 flex items-center justify-center gap-1">
                  <Check size={12} strokeWidth={2.8} />
                  Kompas aktif. Putar HP sampai panah hijau di atas
                </p>
              )}
              {!canShowCompass && permission === "idle" && (
                <button
                  onClick={requestOrientation}
                  className="mt-3 inline-flex items-center gap-1.5 min-h-[36px] px-4 rounded-xl bg-accent text-white text-ios-footnote font-medium transition-all duration-200 hover:bg-accent-dark active:scale-95"
                >
                  <Compass size={14} />
                  Aktifkan Kompas
                </button>
              )}
              {!canShowCompass && permission === "unsupported" && (
                <p className="text-ios-caption text-warning mt-2 max-w-xs mx-auto leading-relaxed">
                  Perangkat ini tidak mendukung sensor kompas. Silakan arahkan
                  sisi atas HP ke arah <strong>{Math.round(effectiveBearing)}°</strong>{" "}
                  dari utara.
                </p>
              )}
              {!canShowCompass && permission === "denied" && (
                <p className="text-ios-caption text-warning mt-2 max-w-xs mx-auto leading-relaxed">
                  Izin kompas ditolak. Buka pengaturan browser untuk
                  mengizinkan akses sensor.
                </p>
              )}
            </div>
          )}

          {loading && !effectiveBearing && (
            <div className="mt-6 flex items-center gap-2 text-ios-footnote text-surface-muted">
              <span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              Mencari lokasi...
            </div>
          )}
        </div>

        {/* Hint / panduan */}
        <div className="rounded-2xl border border-surface-border bg-surface-card2/40 p-3.5">
          <p className="text-ios-footnote font-medium text-surface-text mb-2 flex items-center gap-1.5">
            <Navigation size={13} className="text-accent" />
            Cara pakai
          </p>
          <ul className="space-y-1.5">
            <li className="flex gap-2">
              <span className="text-accent flex-shrink-0">•</span>
              <span className="text-ios-caption text-surface-muted leading-relaxed">
                Aktifkan GPS & kompas untuk akurasi terbaik
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent flex-shrink-0">•</span>
              <span className="text-ios-caption text-surface-muted leading-relaxed">
                Pegang HP datar, jauhkan dari logam/magnet
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent flex-shrink-0">•</span>
              <span className="text-ios-caption text-surface-muted leading-relaxed">
                Putar HP sampai panah hijau tepat di atas (arah utara kompas)
              </span>
            </li>
          </ul>
        </div>

        {permission === "denied" && (
          <div className="rounded-xl bg-warning-soft border border-warning/20 px-3.5 py-3 flex items-start gap-2.5">
            <AlertTriangle
              size={14}
              className="text-warning flex-shrink-0 mt-0.5"
            />
            <p className="text-ios-caption text-warning leading-relaxed">
              Kompas tidak aktif. Arahkan sisi atas HP ke arah{" "}
              <strong>
                {effectiveBearing !== null
                  ? Math.round(effectiveBearing) + "°"
                  : "—"}
              </strong>{" "}
              dari utara (bisa pakai kompas aplikasi lain).
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Compass Dial                                  */
/* -------------------------------------------------------------------------- */

function CompassDial() {
  const tickAngles = Array.from({ length: 72 }, (_, i) => i * 5); // tiap 5°
  const cardinals = [
    { label: "U", angle: 0, primary: true },        // Utara
    { label: "T", angle: 90, primary: false },      // Timur
    { label: "S", angle: 180, primary: false },     // Selatan
    { label: "B", angle: 270, primary: false },     // Barat
  ];

  return (
    <div className="absolute inset-0 rounded-full border-2 border-surface-border bg-surface-card shadow-sm overflow-hidden">
      {/* Inner circle */}
      <div className="absolute inset-4 rounded-full border border-surface-border/60" />

      {/* Ticks */}
      {tickAngles.map((a) => {
        const major = a % 15 === 0;
        return (
          <div
            key={a}
            className="absolute top-0 left-1/2 origin-bottom"
            style={{
              height: "50%",
              transform: "translateX(-50%) rotate(" + a + "deg)",
              transformOrigin: "center bottom",
            }}
          >
            <div
              className={
                "w-0.5 " +
                (major ? "h-2.5 bg-surface-muted" : "h-1.5 bg-surface-border")
              }
            />
          </div>
        );
      })}

      {/* Cardinal labels */}
      {cardinals.map((c) => {
        const radius = 110;
        const rad = (c.angle - 90) * (Math.PI / 180);
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        return (
          <div
            key={c.label}
            className={
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[13px] font-bold " +
              (c.primary ? "text-danger" : "text-surface-muted")
            }
            style={{
              transform:
                "translate(calc(-50% + " +
                x +
                "px), calc(-50% + " +
                y +
                "px))",
            }}
          >
            {c.label}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Bearing helper                                */
/* -------------------------------------------------------------------------- */

function calcBearing(lat: number, lng: number): number {
  const KAABA_LAT = 21.4224779;
  const KAABA_LNG = 39.8251832;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const phi1 = toRad(lat);
  const phi2 = toRad(KAABA_LAT);
  const dLambda = toRad(KAABA_LNG - lng);

  const x = Math.sin(dLambda) * Math.cos(phi2);
  const y =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);

  return (toDeg(Math.atan2(x, y)) + 360) % 360;
}
