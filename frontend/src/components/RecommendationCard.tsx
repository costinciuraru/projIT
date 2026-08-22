import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Heart } from "lucide-react";
import type { Recommendation } from "../data/mockRecommendations";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

interface RecommendationCardProps {
  recommendation: Recommendation;
}

function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const [saved, setSaved] = useState(false);

  return (
    <motion.article
      layout
      variants={cardVariants}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition-shadow duration-200 ease-out hover:shadow-md"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <img
          src={recommendation.image}
          alt={recommendation.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white">
          {recommendation.matchPercent}% match
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-base font-semibold text-ink">{recommendation.title}</h3>
        <p className="text-sm text-ink/60">{recommendation.description}</p>

        <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
          <span className="text-sm font-semibold text-ink">{recommendation.price} RON</span>

          <button
            type="button"
            onClick={() => setSaved((current) => !current)}
            className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-200 ease-out hover:scale-110 active:scale-95 ${
              saved ? "text-rose-500" : "text-ink/50 hover:text-ink"
            }`}
          >
            <Heart size={18} strokeWidth={1.75} className={saved ? "fill-rose-500" : ""} />
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default RecommendationCard;
