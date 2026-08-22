import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import MobileDrawer from "../components/MobileDrawer";
import BottomNav from "../components/BottomNav";
import HomePage from "../pages/HomePage";
import SearchPage from "../pages/SearchPage";
import TryOnPage from "../pages/TryOnPage";
import ForYouPage from "../pages/ForYouPage";
import NearbyStoresPage from "../pages/NearbyStoresPage";
import OutfitBuilderPage from "../pages/OutfitBuilderPage";
import ProfilePage from "../pages/ProfilePage";
import SavedPage from "../pages/SavedPage";
import NotificationsPage from "../pages/NotificationsPage";
import MapTestPage from "../pages/MapTestPage";

function MainLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-cream">
      <Sidebar />
      <MobileDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex min-h-screen flex-col md:pl-72">
        <Topbar />

        <main className="flex-1 px-4 py-6 pb-24 md:px-10 md:py-10 md:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              <Routes location={location}>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/try-on" element={<TryOnPage />} />
                <Route path="/for-you" element={<ForYouPage />} />
                <Route path="/nearby-stores" element={<NearbyStoresPage />} />
                <Route path="/outfit-builder" element={<OutfitBuilderPage />} />
                <Route path="/saved" element={<SavedPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/map-test" element={<MapTestPage />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <BottomNav onMoreClick={() => setMobileNavOpen(true)} />
    </div>
  );
}

export default MainLayout;
