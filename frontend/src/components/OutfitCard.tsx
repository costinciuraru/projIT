import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Heart, Star } from "lucide-react";
import type { Outfit, OutfitTag } from "../data/mockOutfits";

const TAG_STYLES: Record<OutfitTag, string> = {
  Casual: "bg-amber-100 text-amber-800",
  Office: "bg-slate-200 text-slate-800",
  Elegant: "bg-violet-100 text-violet-800",
  Streetwear: "bg-rose-100 text-rose-800",
  Summer: "bg-yellow-100 text-yellow-800",
  Winter: "bg-sky-100 text-sky-800",
};

interface OutfitCardProps {
  outfit: Outfit;
}

function OutfitCard({ outfit }: OutfitCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition-shadow duration-200 ease-out hover:shadow-md"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <img
          src={outfit.image}
          alt={outfit.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${TAG_STYLES[outfit.tag]}`}
        >
          {outfit.tag}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <img
            src={outfit.author.avatar}
            alt={outfit.author.name}
            className="h-6 w-6 rounded-full object-cover"
          />
          <span className="text-sm font-medium text-ink/80">{outfit.author.name}</span>
          <span className="ml-auto flex items-center gap-1 text-xs font-medium text-ink/60">
            <Star size={14} strokeWidth={1.75} className="fill-amber-400 text-amber-400" />
            {outfit.rating.toFixed(1)}
          </span>
        </div>

        <h3 className="text-base font-semibold text-ink">{outfit.title}</h3>
        <p className="line-clamp-2 text-sm text-ink/60">{outfit.description}</p>

        <div className="mt-2 flex items-center gap-4 border-t border-black/5 pt-3">
          <button
            type="button"
            onClick={() => setLiked((current) => !current)}
            className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-200 ease-out hover:scale-110 active:scale-95 ${
              liked ? "text-rose-500" : "text-ink/50 hover:text-ink"
            }`}
          >
            <Heart size={18} strokeWidth={1.75} className={liked ? "fill-rose-500" : ""} />
            {outfit.likes + (liked ? 1 : 0)}
          </button>

          <button
            type="button"
            onClick={() => setSaved((current) => !current)}
            className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-200 ease-out hover:scale-110 active:scale-95 ${
              saved ? "text-accent" : "text-ink/50 hover:text-ink"
            }`}
          >
            <Bookmark size={18} strokeWidth={1.75} className={saved ? "fill-accent" : ""} />
            {outfit.saves + (saved ? 1 : 0)}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default OutfitCard;
