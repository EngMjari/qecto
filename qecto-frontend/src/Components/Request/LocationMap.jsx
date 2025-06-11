import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const LocationMap = () => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const geo = navigator.geolocation;

    if (!geo) {
      setError("مرورگر شما از موقعیت مکانی پشتیبانی نمی‌کند.");
      return;
    }

    const watchId = geo.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setError(""); // اگر قبلا خطا بوده، پاک کن
      },
      (err) => {
        setError("عدم دسترسی به موقعیت مکانی. لطفاً دسترسی را فعال کنید.");
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );

    return () => geo.clearWatch(watchId);
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {position ? (
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>موقعیت فعلی شما</Popup>
          </Marker>
        </MapContainer>
      ) : (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          {error || "در حال دریافت موقعیت مکانی..."}
        </div>
      )}
    </div>
  );
};

export default LocationMap;
