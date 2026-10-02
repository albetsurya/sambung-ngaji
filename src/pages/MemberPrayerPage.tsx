import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { goBack } from "../utils/navigation";
import { useAuth } from "../contexts/AuthContext";
import {
  Calendar,
  MapPin,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Sun,
  Sparkles,
  Moon,
  Navigation,
  Search,
  MapPin as MapPinIcon,
  Pencil,
  MapPin as MapPinSolid,
} from "../components/ui/FontAwesomeIcons";
import { AppLayout, Header } from "../components/layout/AppLayout";
import { MasukButton } from "../components/ui";
import { Button } from "../components/ui";
import { BottomSheet } from "../components/ui";
import { Input } from "../components/ui";
import { useToast } from "../contexts/ToastContext";
import {
  getPrayerTimesForDate,
  getNextPrayer,
  getCurrentPrayer,
  getMonthlySchedule,
  getSunnahTimes,
  type PrayerDay,
  type PrayerKey,
  type SunnahTimeInfo,
} from "../features/ibadah/utils/prayerTimes";
import { usePrayerLocation } from "../features/ibadah/hooks/usePrayerLocation";
import { MapPicker } from "../features/ibadah/components/MapPicker";


export default function MemberPrayerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [now, setNow] = useState<Date>(() => new Date());
  const [copied, setCopied] = useState(false);
  const [showMonthly, setShowMonthly] = useState(false);
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapPickerCoords, setMapPickerCoords] = useState<{ lat: number; lng: number } | null>(null);

  const {
    location,
    autoCoords,
    autoLoading,
    autoError,
    requestAutoLocation,
    setMode,
    setCity,
    setPlace,
    setCustom,
    getEffectiveCoords,
    getDisplayLabel,
    searchCities,
    searchPlaces,
  } = usePrayerLocation();

  const openMapPicker = () => {
    const coords = getEffectiveCoords();
    setMapPickerCoords(coords ? { lat: coords.lat, lng: coords.lng } : null);
    setShowMapPicker(true);
  };

  const handleMapPick = (lat: number, lng: number) => {
    setPlace(lat, lng, `Titik peta (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
    setShowMapPicker(false);
  };

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const coords = getEffectiveCoords();
  const lat = coords?.lat ?? -6.9879;
  const lng = coords?.lng ?? 112.3729;
  const label = getDisplayLabel();

  const today = useMemo(() => getPrayerTimesForDate(now, lat, lng), [now, lat, lng]);
  const next = getNextPrayer(now, lat, lng);
  const current = getCurrentPrayer(now, lat, lng);
  const sunnah = useMemo(() => getSunnahTimes(now, lat, lng), [now, lat, lng]);
  const hijri = formatHijri(now);

  async function handleShare() {
    const lines = today.prayers
      .filter((p) => p.key !== "sunrise")
      .map((p) => `${p.label.padEnd(8, " ")}: ${p.timeFormatted}`);
    const text = [
      `Waktu Sholat · ${label}`,
      `${formatDateId(now)}`,
      ``,
      ...lines,
      ``,
      `Sumber: Sambung Ngaji`,
    ].join("\n");

    try {
      if (navigator.share) {
        await navigator.share({ title: "Waktu Sholat", text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        showToast("Jadwal disalin");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
    }
  }

  function handleLocationClick() {
    setShowLocationSheet(true);
  }

  return (
    <AppLayout showAiChat={false} hideNav={!user}>
      <Header
        title="Waktu Sholat"
        subtitle={label}
        onBack={() => goBack(navigate, user ? "/member" : "/")}
        backLabel="Kembali"
        hideBackOnDesktop
        showSyncButton={false}
        right={
          <>
            {user && (
              <Button
                variant="ghost"
                size="xs"
                iconOnly
                onClick={handleLocationClick}
                aria-label="Ganti lokasi sholat"
              >
                <Navigation size={16} />
              </Button>
            )}
            {!user ? (
              <MasukButton />
            ) : undefined}
          </>
        }
      />

      <div className="px-4 py-4 space-y-4 pb-8">
        
        <div className="relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent-soft to-accent-soft/40 shadow-sm p-5">
          <div
            className="absolute -right-12 -top-12 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: "rgb(var(--c-accent) / 0.08)" }}
          />

          <div className="relative">
            <button
              onClick={handleLocationClick}
              className="flex items-center gap-1.5 mb-3 w-full text-left"
              aria-label="Ganti lokasi sholat"
            >
              <MapPin size={12} className="text-accent/70" />
              <p className="text-[11px] font-medium text-accent/70 truncate flex-1">
                {label}
                {autoLoading && <span className="ml-1 animate-pulse">⟳</span>}
              </p>
              <Navigation size={12} className="text-accent/50 flex-shrink-0" />
            </button>

            <p className="text-[11px] font-semibold uppercase tracking-wide text-accent/70 mb-1.5">
              Menuju {next.prayer.label}
            </p>

            <p className="text-[44px] font-bold text-accent tabular-nums leading-none tracking-[-0.03em]">
              {next.remainingFormatted}
            </p>

            <p className="text-ios-footnote text-accent/80 mt-2">
              Pukul{" "}
              <span className="font-semibold text-accent">
                {next.prayer.timeFormatted}
              </span>{" "}
              WIB
            </p>

            <div className="mt-4 pt-4 border-t border-accent/15 flex items-center justify-between text-[11px] text-accent/70">
              <span>{formatDateId(now)}</span>
              <span className="font-medium">{hijri}</span>
            </div>
          </div>
        </div>

        
        <section>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <p className="text-ios-footnote font-semibold text-surface-text">
              Hari Ini
            </p>
            <Button
              variant="ghost"
              size="xs"
              onClick={handleShare}
              leftIcon={copied ? <Check size={12} /> : <Copy size={12} />}
            >
              {copied ? "Tersalin" : "Bagikan"}
            </Button>
          </div>

          <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden">
            {today.prayers
              .filter((p) => p.key !== "sunrise")
              .map((p, i, arr) => {
                const isCurrent = current === p.key;
                const isNext = next.prayer.key === p.key;
                return (
                  <div
                    key={p.key}
                    className={`flex items-center gap-3 px-4 py-3.5 ${
                      i !== arr.length - 1
                        ? "border-b border-surface-border"
                        : ""
                    } ${isCurrent ? "bg-accent/5" : ""}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isCurrent
                          ? "bg-accent text-white shadow-sm"
                          : isNext
                            ? "bg-accent-soft text-accent"
                            : "bg-surface-card2 text-surface-muted"
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide ${
                          isCurrent ? "text-white" : ""
                        }`}
                      >
                        {p.label.slice(0, 3)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-ios-body font-medium ${
                          isCurrent ? "text-accent" : "text-surface-text"
                        }`}
                      >
                        {p.label}
                      </p>
                      <p className="text-ios-caption text-surface-muted">
                        {p.arabic}
                        {isCurrent && " · waktu aktif"}
                        {isNext && !isCurrent && " · berikutnya"}
                      </p>
                    </div>

                    <p
                      className={`text-ios-body font-semibold tabular-nums ${
                        isCurrent ? "text-accent" : "text-surface-text"
                      }`}
                    >
                      {p.timeFormatted}
                    </p>
                  </div>
                );
              })}
          </div>

        </section>

        
        <section>
          <p className="text-ios-footnote font-semibold text-surface-text mb-2.5 px-1">
            Waktu Sunnah & Info
          </p>

          <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden">
            <SunnahRow info={sunnah.syuruq} />
            <SunnahRow info={sunnah.dhuha} />
            <SunnahRow info={sunnah.nisfulLail} last />
          </div>

          <p className="text-ios-caption text-surface-muted mt-2 px-1 leading-relaxed">
            Syuruq & Dhuha untuk panduan sholat sunnah pagi. Nisful Lail
            (pertengahan malam) jadi batas akhir sholat Isya.
          </p>
        </section>

        
        <section>
          <p className="text-ios-footnote font-semibold text-surface-text mb-2.5 px-1">
            Qiyamul Lail
          </p>

          <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent-soft to-accent-soft/40 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="w-11 h-11 rounded-xl bg-accent text-white flex items-center justify-center flex-shrink-0">
                <span className="text-[16px] font-bold tabular-nums">
                  {sunnah.sepertigaAkhir.timeFormatted.slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ios-body font-medium text-accent">
                  {sunnah.sepertigaAkhir.label}
                </p>
                <p
                  className="text-accent/70 truncate"
                  style={{
                    fontFamily:
                      '"Noto Naskh Arabic", "Amiri", "Scheherazade New", serif',
                    fontSize: "16px",
                  }}
                >
                  {sunnah.sepertigaAkhir.arabic}
                </p>
                <p className="text-ios-caption text-accent/70 mt-0.5">
                  {sunnah.sepertigaAkhir.description}
                </p>
              </div>
              <p className="text-ios-body font-semibold text-accent tabular-nums flex-shrink-0">
                {sunnah.sepertigaAkhir.timeFormatted}
              </p>
            </div>
          </div>
        </section>

        
        <section>
          <button
            onClick={() => setShowMonthly((v) => !v)}
            className="w-full flex items-center justify-between gap-2 rounded-2xl border border-surface-border bg-surface-card px-4 py-3.5 transition-all hover:bg-surface-card2 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center text-accent flex-shrink-0">
                <Calendar size={16} />
              </span>
              <div className="text-left">
                <p className="text-ios-body font-medium text-surface-text">
                  Jadwal Sebulan
                </p>
                <p className="text-ios-caption text-surface-muted">
                  {formatMonthId(now)}
                </p>
              </div>
            </div>
            <ChevronDown
              size={18}
              className={`text-surface-muted flex-shrink-0 transition-transform ${
                showMonthly ? "rotate-180" : ""
              }`}
            />
          </button>

          {showMonthly && <MonthlyTable now={now} />}
        </section>

        
        <div className="rounded-2xl border border-surface-border bg-surface-card2/40 p-3.5">
          <p className="text-ios-caption text-surface-muted leading-relaxed">
            Perhitungan mengikuti metode <strong>Kemenag RI</strong> (Fajr 20°,
            Isha 18°, madzhab Syafi'i, ihtiyati +2 menit). Selisih
            ±2 menit dari jadwal resmi adalah wajar.
          </p>
        </div>
      </div>

      <LocationSettingsBottomSheet
        isOpen={showLocationSheet}
        onClose={() => setShowLocationSheet(false)}
        location={location}
        autoCoords={autoCoords}
        autoLoading={autoLoading}
        autoError={autoError}
        requestAutoLocation={requestAutoLocation}
        setMode={setMode}
        setCity={setCity}
        setPlace={setPlace}
        setCustom={setCustom}
        searchCities={searchCities}
        searchPlaces={searchPlaces}
        onOpenMapPicker={openMapPicker}
      />
      <MapPicker
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        initialLat={mapPickerCoords?.lat}
        initialLng={mapPickerCoords?.lng}
        onPick={handleMapPick}
      />
    </AppLayout>
  );
}


function SunnahRow({
  info,
  last = false,
}: {
  info: SunnahTimeInfo;
  last?: boolean;
}) {
  const icons: Record<string, typeof Sun> = {
    syuruq: Sun,
    dhuha: Sparkles,
    nisfulLail: Moon,
  };

  return (
    <div
      className={
        "flex items-center gap-3 px-4 py-3.5 " +
        (last ? "" : "border-b border-surface-border")
      }
    >
      <div className="w-10 h-10 rounded-xl bg-surface-card2 flex items-center justify-center flex-shrink-0 text-accent">
        {(() => {
          const Icon = icons[info.key] || Sun;
          return <Icon size={18} />;
        })()}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-ios-body font-medium text-surface-text">
          {info.label}
        </p>
        <p className="text-ios-caption text-surface-muted truncate">
          {info.description}
        </p>
      </div>

      <p className="text-ios-body font-semibold text-surface-text tabular-nums flex-shrink-0">
        {info.timeFormatted}
      </p>
    </div>
  );
}


function LocationSettingsBottomSheet({
  isOpen,
  onClose,
  location,
  autoCoords,
  autoLoading,
  autoError,
  requestAutoLocation,
  setMode,
  setCity,
  setPlace,
  searchCities,
  searchPlaces,
  onOpenMapPicker,
}: {
  isOpen: boolean;
  onClose: () => void;
  location: ReturnType<typeof usePrayerLocation>["location"];
  autoCoords: ReturnType<typeof usePrayerLocation>["autoCoords"];
  autoLoading: ReturnType<typeof usePrayerLocation>["autoLoading"];
  autoError: ReturnType<typeof usePrayerLocation>["autoError"];
  requestAutoLocation: ReturnType<typeof usePrayerLocation>["requestAutoLocation"];
  setMode: ReturnType<typeof usePrayerLocation>["setMode"];
  setCity: ReturnType<typeof usePrayerLocation>["setCity"];
  setPlace: ReturnType<typeof usePrayerLocation>["setPlace"];
  setCustom: ReturnType<typeof usePrayerLocation>["setCustom"];
  searchCities: ReturnType<typeof usePrayerLocation>["searchCities"];
  searchPlaces: ReturnType<typeof usePrayerLocation>["searchPlaces"];
  onOpenMapPicker: () => void;
}) {
  const [query, setQuery] = useState("");
  const [customLat, setCustomLat] = useState("");
  const [customLng, setCustomLng] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [placeResults, setPlaceResults] = useState<Awaited<ReturnType<typeof searchPlaces>>>([]);
  const [placeLoading, setPlaceLoading] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const offlineCities = useMemo(() => searchCities(query), [query, searchCities]);

  useEffect(() => {
    if (!isOpen || (location.mode !== "city" && location.mode !== "custom")) return;
    const q = query.trim();
    if (q.length < 3) {
      setPlaceResults([]);
      setPlaceLoading(false);
      setPlaceError(null);
      return;
    }
    let cancelled = false;
    setPlaceLoading(true);
    setPlaceError(null);
    const t = setTimeout(async () => {
      try {
        const res = await searchPlaces(q);
        if (!cancelled) setPlaceResults(res);
      } catch {
        if (!cancelled) {
          setPlaceResults([]);
          setPlaceError("Pencarian gagal, periksa koneksi.");
        }
      } finally {
        if (!cancelled) setPlaceLoading(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, isOpen, location.mode, searchPlaces]);

  const handleAutoClick = () => {
    setMode("auto");
    requestAutoLocation();
  };

  const handleCityClick = (cityId: string) => {
    setCity(cityId);
    onClose();
  };

  const handlePlaceClick = (lat: number, lng: number, label: string) => {
    setPlace(lat, lng, label);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (isNaN(lat) || isNaN(lng)) return;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;
    setPlace(lat, lng, customLabel || `Titik manual (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    onClose();
  };

  return (
    <BottomSheet
      open={isOpen}
      onClose={onClose}
      title="Pengaturan Lokasi Sholat"
    >
      <div className="space-y-4">
        <div className="px-4">
          <label className="block text-ios-caption font-medium text-surface-muted mb-2">
            Mode Lokasi
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleAutoClick}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                location.mode === "auto"
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-surface-border text-surface-text hover:bg-surface-card2"
              }`}
            >
              <div className="flex items-center gap-2">
                <Navigation size={18} className="flex-shrink-0" />
                <div>
                  <p className="text-ios-body font-medium">Otomatis (GPS)</p>
                  <p className="text-ios-caption text-surface-muted">
                    {autoLoading ? "Mendeteksi..." : autoCoords ? "Aktif" : "Minta izin"}
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode("city")}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                location.mode === "city" || location.mode === "custom"
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-surface-border text-surface-text hover:bg-surface-card2"
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPinIcon size={18} className="flex-shrink-0" />
                <div>
                  <p className="text-ios-body font-medium">Cari Tempat</p>
                  <p className="text-ios-caption text-surface-muted">Search, peta, atau koordinat</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {location.mode === "auto" && (
          <div className="px-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation size={18} className="text-accent" />
                <div>
                  <p className="text-ios-body font-medium text-surface-text">Lokasi GPS</p>
                  {autoCoords ? (
                    <p className="text-ios-caption text-surface-muted">
                      Akurasi ±{Math.round(autoCoords.accuracy)}m
                    </p>
                  ) : (
                    <p className="text-ios-caption text-accent">Belum terdeteksi</p>
                  )}
                </div>
              </div>
              <Button size="xs" variant="secondary" onClick={requestAutoLocation} disabled={autoLoading}>
                {autoLoading ? "Deteksi..." : "Deteksi Ulang"}
              </Button>
            </div>
            {autoError && (
              <p className="text-ios-caption text-danger mt-2">{autoError}</p>
            )}
          </div>
        )}

        {(location.mode === "city" || location.mode === "custom") && (
          <div className="px-4 border-t pt-4">
            {(location.place || location.customCoords) && (
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-accent/25 bg-accent-soft px-3 py-2.5">
                <MapPinIcon size={14} className="text-accent flex-shrink-0" />
                <p className="text-ios-footnote font-medium text-accent truncate flex-1">
                  {location.place?.label || location.customCoords?.label}
                </p>
              </div>
            )}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-muted pointer-events-none" />
              <Input
                placeholder="Cari dusun, desa, kota... misal: Latukan"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="max-h-60 overflow-y-auto mt-2">
              {query.trim().length >= 3 ? (
                placeLoading ? (
                  <p className="text-ios-caption text-surface-muted text-center py-4">
                    Mencari tempat...
                  </p>
                ) : placeError ? (
                  <p className="text-ios-caption text-danger text-center py-4">
                    {placeError}
                  </p>
                ) : placeResults.length === 0 ? (
                  <p className="text-ios-caption text-surface-muted text-center py-4">
                    Tempat tidak ditemukan, coba kata kunci lain
                  </p>
                ) : (
                  placeResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePlaceClick(p.lat, p.lng, `${p.name} - ${p.address.split(",").slice(0, 3).join(",")}`)}
                      className="w-full px-3 py-2.5 text-left rounded-xl hover:bg-surface-card2 transition-colors flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-accent-soft flex items-center justify-center text-accent flex-shrink-0">
                        <MapPinIcon size={14} />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-ios-body font-medium text-surface-text truncate">
                          {p.name}
                        </p>
                        <p className="text-ios-caption text-surface-muted truncate">
                          {p.address}
                        </p>
                      </div>
                    </button>
                  ))
                )
              ) : offlineCities.length === 0 ? (
                <p className="text-ios-caption text-surface-muted text-center py-4">
                  Ketik minimal 3 huruf untuk mencari
                </p>
              ) : (
                offlineCities.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleCityClick(city.id)}
                    className="w-full px-3 py-2.5 text-left rounded-xl hover:bg-surface-card2 transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-accent-soft flex items-center justify-center text-accent flex-shrink-0">
                      <MapPinIcon size={14} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-ios-body font-medium text-surface-text truncate">
                        {city.name}
                      </p>
                      <p className="text-ios-caption text-surface-muted truncate">
                        {city.province}
                      </p>
                    </div>
                    {location.cityId === city.id && (
                      <Check size={18} className="text-accent flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <div className="h-px flex-1 bg-surface-border" />
              <p className="text-ios-caption text-surface-muted">atau tentukan titik sendiri</p>
              <div className="h-px flex-1 bg-surface-border" />
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={onOpenMapPicker}
              className="mt-3 w-full"
              leftIcon={<MapPinSolid size={14} />}
            >
              Pilih di Peta
            </Button>

            <form onSubmit={handleCustomSubmit} className="mt-3">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Input
                  label="Latitude"
                  type="number"
                  step="0.0001"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  placeholder="-6.1754"
                  required
                />
                <Input
                  label="Longitude"
                  type="number"
                  step="0.0001"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  placeholder="106.8272"
                  required
                />
              </div>
              <Input
                label="Label (opsional)"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="Misal: Rumah, Kantor, Masjid"
              />
              <Button type="submit" className="mt-3 w-full">
                Simpan Koordinat
              </Button>
            </form>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}


function MonthlyTable({ now }: { now: Date }) {
  const schedule = useMemo(
    () => getMonthlySchedule(now.getFullYear(), now.getMonth()),
    [now.getFullYear(), now.getMonth()],
  );

  const todayIso = formatIso(now);

  return (
    <div className="mt-2 rounded-2xl border border-surface-border bg-surface-card overflow-hidden">
      
      <div className="grid grid-cols-[40px_1fr_1fr_1fr_1fr_1fr] px-3 py-2.5 bg-surface-card2/50 border-b border-surface-border">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-surface-muted">
          Tgl
        </span>
        {(["Subuh", "Dzuhur", "Ashar", "Magrib", "Isya"] as const).map((l) => (
          <span
            key={l}
            className="text-[10px] font-semibold uppercase tracking-wide text-surface-muted text-center"
          >
            {l}
          </span>
        ))}
      </div>

      
      <div className="max-h-[400px] overflow-y-auto">
        {schedule.map((day) => {
          const isToday = formatIso(day.date) === todayIso;
          const wajib = day.prayers.filter((p) => p.key !== "sunrise");
          return (
            <div
              key={formatIso(day.date)}
              className={`grid grid-cols-[40px_1fr_1fr_1fr_1fr_1fr] px-3 py-2 border-b border-surface-border last:border-b-0 items-center ${
                isToday ? "bg-accent/5" : ""
              }`}
            >
              <span
                className={`text-ios-footnote font-semibold tabular-nums ${
                  isToday ? "text-accent" : "text-surface-text"
                }`}
              >
                {day.date.getDate()}
              </span>
              {wajib.map((p) => (
                <span
                  key={p.key}
                  className={`text-[11px] tabular-nums text-center ${
                    isToday ? "text-accent" : "text-surface-muted"
                  }`}
                >
                  {p.timeFormatted}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}


function formatIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateId(d: Date): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return d.toDateString();
  }
}

function formatMonthId(d: Date): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return `${d.getMonth() + 1}/${d.getFullYear()}`;
  }
}

function formatHijri(d: Date): string {
  try {
    return new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return "";
  }
}
