import { MapPin } from "lucide-react";
import type { NearbyClothingStore } from "../services/nearbyStores";

interface NearbyStoreCardProps {
  store: NearbyClothingStore;
  distanceKm: number;
}

function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function NearbyStoreCard({ store, distanceKm }: NearbyStoreCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-3xl bg-white p-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink text-xs font-bold text-white">
        {initialsFor(store.name)}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-ink">{store.name}</h3>
          <span className="shrink-0 rounded-full bg-ink/5 px-2.5 py-1 text-xs font-medium text-ink/50">
            {store.shopType}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-ink/50">
          <span className="flex items-center gap-1">
            <MapPin size={13} strokeWidth={1.75} />
            {distanceKm.toFixed(1)} km
          </span>
          <span>Hours unknown</span>
        </div>
      </div>
    </div>
  );
}

export default NearbyStoreCard;
