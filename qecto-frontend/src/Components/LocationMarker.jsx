import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import inside from "point-in-polygon";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const geojsonPolygon = {
  type: "Polygon",
  coordinates: [
    [
      [50.590212362051886, 36.96766023426457],
      [50.5914709880866, 36.956276481888864],
      [50.5221434541171, 36.89465778643333],
      [50.52270742928923, 36.88304612453676],
      [50.50501790690316, 36.86986678186494],
      [50.48161237886231, 36.878936122179596],
      [50.46779202377536, 36.87612157433624],
      [50.43920484359003, 36.861254894968866],
      [50.4285744969435, 36.83925669014208],
      [50.428354122562865, 36.78156881656926],
      [50.42959732754511, 36.746496677658286],
      [50.42728563665946, 36.73909842914537],
      [50.431129968889906, 36.724142157498704],
      [50.41588819229656, 36.695175129339944],
      [50.36417749579391, 36.63892590202046],
      [50.422388889546966, 36.62156579170096],
      [50.51931971366102, 36.57356409481619],
      [50.60825614917576, 36.52266789344313],
      [50.66462418503323, 36.508157328171606],
      [50.71518744143344, 36.48139515480601],
      [50.84784135555728, 36.4001578213968],
      [50.843652863671565, 36.394592924895576],
      [50.85714213078475, 36.34634708835816],
      [50.851139451286, 36.28994879431359],
      [51.139337480281824, 36.19952258563684],
      [51.20745947614435, 36.162609308539146],
      [51.261642823092245, 36.189623337864575],
      [51.2903603878089, 36.17631231684834],
      [51.300146968554316, 36.166697138991466],
      [51.35803376310031, 36.15933485681933],
      [51.42642407781321, 36.15969726366225],
      [51.47681958703498, 36.12868865580025],
      [51.59358191609928, 36.096736320271916],
      [51.703853225540286, 36.03835128431906],
      [51.927704349059695, 36.57768263764011],
      [51.71570839823494, 36.593518607974815],
      [51.61003706013258, 36.62051516441748],
      [51.446770375580456, 36.68258085088411],
      [51.32101199842646, 36.697419971998045],
      [51.097368013217874, 36.736012590588885],
      [50.939869490507505, 36.7895994310566],
      [50.88701007906511, 36.82413590088986],
      [50.80431851914253, 36.86168602144518],
      [50.77432535664312, 36.878299428136515],
      [50.70432873318623, 36.90475213715273],
      [50.681525659235376, 36.91814286821874],
      [50.66228990143429, 36.94305120451837],
      [50.590212362051886, 36.96766023426457],
    ],
  ],
};

const isInsidePolygon = (latlng) => {
  const point = [latlng.lng, latlng.lat];
  return inside(point, geojsonPolygon.coordinates[0]);
};

const LocationMarker = ({ onLocationChange, lat: propLat, lng: propLng }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // مقدار پیش‌فرض به مختصات شما تغییر داده شده
  const [lat, setLat] = useState(propLat ?? 36.726217);
  const [lng, setLng] = useState(propLng ?? 51.104315);

  // بروزرسانی وقتی props تغییر کند
  useEffect(() => {
    if (
      propLat !== undefined &&
      propLng !== undefined &&
      (propLat !== lat || propLng !== lng)
    ) {
      setLat(propLat);
      setLng(propLng);
      if (markerRef.current) {
        const point = L.latLng(propLat, propLng);
        markerRef.current.setLatLng(point);
        if (mapRef.current) {
          mapRef.current.setView(point, mapRef.current.getZoom());
        }
      }
    }
  }, [propLat, propLng]);

  useEffect(() => {
    const initialLatLng = [lat, lng];

    mapRef.current = L.map("map").setView(initialLatLng, 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapRef.current);

    markerRef.current = L.marker(initialLatLng, { draggable: true }).addTo(
      mapRef.current
    );

    markerRef.current.on("dragend", () => {
      const pos = markerRef.current.getLatLng();

      if (isInsidePolygon(pos)) {
        setLat(pos.lat.toFixed(6));
        setLng(pos.lng.toFixed(6));
        onLocationChange && onLocationChange({ lat: pos.lat, lng: pos.lng });
      } else {
        toast.error("مختصات خارج از محدوده مجاز است.");
        markerRef.current.setLatLng([lat, lng]);
      }
    });

    mapRef.current.on("click", (e) => {
      if (isInsidePolygon(e.latlng)) {
        markerRef.current.setLatLng(e.latlng);
        setLat(e.latlng.lat.toFixed(6));
        setLng(e.latlng.lng.toFixed(6));
        onLocationChange && onLocationChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      } else {
        toast.error("موقعیت انتخاب شده خارج از محدوده مجاز است.");
      }
    });

    return () => {
      mapRef.current.remove();
    };
  }, []);

  const handleManualChange = () => {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      toast.error("مختصات نامعتبر است.");
      return;
    }

    const point = L.latLng(parsedLat, parsedLng);

    if (isInsidePolygon(point)) {
      markerRef.current.setLatLng(point);
      mapRef.current.setView(point, 13);
      onLocationChange && onLocationChange({ lat: parsedLat, lng: parsedLng });
    } else {
      toast.error("مختصات خارج از محدوده مجاز است.");
    }
  };

  return (
    <div>
      <div className="mb-3 d-flex gap-2 align-items-center">
        <input
          type="number"
          step="0.000001"
          className="form-control"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          placeholder="عرض جغرافیایی (lat)"
        />
        <input
          type="number"
          step="0.000001"
          className="form-control"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          placeholder="طول جغرافیایی (lng)"
        />
        <button className="btn btn-primary" onClick={handleManualChange}>
          تنظیم مارکر
        </button>
      </div>

      <div
        id="map"
        style={{
          height: "500px",
          width: "100%",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        }}
      ></div>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </div>
  );
};

export default LocationMarker;
