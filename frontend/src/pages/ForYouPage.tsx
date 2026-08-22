import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import ForYouFilterBar from "../components/ForYouFilterBar";
import RecommendationCard from "../components/RecommendationCard";
import SkeletonCard from "../components/SkeletonCard";
import {
  MASTER_RECOMMENDATIONS,
  budgetFromPrice,
  type BudgetValue,
  type Mood,
  type Occasion,
  type Recommendation,
  type Style,
} from "../data/mockRecommendations";

const INITIAL_COUNT = 8;
const LOAD_MORE_COUNT = 4;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

function ForYouPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(() =>
    MASTER_RECOMMENDATIONS.slice(0, INITIAL_COUNT),
  );
  const [loadMoreRound, setLoadMoreRound] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [mood, setMood] = useState<Mood>("Any Mood");
  const [occasion, setOccasion] = useState<Occasion>("Any Occasion");
  const [budget, setBudget] = useState<BudgetValue>("any");
  const [style, setStyle] = useState<Style>("Any Style");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 550);
    return () => window.clearTimeout(timeout);
  }, []);

  const filtered = useMemo(
    () =>
      recommendations.filter((rec) => {
        if (mood !== "Any Mood" && rec.mood !== mood) return false;
        if (occasion !== "Any Occasion" && rec.occasion !== occasion) return false;
        if (budget !== "any" && rec.budget !== budget) return false;
        if (style !== "Any Style" && rec.style !== style) return false;
        return true;
      }),
    [recommendations, mood, occasion, budget, style],
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRecommendations(shuffle(MASTER_RECOMMENDATIONS).slice(0, INITIAL_COUNT));
    setLoadMoreRound(0);
    setRefreshKey((key) => key + 1);
    window.setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleLoadMore = () => {
    const nextRound = loadMoreRound + 1;
    const additions = MASTER_RECOMMENDATIONS.slice(0, LOAD_MORE_COUNT).map((item) => {
      const jitter = Math.floor(Math.random() * 7) - 3;
      const price = Math.max(150, item.price + jitter * 15);
      return {
        ...item,
        id: `${item.id}-r${nextRound}`,
        price,
        matchPercent: Math.min(99, Math.max(70, item.matchPercent + jitter)),
        budget: budgetFromPrice(price),
      };
    });

    setRecommendations((current) => [...current, ...additions]);
    setLoadMoreRound(nextRound);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">For You</h1>
          <p className="mt-1 text-sm text-ink/60">Personalized outfits, picked just for you.</p>
        </div>

        <motion.button
          type="button"
          onClick={handleRefresh}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-ink/70 shadow-sm transition-all duration-200 ease-out hover:scale-105 hover:bg-cream hover:text-ink hover:shadow-md"
        >
          <RefreshCw size={16} strokeWidth={1.75} className={isRefreshing ? "animate-spin" : ""} />
          Refresh
        </motion.button>
      </div>

      <ForYouFilterBar
        mood={mood}
        onMoodChange={setMood}
        occasion={occasion}
        onOccasionChange={setOccasion}
        budget={budget}
        onBudgetChange={setBudget}
        style={style}
        onStyleChange={setStyle}
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
            {Array.from({ length: INITIAL_COUNT }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </motion.div>
        ) : filtered.length > 0 ? (
          <motion.div
            key={refreshKey}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filtered.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex min-h-[40vh] items-center justify-center rounded-3xl bg-white text-sm text-ink/50 shadow-sm"
          >
            No recommendations match these filters yet.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={handleLoadMore}
          className="rounded-2xl border border-black/10 bg-white px-6 py-3 text-sm font-medium text-ink/70 shadow-sm transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-cream hover:text-ink hover:shadow-md active:scale-95"
        >
          Load more recommendations
        </button>
      </div>
    </div>
  );
}

export default ForYouPage;
