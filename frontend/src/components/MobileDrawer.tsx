import { AnimatePresence, motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { User, X } from "lucide-react";
import { NAV_ITEMS } from "./Sidebar";
import UpgradeBanner from "./UpgradeBanner";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={onClose}
          />
          <motion.aside
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-md md:hidden"
          >
            <div className="flex items-center justify-between px-6 py-6">
              <span className="text-xl font-semibold tracking-tight text-ink">DressCode</span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-ink/60 transition-all duration-200 ease-out hover:scale-105 hover:bg-cream active:scale-95"
                aria-label="Close menu"
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-4">
              {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ease-out active:scale-[0.98] ${
                      isActive
                        ? "bg-cream text-accent"
                        : "text-ink/60 hover:bg-cream/60 hover:text-ink"
                    }`
                  }
                >
                  <Icon size={20} strokeWidth={1.75} />
                  {label}
                </NavLink>
              ))}
            </nav>

            <UpgradeBanner />

            <div className="border-t border-black/5 px-4 py-4">
              <NavLink
                to="/profile"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-all duration-200 ease-out active:scale-[0.98] ${
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
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default MobileDrawer;
