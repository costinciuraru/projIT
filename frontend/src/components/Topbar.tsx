import { Link } from "react-router-dom";
import { Bell, Plus, Search } from "lucide-react";
import { PROFILE } from "../data/mockProfile";

function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-black/5 bg-white/80 px-4 py-4 backdrop-blur md:px-8">
      <div className="relative max-w-xl flex-1">
        <Search
          size={18}
          strokeWidth={1.75}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40"
        />
        <input
          type="text"
          placeholder="Search outfits, brands, styles..."
          className="w-full rounded-2xl bg-cream py-3 pl-11 pr-4 text-sm text-ink placeholder:text-ink/40 transition-shadow duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <Link
          to="/notifications"
          className="rounded-xl p-2 text-ink/70 transition-all duration-200 ease-out hover:scale-105 hover:bg-cream hover:text-ink active:scale-95"
          aria-label="Notifications"
        >
          <Bell size={20} strokeWidth={1.75} />
        </Link>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white shadow-sm transition-all duration-200 ease-out hover:scale-105 hover:bg-accent-hover hover:shadow-md active:scale-95"
          aria-label="Create post"
        >
          <Plus size={18} strokeWidth={2} />
        </button>

        <Link
          to="/profile"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-ink/70 transition-all duration-200 ease-out hover:scale-105 hover:text-ink active:scale-95"
          aria-label="Profile"
        >
          <img
            src={PROFILE.avatar}
            alt={PROFILE.name}
            className="h-full w-full rounded-full object-cover"
          />
        </Link>
      </div>
    </header>
  );
}

export default Topbar;
