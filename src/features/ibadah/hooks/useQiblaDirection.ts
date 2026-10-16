import { useCallback, useEffect, useMemo, useState } from "react";


const KAABA_LAT = 21.4224779;
const KAABA_LNG = 39.8251832;


export type PermissionState =
  | "idle"
  | "pending"
  | "granted"
  | "denied"
  | "unsupported";

export interface QiblaState {
  qiblaBearing: number | null;
  deviceHeading: number | null;
  relativeToDevice: number | null;
  coords: { lat: number; lng: number } | null;
  accuracy: number | null;
  permission: PermissionState;
  locationError: string | null;
  loading: boolean;
  requestLocation: () => void;
  requestOrientation: () => void;
}


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
    while (r > 180) r -= 360;
    while (r < -180) r += 360;
    return r;
  }, [qiblaBearing, deviceHeading]);


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


  const requestOrientation = useCallback(async () => {
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) {
      setPermission("unsupported");
      return;
    }

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
      setPermission("granted");
    }
  }, []);


  useEffect(() => {
    if (permission !== "granted") return;

    function onOrient(e: DeviceOrientationEvent) {
      const ev = e as DeviceOrientationEvent & {
        webkitCompassHeading?: number;
      };

      if (typeof ev.webkitCompassHeading === "number") {
        setDeviceHeading(ev.webkitCompassHeading);
        return;
      }

      if (typeof e.alpha === "number") {
        setDeviceHeading((360 - e.alpha) % 360);
      }
    }

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
