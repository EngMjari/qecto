import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Card from "./Card";
import CardHeader from "./CardHeader";
import "leaflet/dist/leaflet.css";

function MapView({ lat, lng }) {
  if (!lat || !lng) return null;

  const openInGoogleMaps = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      "_blank"
    );
  };

  return (
    <Card>
      <CardHeader>موقعیت ملک</CardHeader>
      <div className="px-5 py-3">
        <div
          className="relative h-60 bg-gray-200 rounded-lg overflow-hidden cursor-pointer transition hover:border-orange-700 hover:border-spacing-1 hover:border-2 hover:scale-105 hover:shadow-xl animate-[pulse_1.5s_ease-in-out]"
          onClick={openInGoogleMaps}
          title="مشاهده در نقشه گوگل"
        >
          <MapContainer
            center={[lat, lng]}
            zoom={15}
            scrollWheelZoom={false}
            dragging={false}
            doubleClickZoom={false}
            zoomControl={false}
            attributionControl={false}
            style={{
              height: "100%",
              width: "100%",
              minHeight: 220,
              pointerEvents: "none",
              transition: "box-shadow 0.3s, transform 0.3s",
              zIndex: 0,
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]}>
              <Popup>موقعیت ملک</Popup>
            </Marker>
          </MapContainer>
          <div
            className="absolute inset-0 bg-transparent"
            style={{ pointerEvents: "auto" }}
          />
        </div>
        <div className="flex-auto justify-between text-xs mt-3 text-gray-600">
          <div className="flex text-base px-1 pt-1 justify-between border-b">
            <span className="text-center">عرض جغرافیایی:</span>
            <span className="text-center">{Number(lat).toFixed(6)}</span>
          </div>
          <div className="flex text-base px-1 pt-1 justify-between">
            <span className="text-center">طول جغرافیایی:</span>
            <span className="text-center">{Number(lng).toFixed(6)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default MapView;
