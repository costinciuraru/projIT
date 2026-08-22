import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";

interface TryOnPreviewPanelProps {
  isGenerating: boolean;
  resultImage: string | null;
}

function TryOnPreviewPanel({ isGenerating, resultImage }: TryOnPreviewPanelProps) {
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);

  useEffect(() => {
    setFeedback(null);
  }, [resultImage]);

  return (
    <div className="flex h-full flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-ink/80">Try-On Preview</h2>

      <div className="relative flex-1 overflow-hidden rounded-2xl bg-cream">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            >
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-cream via-white to-cream" />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <Sparkles size={22} strokeWidth={1.75} className="animate-pulse text-accent" />
              </span>
              <span className="relative text-sm font-medium text-ink/60">Generating your look...</span>
            </motion.div>
          ) : resultImage ? (
            <motion.img
              key="result"
              src={resultImage}
              alt="Try-on result"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="h-full w-full object-cover"
            />
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <Sparkles size={22} strokeWidth={1.75} className="text-ink/30" />
              </span>
              <span className="text-sm font-medium text-ink/50">
                Upload a photo and select an item to try on
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!resultImage}
          onClick={() => setFeedback((current) => (current === "like" ? null : "like"))}
          className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 ease-out enabled:hover:scale-110 enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
            feedback === "like"
              ? "border-accent bg-accent/10 text-accent"
              : "border-black/10 text-ink/50 hover:bg-cream"
          }`}
          aria-label="Like result"
        >
          <ThumbsUp size={18} strokeWidth={1.75} />
        </button>

        <button
          type="button"
          disabled={!resultImage}
          onClick={() => setFeedback((current) => (current === "dislike" ? null : "dislike"))}
          className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 ease-out enabled:hover:scale-110 enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
            feedback === "dislike"
              ? "border-rose-400 bg-rose-50 text-rose-500"
              : "border-black/10 text-ink/50 hover:bg-cream"
          }`}
          aria-label="Dislike result"
        >
          <ThumbsDown size={18} strokeWidth={1.75} />
        </button>

        {resultImage ? (
          <a
            href={resultImage}
            download="dresscode-try-on.jpg"
            target="_blank"
            rel="noreferrer"
            className="ml-auto flex items-center gap-2 rounded-2xl bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 ease-out hover:scale-105 hover:bg-accent-hover hover:shadow-md active:scale-95"
          >
            <Download size={16} strokeWidth={1.75} />
            Download
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="ml-auto flex cursor-not-allowed items-center gap-2 rounded-2xl bg-cream px-4 py-2.5 text-sm font-medium text-ink/30"
          >
            <Download size={16} strokeWidth={1.75} />
            Download
          </button>
        )}
      </div>
    </div>
  );
}

export default TryOnPreviewPanel;
