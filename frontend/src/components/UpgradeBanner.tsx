import { Crown } from "lucide-react";

function UpgradeBanner() {
  return (
    <button
      type="button"
      className="mx-4 mb-3 flex items-center gap-3 rounded-2xl bg-cream px-4 py-3 text-left transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-cream/70 hover:shadow-sm active:scale-[0.98]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-accent shadow-sm">
        <Crown size={16} strokeWidth={1.75} />
      </span>
      <span>
        <span className="block text-sm font-medium text-ink">Upgrade to Pro</span>
        <span className="block text-xs text-ink/50">Unlock exclusive features</span>
      </span>
    </button>
  );
}

export default UpgradeBanner;
