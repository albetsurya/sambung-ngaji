import { useCallback, useEffect, useMemo, useState } from "react";

/* -------------------------------------------------------------------------- */
/*                              Konstanta                                     */
/* -------------------------------------------------------------------------- */

const KAABA_LAT = 21.4224779;
const KAABA_LNG = 39.8251832;

/* -------------------------------------------------------------------------- */
/*                              Types                                         */
/* -------------------------------------------------------------------------- */

export type PermissionState =
  | "idle"
  | "pending"
  | "granted"
  | "denied"
  | "unsupported";

export interface QiblaState {
  /** Bearing kiblat dari utara (derajat, 0-360) */
  qiblaBearing: number | null;
  /** Heading device (arah kompas device menghadap) — null kalau tidak ada sensor */
  deviceHeading: number | null;
  /** Relative: kiblat dari device = deviceHeading - qiblaBearing (bisa negatif) */
  relativeToDevice: number | null;
  /** Geolocation */
  coords: { lat: number; lng: number } | null;
  accuracy: number | null;
  /** Permission state */
  permission: PermissionState;
  locationError: string | null;
  loading: boolean;
  /** Fungsi */
  requestLocation: () => void;
  requestOrientation: () => void;
}

/* -------------------------------------------------------------------------- */
/*                              Bearing calc                                  */
/* -------------------------------------------------------------------------- */

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function calculateQiblaBearing(lat: number, lng: number): number {
  const phi1 = toRad(lat);
  const phi2 = toRad(KAABA_LAT);
  const deltaLambda = toRad(KAABA_LNG - lng);

  const x = Math.sin(deltaLambda) * Math.cos(phi2);
  const y =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const theta = Math.atan2(x, y);
  return (toDeg(theta) + 360) % 360;
}

/* -------------------------------------------------------------------------- */
/*                              Hook                                          */
/* -------------------------------------------------------------------------- */

export function useQiblaDirection(): QiblaState {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [permission, setPermission] = useState<PermissionState>("idle");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const qiblaBearing = useMemo(() => {
    if (!coords) return null;
    return calculateQiblaBearing(coords.lat, coords.lng);
  }, [coords]);

  const relativeToDevice = useMemo(() => {
    if (qiblaBearing === null || deviceHeading === null) return null;
    let r = qiblaBearing - deviceHeading;
    // Normalize ke -180..180
    while (r > 180) r -= 360;
    while (r < -180) r += 360;
    return r;
  }, [qiblaBearing, deviceHeading]);

  /* ------------------------------ Geolocation ----------------------------- */

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("Browser tidak mendukung geolokasi");
      return;
    }
    setLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setAccuracy(pos.coords.accuracy);
        setLoading(false);
      },
      (err) => {
        let msg = err.message || "Gagal mendapatkan lokasi";
        if (err.code === 1) msg = "Izin lokasi ditolak";
        else if (err.code === 2) msg = "Lokasi tidak tersedia";
        else if (err.code === 3) msg = "Waktu permintaan lokasi habis";
        setLocationError(msg);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    );
  }, []);

  /* --------------------------- Device orientation -------------------------- */

  const requestOrientation = useCallback(async () => {
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) {
      setPermission("unsupported");
      return;
    }

    // iOS 13+ butuh requestPermission di user gesture
    type OrientationWithPermission = typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    const Orientation = window.DeviceOrientationEvent as OrientationWithPermission;

    if (typeof Orientation.requestPermission === "function") {
      setPermission("pending");
      try {
        const result = await Orientation.requestPermission();
        setPermission(result === "granted" ? "granted" : "denied");
      } catch {
        setPermission("denied");
      }
    } else {
      // Android langsung granted
      setPermission("granted");
    }
  }, []);

  /* --------------------- Listener: device orientation --------------------- */

  useEffect(() => {
    if (permission !== "granted") return;

    function onOrient(e: DeviceOrientationEvent) {
      const ev = e as DeviceOrientationEvent & {
        webkitCompassHeading?: number;
      };

      // iOS — webkitCompassHeading langsung kompas (0=N, 90=E, dst)
      if (typeof ev.webkitCompassHeading === "number") {
        setDeviceHeading(ev.webkitCompassHeading);
        return;
      }

      // Android — pakai alpha (0 = north, tapi bisa absolute/relative)
      if (typeof e.alpha === "number") {
        // Absolute orientation: alpha = 0 berarti menghadap utara
        // Untuk compass heading, kita pakai 360 - alpha
        setDeviceHeading((360 - e.alpha) % 360);
      }
    }

    // Prefer deviceorientationabsolute kalau ada (Android).
    // Cast ke Window agar TS tidak narrowing ke `never`.
    // Cast ke any — supaya TS tidak narrowing ke `never` setelah cek `in`.
    // `deviceorientationabsolute` tidak ada di lib.dom bawaan TS.
    const win: any = window;
    const hasAbsolute = "ondeviceorientationabsolute" in win;

    if (hasAbsolute) {
      win.addEventListener(
        "deviceorientationabsolute",
        onOrient as EventListener,
      );
      return () => {
        win.removeEventListener(
          "deviceorientationabsolute",
          onOrient as EventListener,
        );
      };
    }

    win.addEventListener("deviceorientation", onOrient as EventListener);
    return () => {
      win.removeEventListener("deviceorientation", onOrient as EventListener);
    };
  }, [permission]);

  /* -------------------------- Auto-start sekali --------------------------- */

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
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
  };
}
