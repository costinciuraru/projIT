import { ChevronDown } from "lucide-react";
import { FILTER_CHIPS, SORT_OPTIONS, type FilterChip, type SortOption } from "../data/mockOutfits";

interface FilterBarProps {
  activeFilter: FilterChip;
  onFilterChange: (filter: FilterChip) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
}

function FilterBar({ activeFilter, onFilterChange, sortOption, onSortChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap gap-2">
        {FILTER_CHIPS.map((chip) => {
          const isActive = chip === activeFilter;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => onFilterChange(chip)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ease-out hover:scale-105 active:scale-95 ${
                isActive
                  ? "bg-accent text-white shadow-sm hover:bg-accent-hover"
                  : "bg-white text-ink/60 shadow-sm hover:bg-cream hover:text-ink"
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <select
          value={sortOption}
          onChange={(event) => onSortChange(event.target.value as SortOption)}
          className="appearance-none rounded-full border border-black/5 bg-white py-2 pl-4 pr-9 text-sm font-medium text-ink/70 shadow-sm transition-shadow duration-200 ease-out hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          {SORT_OPTIONS.map((option) => (
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
    </div>
  );
}

export default FilterBar;
