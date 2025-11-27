import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export function DevNotice() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500/90 text-black px-4 py-2 flex items-center justify-center gap-3 font-bold shadow-lg backdrop-blur-md animate-in slide-in-from-top duration-500">
      <AlertTriangle className="w-5 h-5 text-black fill-amber-500 stroke-black" />
      <span className="uppercase tracking-wide text-sm md:text-base">
        Notice to Mohammad: Active local development in progress. Please do not make changes.
      </span>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-4 p-1 hover:bg-black/10 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
