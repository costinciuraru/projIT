import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { NearbyClothingStore } from "../services/nearbyStores";

// Leaflet's default marker icon URLs break under bundlers like Vite; point
// them at the bundled asset URLs instead.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export interface NearbyStoresMapProps {
  userLat: number;
  userLng: number;
  stores: NearbyClothingStore[];
}

function NearbyStoresMap({ userLat, userLng, stores }: NearbyStoresMapProps) {
  return (
    <MapContainer
      center={[userLat, userLng]}
      zoom={14}
      scrollWheelZoom={false}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <CircleMarker
        center={[userLat, userLng]}
        radius={9}
        pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 1 }}
      >
        <Popup>You are here</Popup>
      </CircleMarker>

      {stores.map((store) => (
        <Marker key={store.id} position={[store.lat, store.lon]}>
          <Popup>{store.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default NearbyStoresMap;
