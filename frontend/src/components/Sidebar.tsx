import { Link, NavLink } from "react-router-dom";
import {
  Bell,
  Bookmark,
  Home,
  LayoutGrid,
  MapPin,
  Search,
  Sparkles,
  Star,
  User,
  type LucideIcon,
} from "lucide-react";
import UpgradeBanner from "./UpgradeBanner";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/search", label: "Search", icon: Search },
  { to: "/try-on", label: "Try-On", icon: Sparkles },
  { to: "/for-you", label: "For You", icon: Star },
  { to: "/nearby-stores", label: "Nearby Stores", icon: MapPin },
  { to: "/outfit-builder", label: "Outfit Builder", icon: LayoutGrid },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ease-out hover:translate-x-0.5 ${
    isActive ? "bg-cream text-accent" : "text-ink/60 hover:bg-cream/60 hover:text-ink"
  }`;

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col bg-white border-r border-black/5 md:flex">
      <Link to="/" className="px-8 py-8">
        <span className="text-xl font-semibold tracking-tight text-ink">DressCode</span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={navLinkClass}>
            <Icon size={20} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      <UpgradeBanner />

      <div className="border-t border-black/5 px-4 py-4">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-all duration-200 ease-out hover:translate-x-0.5 ${
              isActive ? "bg-cream text-accent" : "text-ink/70 hover:bg-cream/60"
            }`
          }
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream">
            <User size={18} strokeWidth={1.75} />
          </span>
          Profile
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
