function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="skeleton-shimmer aspect-[4/5] w-full" />

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <div className="skeleton-shimmer h-6 w-6 rounded-full" />
          <div className="skeleton-shimmer h-3 w-20 rounded-full" />
          <div className="skeleton-shimmer ml-auto h-3 w-8 rounded-full" />
        </div>

        <div className="skeleton-shimmer h-4 w-3/4 rounded-full" />
        <div className="skeleton-shimmer h-3 w-full rounded-full" />

        <div className="mt-2 flex items-center gap-4 border-t border-black/5 pt-3">
          <div className="skeleton-shimmer h-4 w-10 rounded-full" />
          <div className="skeleton-shimmer h-4 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default SkeletonCard;
