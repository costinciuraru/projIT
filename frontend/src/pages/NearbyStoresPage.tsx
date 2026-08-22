import StoreMap from "../components/StoreMap";
import StoreCard from "../components/StoreCard";
import { MOCK_STORES } from "../data/mockStores";

function NearbyStoresPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Nearby Stores</h1>
        <p className="mt-1 text-sm text-ink/60">Fashion stores around you, sorted by distance.</p>
      </div>

      <StoreMap stores={MOCK_STORES} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_STORES.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    </div>
  );
}

export default NearbyStoresPage;
