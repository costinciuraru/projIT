import { useUserLocation } from "../hooks/useUserLocation";

function LocationDebug() {
  const { latitude, longitude, loading, error } = useUserLocation();

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
