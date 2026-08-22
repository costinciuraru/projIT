import { NavLink } from "react-router-dom";
import { Home, Menu, Search, Sparkles, Star, type LucideIcon } from "lucide-react";

interface PrimaryItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const PRIMARY_ITEMS: PrimaryItem[] = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/search", label: "Search", icon: Search },
  { to: "/try-on", label: "Try-On", icon: Sparkles },
  { to: "/for-you", label: "For You", icon: Star },
];

interface BottomNavProps {
  onMoreClick: () => void;
}

function BottomNav({ onMoreClick }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-black/5 bg-white/95 px-2 py-2 backdrop-blur md:hidden">
      {PRIMARY_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-all duration-200 ease-out active:scale-90 ${
              isActive ? "text-accent" : "text-ink/50 hover:text-ink"
            }`
          }
        >
          <Icon size={20} strokeWidth={1.75} />
          {label}
        </NavLink>
      ))}

      <button
        type="button"
        onClick={onMoreClick}
        className="flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium text-ink/50 transition-all duration-200 ease-out hover:text-ink active:scale-90"
      >
        <Menu size={20} strokeWidth={1.75} />
        More
      </button>
    </nav>
  );
}

export default BottomNav;
