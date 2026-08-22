import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Check, PaintBucket } from "lucide-react";
import OutfitCanvasPiece from "../components/OutfitCanvasPiece";
import { DEFAULT_OUTFIT_PIECES, type OutfitPiece } from "../data/mockOutfitPieces";

function OutfitBuilderPage() {
  const [pieces, setPieces] = useState<OutfitPiece[]>(DEFAULT_OUTFIT_PIECES);
  const [justSaved, setJustSaved] = useState(false);

  const total = useMemo(() => pieces.reduce((sum, piece) => sum + piece.price, 0), [pieces]);

  const handleRemove = (id: string) => {
    setPieces((current) => current.filter((piece) => piece.id !== id));
  };

  const handleReset = () => setPieces(DEFAULT_OUTFIT_PIECES);

  const handleSave = () => {
    if (pieces.length === 0) return;
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Outfit Builder</h1>
        <p className="mt-1 text-sm text-ink/60">
          Arrange your pieces on the canvas and see the total price update live.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="relative min-h-[420px] overflow-hidden rounded-2xl border-2 border-dashed border-black/10 bg-cream/40 sm:min-h-[480px]">
          <AnimatePresence>
            {pieces.map((piece) => (
              <OutfitCanvasPiece key={piece.id} piece={piece} onRemove={handleRemove} />
            ))}
          </AnimatePresence>

          {pieces.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <PaintBucket size={20} strokeWidth={1.75} className="text-ink/30" />
              </span>
              <p className="text-sm font-medium text-ink/50">Your canvas is empty</p>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-ink/70 transition-all duration-200 ease-out hover:scale-105 hover:bg-cream active:scale-95"
              >
                Reset pieces
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <p className="text-sm text-ink/50">Total Price</p>
            <p className="text-2xl font-semibold text-ink">{total} RON</p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={pieces.length === 0}
            className="flex items-center gap-2 rounded-2xl bg-accent px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-out enabled:hover:scale-[1.02] enabled:hover:bg-accent-hover enabled:hover:shadow-md enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink/40"
          >
            {justSaved ? (
              <>
                <Check size={18} strokeWidth={2} />
                Saved!
              </>
            ) : (
              "Save Outfit"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OutfitBuilderPage;
