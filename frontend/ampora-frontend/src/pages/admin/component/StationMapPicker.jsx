import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";

// ✅ Separate component for map events (hooks rules follow කරයි)
function LocationPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
}

// ✅ Main component
export default function StationMapPicker({ lat, lng, setForm }) {
  const [position, setPosition] = useState(
    lat && lng ? [lat, lng] : [6.9271, 79.8612],
  );

  useEffect(() => {
    if (lat && lng) {
      setPosition([lat, lng]);
    }
  }, [lat, lng]);

  const handlePick = (latlng) => {
    const newLat = latlng.lat.toFixed(6);
    const newLng = latlng.lng.toFixed(6);
    setPosition([parseFloat(newLat), parseFloat(newLng)]);
    setForm((prev) => ({
      ...prev,
      latitude: newLat,
      longitude: newLng,
    }));
  };

  // Check for window object (for SSR)
  if (typeof window === "undefined") {
    return <div style={{ height: 250, width: "100%" }}>Loading map...</div>;
  }

  return (
    <div style={{ height: 250, width: "100%", borderRadius: 12 }}>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "100%", width: "100%", borderRadius: 12 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationPicker onPick={handlePick} />
        <Marker position={position} />
      </MapContainer>
    </div>
  );
}
