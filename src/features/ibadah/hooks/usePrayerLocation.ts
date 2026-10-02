import { useCallback, useEffect, useState } from "react";
import { CityLocation, searchCities, getCityById } from "../data/indonesianCities";

export type LocationMode = "auto" | "city" | "custom";

export interface PrayerLocation {
  mode: LocationMode;
  cityId?: string;
  customCoords?: { lat: number; lng: number; label: string };
  lastAutoCoords?: { lat: number; lng: number; accuracy: number; timestamp: number; address?: string | null };
}

const STORAGE_KEY = "prayer-location-prefs";
const DEFAULT_LOCATION: PrayerLocation = {
  mode: "auto",
};

function loadStored(): PrayerLocation {
  if (typeof window === "undefined") return DEFAULT_LOCATION;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PrayerLocation;
  } catch {
  }
  return DEFAULT_LOCATION;
}

function saveStored(loc: PrayerLocation) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  } catch {
  }
}

async function reverseGeocode(lat: number, lng: number): Promise<string | undefined> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=id`);
    if (!res.ok) return undefined;
    const data = await res.json();
    const addr = data.address || {};
    const parts = [
      addr.village || addr.hamlet || addr.suburb || addr.neighbourhood,
      addr.city_district || addr.district || addr.county,
      addr.city || addr.regency || addr.municipality,
      addr.state || addr.province,
    ].filter(Boolean);
    return parts.join(", ") || undefined;
  } catch {
    return undefined;
  }
}

export function usePrayerLocation() {
  const [location, setLocation] = useState<PrayerLocation>(DEFAULT_LOCATION);
  const [autoCoords, setAutoCoords] = useState<{ lat: number; lng: number; accuracy: number; address?: string } | null>(null);
  const [autoLoading, setAutoLoading] = useState(false);
  const [autoError, setAutoError] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadStored();
    setLocation(stored);
    if (stored.lastAutoCoords) {
      setAutoCoords({
        lat: stored.lastAutoCoords.lat,
        lng: stored.lastAutoCoords.lng,
        accuracy: stored.lastAutoCoords.accuracy,
        address: stored.lastAutoCoords.address ?? undefined,
      });
    }
  }, []);

  const requestAutoLocation = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setAutoError("Browser tidak mendukung geolokasi");
      return;
    }
    setAutoLoading(true);
    setAutoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        const address = await reverseGeocode(coords.lat, coords.lng);
        setAutoCoords({ ...coords, address });
        setAutoLoading(false);
        if (location.mode === "auto") {
          const updated: PrayerLocation = {
            ...location,
            lastAutoCoords: { ...coords, address, timestamp: Date.now() },
          };
          setLocation(updated);
          saveStored(updated);
        }
      },
      (err) => {
        let msg = err.message || "Gagal mendapatkan lokasi";
        if (err.code === 1) msg = "Izin lokasi ditolak";
        else if (err.code === 2) msg = "Lokasi tidak tersedia";
        else if (err.code === 3) msg = "Waktu permintaan lokasi habis";
        setAutoError(msg);
        setAutoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }, [location.mode]);

  useEffect(() => {
    if (location.mode === "auto" && !autoCoords) {
      requestAutoLocation();
    }
  }, [location.mode, autoCoords, requestAutoLocation]);

  const setMode = useCallback((mode: LocationMode) => {
    const updated: PrayerLocation = { ...location, mode };
    setLocation(updated);
    saveStored(updated);
    if (mode === "auto" && !autoCoords) {
      requestAutoLocation();
    }
  }, [location, autoCoords, requestAutoLocation]);

  const setCity = useCallback((cityId: string) => {
    const city = getCityById(cityId);
    if (!city) return;
    const updated: PrayerLocation = { ...location, mode: "city", cityId };
    setLocation(updated);
    saveStored(updated);
  }, [location]);

  const setCustom = useCallback((lat: number, lng: number, label: string) => {
    const updated: PrayerLocation = {
      ...location,
      mode: "custom",
      customCoords: { lat, lng, label },
    };
    setLocation(updated);
    saveStored(updated);
  }, [location]);

  const getEffectiveCoords = useCallback((): { lat: number; lng: number } | null => {
    switch (location.mode) {
      case "auto":
        if (autoCoords) return { lat: autoCoords.lat, lng: autoCoords.lng };
        if (location.lastAutoCoords) return { lat: location.lastAutoCoords.lat, lng: location.lastAutoCoords.lng };
        return null;
      case "city": {
        const city = location.cityId ? getCityById(location.cityId) : undefined;
        if (city) return { lat: city.lat, lng: city.lng };
        return null;
      }
      case "custom":
        if (location.customCoords) return { lat: location.customCoords.lat, lng: location.customCoords.lng };
        return null;
    }
  }, [location, autoCoords]);

  const getDisplayLabel = useCallback((): string => {
    switch (location.mode) {
      case "auto":
        if (autoCoords?.address) return autoCoords.address;
        if (location.lastAutoCoords?.address) return location.lastAutoCoords.address;
        return autoCoords ? "Lokasi GPS (Otomatis)" : "Mendeteksi lokasi...";
      case "city": {
        const city = location.cityId ? getCityById(location.cityId) : undefined;
        return city ? `${city.name}, ${city.province}` : "Kota tidak ditemukan";
      }
      case "custom":
        return location.customCoords?.label || "Lokasi kustom";
    }
  }, [location, autoCoords]);

  return {
    location,
    autoCoords,
    autoLoading,
    autoError,
    requestAutoLocation,
    setMode,
    setCity,
    setCustom,
    getEffectiveCoords,
    getDisplayLabel,
    searchCities,
  };
}