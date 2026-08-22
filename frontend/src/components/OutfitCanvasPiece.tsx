import { motion } from "framer-motion";
import { X } from "lucide-react";
import { PIECE_POSITION_CLASSES, type OutfitPiece } from "../data/mockOutfitPieces";

interface OutfitCanvasPieceProps {
  piece: OutfitPiece;
  onRemove: (id: string) => void;
}

function OutfitCanvasPiece({ piece, onRemove }: OutfitCanvasPieceProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      whileHover={{ scale: 1.05, zIndex: 30 }}
      className={`absolute w-32 rounded-2xl bg-white p-2 shadow-md sm:w-36 ${PIECE_POSITION_CLASSES[piece.category]}`}
    >
      <button
        type="button"
        onClick={() => onRemove(piece.id)}
        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink/60 shadow-sm transition-all duration-200 ease-out hover:scale-110 hover:bg-rose-50 hover:text-rose-500 active:scale-95"
        aria-label={`Remove ${piece.name}`}
      >
        <X size={14} strokeWidth={2} />
      </button>

      <div className="aspect-square w-full overflow-hidden rounded-xl bg-cream">
        <img src={piece.image} alt={piece.name} className="h-full w-full object-cover" />
      </div>

      <p className="mt-2 truncate text-xs font-medium text-ink/80">{piece.name}</p>
      <p className="text-xs text-ink/40">{piece.price} RON</p>
    </motion.div>
  );
}

export default OutfitCanvasPiece;
