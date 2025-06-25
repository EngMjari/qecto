import React, { useEffect, useRef } from "react";

function MiniMap({ lat, lng }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (typeof window.L === "undefined" || !mapRef.current) return;
    if (mapInstance.current) mapInstance.current.remove();

    if (lat && lng) {
      delete window.L.Icon.Default.prototype._getIconUrl;
      window.L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      });

      const position = [lat, lng];
      mapInstance.current = window.L.map(mapRef.current, {
        center: position,
        zoom: 13,
        dragging: false,
        zoomControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        attributionControl: false,
      });
      window.L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      ).addTo(mapInstance.current);
      window.L.marker(position).addTo(mapInstance.current);
    }
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [lat, lng]);

  if (!lat || !lng) {
    return (
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-xs text-gray-500 rounded-xl border border-gray-300 shadow-inner">
        موقعیت ثبت نشده
      </div>
    );
  }

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <a
      href={mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
      title="مشاهده موقعیت روی نقشه"
      style={{ textDecoration: "none" }}
    >
      <div className="w-full h-48 rounded-xl rounded-top-0 border-2 border-blue-200 shadow-md overflow-hidden relative transition group-hover:border-blue-500 group-hover:shadow-lg">
        <div
          ref={mapRef}
          style={{ width: "100%", height: "100%", zIndex: 0 }}
        ></div>
        <span className="absolute left-2 top-2 bg-white/80 text-blue-700 text-xs px-2 py-1 rounded shadow group-hover:bg-blue-50 transition">
          مشاهده روی نقشه
        </span>
      </div>
    </a>
  );
}

export default MiniMap;
