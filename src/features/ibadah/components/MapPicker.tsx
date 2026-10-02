import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X } from "../../../components/ui/FontAwesomeIcons";
import { Button } from "../../../components/ui/Button";

export function MapPicker({
  isOpen,
  onClose,
  initialLat,
  initialLng,
  onPick,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
  onPick: (lat: number, lng: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [position, setPosition] = useState<[number, number]>([
    initialLat ?? -6.1754,
    initialLng ?? 106.8272,
  ]);

  useEffect(() => {
    if (isOpen) {
      setPosition([initialLat ?? -6.1754, initialLng ?? 106.8272]);
    }
  }, [isOpen, initialLat, initialLng]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    const map = L.map(containerRef.current, {
      center: position,
      zoom: 15,
      scrollWheelZoom: true,
    });
    mapRef.current = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);
    const onMove = () => {
      const c = map.getCenter();
      setPosition([c.lat, c.lng]);
    };
    map.on("moveend", onMove);
    setTimeout(() => map.invalidateSize(), 150);
    return () => {
      map.off("moveend", onMove);
      map.remove();
      mapRef.current = null;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm anim-fade" onClick={onClose}>
      <div className="app-shell sheet sheet-narrow relative w-full h-[80vh] max-h-[600px] bg-surface-card surface-shift rounded-t-[28px] md:rounded-[24px] border-t md:border border-surface-border shadow-2xl flex flex-col anim-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-3 pb-2 md:pt-5">
          <h3 className="text-ios-nav font-semibold text-surface-text">Pilih Lokasi di Peta</h3>
          <Button variant="ghost" size="xs" iconOnly onClick={onClose} aria-label="Tutup">
            <X size={16} />
          </Button>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <div ref={containerRef} className="absolute inset-0" style={{ minHeight: 200 }} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[500]">
            <div className="relative w-12 h-12">
              <div className="absolute left-1/2 top-0 w-[2px] h-1/2 -translate-x-1/2 bg-accent" />
              <div className="absolute left-1/2 bottom-0 w-[2px] h-1/2 -translate-x-1/2 bg-accent" />
              <div className="absolute top-1/2 left-0 w-1/2 h-[2px] -translate-y-1/2 bg-accent" />
              <div className="absolute top-1/2 right-0 w-1/2 h-[2px] -translate-y-1/2 bg-accent" />
              <div className="absolute left-1/2 top-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-transparent" />
            </div>
            <div className="absolute bottom-[60px] left-1/2 -translate-x-1/2">
              <span className="bg-surface-card/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-ios-caption font-medium text-surface-text shadow-lg whitespace-nowrap">
                Titik terpilih
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 pb-4 md:pb-5 border-t border-surface-border">
          <div className="text-ios-caption text-surface-muted text-center mb-3">
            Lat: {position[0].toFixed(6)} &nbsp;|&nbsp; Lng: {position[1].toFixed(6)}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Batal
            </Button>
            <Button className="flex-1" onClick={() => { onPick(position[0], position[1]); onClose(); }}>
              Gunakan Titik Ini
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
