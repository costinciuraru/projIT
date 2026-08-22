import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FilterBar from "../components/FilterBar";
import OutfitCard from "../components/OutfitCard";
import SkeletonCard from "../components/SkeletonCard";
import { MOCK_OUTFITS, type FilterChip, type SortOption } from "../data/mockOutfits";

const SKELETON_COUNT = 8;

function HomePage() {
  const [activeFilter, setActiveFilter] = useState<FilterChip>("All");
  const [sortOption, setSortOption] = useState<SortOption>("Popular");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 550);
    return () => window.clearTimeout(timeout);
  }, []);

  const outfits = useMemo(() => {
    const filtered = MOCK_OUTFITS.filter((outfit) => {
      if (activeFilter === "All") return true;
      if (activeFilter === "Following") return outfit.isFollowing;
      return outfit.tag === activeFilter;
    });

    const sorted = [...filtered];
    if (sortOption === "Popular") {
      sorted.sort((a, b) => b.likes - a.likes);
    } else if (sortOption === "Top Rated") {
      sorted.sort((a, b) => b.rating - a.rating);
    } else {
      sorted.reverse();
    }

    return sorted;
  }, [activeFilter, sortOption]);

  return (
    <div className="flex flex-col gap-6">
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </motion.div>
        ) : outfits.length > 0 ? (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {outfits.map((outfit) => (
              <OutfitCard key={outfit.id} outfit={outfit} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex min-h-[40vh] items-center justify-center rounded-3xl bg-white text-sm text-ink/50 shadow-sm"
          >
            No outfits match this filter yet.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HomePage;
