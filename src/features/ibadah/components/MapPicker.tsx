import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { X } from "../../../components/ui/FontAwesomeIcons";
import { Button } from "../../../components/ui/Button";

function MapMarker({ position, onDragEnd }: { position: [number, number]; onDragEnd: (pos: [number, number]) => void }) {
  const map = useMapEvents({
    moveend() {
      const center = map.getCenter();
      onDragEnd([center.lat, center.lng]);
    },
  });
  return (
    <Marker
      position={position}
      draggable
      opacity={0}
      eventHandlers={{
        dragend: (e: any) => onDragEnd([e.target.getLatLng().lat, e.target.getLatLng().lng]),
      }}
    />
  );
}

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
  const [position, setPosition] = useState<[number, number]>([
    initialLat ?? -6.1754,
    initialLng ?? 106.8272,
  ]);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setMapReady(true);
        mapRef.current?.invalidateSize();
      }, 100);
    }
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
          {mapReady && (
            <MapContainer
              ref={mapRef}
              center={position}
              zoom={15}
              scrollWheelZoom={true}
              className="absolute inset-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
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
              <MapMarker position={position} onDragEnd={setPosition} />
            </MapContainer>
          )}
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