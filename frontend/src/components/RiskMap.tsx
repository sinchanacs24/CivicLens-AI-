import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import type { WardRisk } from "../utils/types";
import { riskColor } from "../utils/format";

export default function RiskMap({ wards }: { wards: WardRisk[] }) {
  const validWards = wards.filter(
    (w) =>
      typeof w.latitude === "number" &&
      typeof w.longitude === "number" &&
      !Number.isNaN(w.latitude) &&
      !Number.isNaN(w.longitude)
  );

  if (validWards.length === 0) {
    return (
      <div className="glass-card flex items-center justify-center p-10 text-slate-400">
        No location data available for this dataset.
      </div>
    );
  }

  const avgLat =
    validWards.reduce((sum, w) => sum + (w.latitude || 0), 0) / validWards.length;
  const avgLng =
    validWards.reduce((sum, w) => sum + (w.longitude || 0), 0) / validWards.length;

  const maxComplaints = Math.max(...validWards.map((w) => w.complaint_count), 1);

  return (
    <div className="glass-card overflow-hidden p-2">
      <MapContainer
        center={[avgLat, avgLng]}
        zoom={12}
        style={{ height: "480px", width: "100%", borderRadius: "0.75rem" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validWards.map((w) => {
          const radius = 8 + (w.complaint_count / maxComplaints) * 20;
          const color = riskColor[w.risk_level] || "#888";
          return (
            <CircleMarker
              key={w.ward}
              center={[w.latitude as number, w.longitude as number]}
              radius={radius}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.55,
                weight: 2,
              }}
            >
              <Popup>
                <div style={{ fontSize: "13px", lineHeight: 1.5 }}>
                  <strong>{w.ward}</strong>
                  <br />
                  Risk: {w.risk_score.toFixed(1)} ({w.risk_level})
                  <br />
                  Complaints: {w.complaint_count}
                  <br />
                  Open: {w.open_cases} · Resolved: {w.resolved_cases}
                  {w.is_anomaly && (
                    <>
                      <br />
                      <span style={{ color: "#ef4444", fontWeight: 600 }}>⚠ Complaint spike</span>
                    </>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}