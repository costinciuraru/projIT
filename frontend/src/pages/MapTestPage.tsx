import { useEffect, useState } from "react";
import NearbyStoresMap from "../components/NearbyStoresMap";
import { useUserLocation } from "../hooks/useUserLocation";
import { getNearbyClothingStores, type NearbyClothingStore } from "../services/nearbyStores";

// Temporary isolated page for manually testing NearbyStoresMap.
// Not linked from the sidebar/nav — visit /map-test directly.
function MapTestPage() {
  const { latitude, longitude, loading, error } = useUserLocation();
  const [stores, setStores] = useState<NearbyClothingStore[]>([]);

  useEffect(() => {
    if (latitude === null || longitude === null) return;

    getNearbyClothingStores(latitude, longitude)
      .then(setStores)
      .catch((err) => console.error("getNearbyClothingStores failed:", err));
  }, [latitude, longitude]);

  if (loading) return <p>Requesting location…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (latitude === null || longitude === null) return null;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-ink">Map test ({stores.length} stores found)</h1>
      <NearbyStoresMap userLat={latitude} userLng={longitude} stores={stores} />
    </div>
  );
}

export default MapTestPage;
