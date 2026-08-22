import { useEffect, useRef, useState } from "react";
import { Zap } from "lucide-react";
import TryOnStepper from "../components/TryOnStepper";
import PhotoUploadPanel from "../components/PhotoUploadPanel";
import TryOnPreviewPanel from "../components/TryOnPreviewPanel";
import ItemSelectionPanel from "../components/ItemSelectionPanel";
import { MOCK_TRYON_ITEMS, type TryOnCategory } from "../data/mockTryOnItems";

function TryOnPage() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<TryOnCategory>("Dresses");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const handlePhotoSelected = (url: string) => {
    setPhoto(url);
    setResultImage(null);
  };

  const handleSelectItem = (id: string) => {
    setSelectedItemId(id);
    setResultImage(null);
  };

  const handleTryOn = () => {
    if (!photo || !selectedItemId) return;
    const item = MOCK_TRYON_ITEMS.find((current) => current.id === selectedItemId);
    if (!item) return;

    setIsGenerating(true);
    setResultImage(null);

    timeoutRef.current = window.setTimeout(() => {
      setResultImage(item.previewImage);
      setIsGenerating(false);
    }, 1500);
  };

  const currentStep = !photo ? 0 : !selectedItemId ? 1 : isGenerating || !resultImage ? 2 : 3;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-ink">AI Virtual Try-On</h1>
        <span className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-medium text-ink/60 shadow-sm">
          <Zap size={14} strokeWidth={1.75} className="text-accent" />
          AI Credits: 12
        </span>
      </div>

      <div className="rounded-3xl bg-white px-6 py-5 shadow-sm">
        <TryOnStepper currentStep={currentStep} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <PhotoUploadPanel photo={photo} onPhotoSelected={handlePhotoSelected} />
        </div>

        <div className="lg:col-span-1">
          <TryOnPreviewPanel isGenerating={isGenerating} resultImage={resultImage} />
        </div>

        <div className="lg:col-span-1">
          <ItemSelectionPanel
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            selectedItemId={selectedItemId}
            onSelectItem={handleSelectItem}
            onTryOn={handleTryOn}
            canTryOn={Boolean(photo && selectedItemId)}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </div>
  );
}

export default TryOnPage;
