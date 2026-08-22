import { useEffect, useRef, useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import {
  BUDGET_OPTIONS,
  MOOD_OPTIONS,
  OCCASION_OPTIONS,
  STYLE_OPTIONS,
  type BudgetValue,
  type Mood,
  type Occasion,
  type Style,
} from "../data/mockRecommendations";

interface ForYouFilterBarProps {
  mood: Mood;
  onMoodChange: (value: Mood) => void;
  occasion: Occasion;
  onOccasionChange: (value: Occasion) => void;
  budget: BudgetValue;
  onBudgetChange: (value: BudgetValue) => void;
  style: Style;
  onStyleChange: (value: Style) => void;
}

const EXTRA_TOGGLES = ["New arrivals only", "Trending this week", "Editor's picks"];

function SelectField<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="appearance-none rounded-full border border-black/5 bg-white py-2.5 pl-4 pr-9 text-sm font-medium text-ink/70 shadow-sm transition-shadow duration-200 ease-out hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent/40"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        strokeWidth={1.75}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/40"
      />
    </div>
  );
}

function ForYouFilterBar({
  mood,
  onMoodChange,
  occasion,
  onOccasionChange,
  budget,
  onBudgetChange,
  style,
  onStyleChange,
}: ForYouFilterBarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeToggles, setActiveToggles] = useState<string[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filtersOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setFiltersOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filtersOpen]);

  const toggleExtra = (label: string) => {
    setActiveToggles((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SelectField value={mood} options={MOOD_OPTIONS} onChange={onMoodChange} />
      <SelectField value={occasion} options={OCCASION_OPTIONS} onChange={onOccasionChange} />
      <SelectField
        value={budget}
        options={BUDGET_OPTIONS.map((option) => option.value)}
        onChange={onBudgetChange}
      />
      <SelectField value={style} options={STYLE_OPTIONS} onChange={onStyleChange} />

      <div className="relative" ref={popoverRef}>
        <button
          type="button"
          onClick={() => setFiltersOpen((current) => !current)}
          className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium shadow-sm transition-all duration-200 ease-out hover:scale-105 hover:shadow-md active:scale-95 ${
            activeToggles.length > 0
              ? "border-accent bg-accent/10 text-accent"
              : "border-black/5 bg-white text-ink/70 hover:bg-cream"
          }`}
        >
          <SlidersHorizontal size={16} strokeWidth={1.75} />
          Filters
          {activeToggles.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs text-white">
              {activeToggles.length}
            </span>
          )}
        </button>

        {filtersOpen && (
          <div className="absolute right-0 top-full z-10 mt-2 w-64 rounded-2xl border border-black/5 bg-white p-3 shadow-md">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
              Extra options
            </p>
            {EXTRA_TOGGLES.map((label) => {
              const isActive = activeToggles.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleExtra(label)}
                  className={`flex w-full items-center justify-between rounded-xl px-2 py-2 text-sm transition-all duration-200 ease-out hover:scale-[1.02] ${
                    isActive ? "text-accent" : "text-ink/70 hover:bg-cream"
                  }`}
                >
                  {label}
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-md border ${
                      isActive ? "border-accent bg-accent" : "border-black/20"
                    }`}
                  >
                    {isActive && <span className="h-2 w-2 rounded-sm bg-white" />}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ForYouFilterBar;
