import { useEffect } from "react";
import { useUserLocation } from "../hooks/useUserLocation";
import { getNearbyClothingStores } from "../services/nearbyStores";

function LocationDebug() {
  const { latitude, longitude, loading, error } = useUserLocation();

  useEffect(() => {
    if (latitude === null || longitude === null) return;

    getNearbyClothingStores(latitude, longitude)
      .then((stores) => console.log("Nearby clothing stores:", stores))
      .catch((err) => console.error("getNearbyClothingStores failed:", err));
  }, [latitude, longitude]);

  return (
    <div className="rounded-xl border border-ink/10 bg-white p-4 text-sm">
      <p className="font-semibold text-ink">Location debug</p>
      {loading && <p className="mt-1 text-ink/60">Requesting location…</p>}
      {error && <p className="mt-1 text-red-600">{error}</p>}
      {!loading && !error && (
        <p className="mt-1 text-ink/60">
          lat: {latitude}, lng: {longitude}
        </p>
      )}
    </div>
  );
}

export default LocationDebug;
