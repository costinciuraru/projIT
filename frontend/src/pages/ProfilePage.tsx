import { Bookmark, MapPin, Sparkles, Star } from "lucide-react";
import { PROFILE } from "../data/mockProfile";
import { MOCK_OUTFITS } from "../data/mockOutfits";

const STAT_ICONS = [Bookmark, Sparkles, Star];

function ProfilePage() {
  const savedOutfits = MOCK_OUTFITS.slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <img
            src={PROFILE.avatar}
            alt={PROFILE.name}
            className="h-24 w-24 rounded-full object-cover shadow-sm"
          />
          <div>
            <h1 className="text-2xl font-semibold text-ink">{PROFILE.name}</h1>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-ink/50 sm:justify-start">
              <MapPin size={15} strokeWidth={1.75} />
              {PROFILE.location}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-accent-hover hover:shadow-md active:scale-[0.98]"
        >
          Edit Profile
        </button>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-ink/80">Preferred Styles</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {PROFILE.preferredStyles.map((style) => (
            <span
              key={style}
              className="rounded-full bg-cream px-4 py-2 text-sm font-medium text-ink/70 transition-all duration-200 ease-out hover:scale-105 hover:bg-accent/10 hover:text-accent"
            >
              {style}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {PROFILE.stats.map((stat, index) => {
          const Icon = STAT_ICONS[index];
          return (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-2 rounded-3xl bg-white p-6 text-center shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-accent">
                <Icon size={18} strokeWidth={1.75} />
              </span>
              <span className="text-xl font-semibold text-ink">{stat.value}</span>
              <span className="text-xs font-medium text-ink/50">{stat.label}</span>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink/80">Saved Outfits</h2>
          <button
            type="button"
            className="text-sm font-medium text-accent transition-all duration-200 ease-out hover:scale-105 hover:underline"
          >
            View all
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {savedOutfits.map((outfit) => (
            <div
              key={outfit.id}
              className="aspect-square overflow-hidden rounded-2xl bg-cream shadow-sm transition-all duration-200 ease-out hover:shadow-md"
            >
              <img
                src={outfit.image}
                alt={outfit.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-200 ease-out hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
