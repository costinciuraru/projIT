import { useRef } from "react";
import { ImagePlus, RefreshCw } from "lucide-react";

interface PhotoUploadPanelProps {
  photo: string | null;
  onPhotoSelected: (url: string) => void;
}

function PhotoUploadPanel({ photo, onPhotoSelected }: PhotoUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onPhotoSelected(url);
    event.target.value = "";
  };

  return (
    <div className="flex h-full flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-ink/80">Your Photo</h2>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {photo ? (
        <div className="flex flex-1 flex-col gap-4">
          <div className="relative flex-1 overflow-hidden rounded-2xl bg-cream">
            <img src={photo} alt="Uploaded preview" className="h-full w-full object-cover" />
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-2xl border border-black/10 py-3 text-sm font-medium text-ink/70 transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-cream active:scale-[0.98]"
          >
            <RefreshCw size={16} strokeWidth={1.75} />
            Change Photo
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-black/10 bg-cream/50 px-6 py-10 text-center transition-all duration-200 ease-out hover:scale-[1.01] hover:border-accent/40 hover:bg-cream"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            <ImagePlus size={22} strokeWidth={1.75} className="text-accent" />
          </span>
          <span className="text-sm font-medium text-ink/70">Click to upload your photo</span>
          <span className="text-xs text-ink/40">PNG or JPG, drag & drop supported</span>
        </button>
      )}
    </div>
  );
}

export default PhotoUploadPanel;
