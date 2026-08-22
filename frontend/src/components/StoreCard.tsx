import { MapPin } from "lucide-react";
import type { Store } from "../data/mockStores";

interface StoreCardProps {
  store: Store;
}

function StoreCard({ store }: StoreCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-3xl bg-white p-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xs font-bold ${store.badgeClass}`}
      >
        {store.initials}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-ink">{store.name}</h3>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
              store.isOpen ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"
            }`}
          >
            {store.isOpen ? "Open" : "Closed"}
          </span>
        </div>

        <p className="mt-0.5 text-xs text-ink/50">{store.address}</p>

        <div className="mt-3 flex items-center justify-between text-xs text-ink/50">
          <span className="flex items-center gap-1">
            <MapPin size={13} strokeWidth={1.75} />
            {store.distanceKm} km
          </span>
          <span>{store.hoursLabel}</span>
        </div>
      </div>
    </div>
  );
}

export default StoreCard;
