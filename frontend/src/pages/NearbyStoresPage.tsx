import { useEffect, useMemo, useState } from "react";
import NearbyStoresMap from "../components/NearbyStoresMap";
import NearbyStoreCard from "../components/NearbyStoreCard";
import { useUserLocation } from "../hooks/useUserLocation";
import { getNearbyClothingStores, type NearbyClothingStore } from "../services/nearbyStores";
import { haversineDistanceKm } from "../utils/distance";

function NearbyStoresPage() {
  const { latitude, longitude, loading: locationLoading, error: locationError } = useUserLocation();
  const [stores, setStores] = useState<NearbyClothingStore[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [storesError, setStoresError] = useState<string | null>(null);

  useEffect(() => {
    if (latitude === null || longitude === null) return;

    setStoresLoading(true);
    setStoresError(null);

    getNearbyClothingStores(latitude, longitude)
      .then(setStores)
      .catch((err: Error) => setStoresError(err.message))
      .finally(() => setStoresLoading(false));
  }, [latitude, longitude]);

  const sortedStores = useMemo(() => {
    if (latitude === null || longitude === null) return [];

    return stores
      .map((store) => ({
        store,
        distanceKm: haversineDistanceKm(latitude, longitude, store.lat, store.lon),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [stores, latitude, longitude]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Nearby Stores</h1>
        <p className="mt-1 text-sm text-ink/60">Fashion stores around you, sorted by distance.</p>
      </div>

      {locationLoading && <p className="text-sm text-ink/60">Getting your location…</p>}
      {locationError && <p className="text-sm text-red-600">{locationError}</p>}

      {!locationLoading && !locationError && latitude !== null && longitude !== null && (
        <>
          <NearbyStoresMap userLat={latitude} userLng={longitude} stores={stores} />

          {storesLoading && <p className="text-sm text-ink/60">Looking for stores nearby…</p>}
          {storesError && <p className="text-sm text-red-600">{storesError}</p>}

          {!storesLoading && !storesError && sortedStores.length === 0 && (
            <p className="text-sm text-ink/60">No clothing stores found within range. Try again later.</p>
          )}

          {!storesLoading && !storesError && sortedStores.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedStores.map(({ store, distanceKm }) => (
                <NearbyStoreCard key={store.id} store={store} distanceKm={distanceKm} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default NearbyStoresPage;
