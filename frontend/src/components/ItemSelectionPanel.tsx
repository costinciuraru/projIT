import { Check, Sparkles } from "lucide-react";
import { MOCK_TRYON_ITEMS, TRYON_CATEGORIES, type TryOnCategory } from "../data/mockTryOnItems";

interface ItemSelectionPanelProps {
  activeCategory: TryOnCategory;
  onCategoryChange: (category: TryOnCategory) => void;
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onTryOn: () => void;
  canTryOn: boolean;
  isGenerating: boolean;
}

function ItemSelectionPanel({
  activeCategory,
  onCategoryChange,
  selectedItemId,
  onSelectItem,
  onTryOn,
  canTryOn,
  isGenerating,
}: ItemSelectionPanelProps) {
  const items = MOCK_TRYON_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <div className="flex h-full flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-ink/80">Select an Item</h2>

      <div className="flex gap-1 overflow-x-auto rounded-2xl bg-cream p-1">
        {TRYON_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
            className={`shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 ease-out hover:scale-105 active:scale-95 ${
              category === activeCategory
                ? "bg-white text-ink shadow-sm"
                : "text-ink/50 hover:text-ink"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto">
        {items.map((item) => {
          const isSelected = item.id === selectedItemId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item.id)}
              className={`group relative overflow-hidden rounded-2xl border-2 text-left transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-md active:scale-[0.98] ${
                isSelected ? "border-accent" : "border-transparent hover:border-black/10"
              }`}
            >
              <div className="aspect-square w-full overflow-hidden bg-cream">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-105"
                />
              </div>

              {isSelected && (
                <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white">
                  <Check size={14} strokeWidth={2.5} />
                </span>
              )}

              <div className="px-2 py-2">
                <p className="truncate text-xs font-medium text-ink/70">{item.name}</p>
                <p className="text-sm font-semibold text-ink">{item.price} RON</p>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onTryOn}
        disabled={!canTryOn || isGenerating}
        className="flex items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-out enabled:hover:scale-[1.02] enabled:hover:bg-accent-hover enabled:hover:shadow-md enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink/40"
      >
        <Sparkles size={18} strokeWidth={1.75} />
        {isGenerating ? "Generating..." : "Try this item"}
      </button>
    </div>
  );
}

export default ItemSelectionPanel;
