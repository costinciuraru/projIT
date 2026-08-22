import type { Store } from "../data/mockStores";

interface StoreMapProps {
  stores: Store[];
}

function StoreMap({ stores }: StoreMapProps) {
  return (
    <div className="relative h-64 overflow-hidden rounded-3xl bg-gradient-to-br from-cream via-white to-cream shadow-sm sm:h-72">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(20,20,20,0.08) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {stores.map((store) => (
        <div
          key={store.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
          style={{ top: store.pinPosition.top, left: store.pinPosition.left }}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold shadow-md ${store.badgeClass}`}
          >
            {store.initials}
          </div>
        </div>
      ))}

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="absolute inset-0 m-auto h-4 w-4 animate-ping rounded-full bg-accent/40" />
        <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-accent ring-4 ring-white" />
      </div>
    </div>
  );
}

export default StoreMap;
