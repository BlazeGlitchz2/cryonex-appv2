import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Eye,
  EyeOff,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Upload,
  MousePointer2,
} from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

interface Mask {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  isHidden: boolean;
}

export function ImageOcclusionTool({
  materialId,
}: {
  materialId?: Id<"studyMaterials">;
}) {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [storageId, setStorageId] = useState<Id<"_storage"> | null>(null);
  const [masks, setMasks] = useState<Mask[]>([]);
  const [mode, setMode] = useState<"edit" | "review">("edit");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentRect, setCurrentRect] = useState<Partial<Mask> | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const generateUploadUrl = useMutation(api.studyMutations.generateUploadUrl);
  const saveOcclusion = useMutation(api.imageOcclusion.saveOcclusion);
  const detectLabels = useAction(api.imageOcclusion.detectLabels);
  const existingOcclusions = useQuery(
    api.imageOcclusion.listOcclusions,
    materialId ? { materialId } : "skip",
  );

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load existing if available
  useEffect(() => {
    if (existingOcclusions && existingOcclusions.length > 0) {
      const latest = existingOcclusions[0];
      setStorageId(latest.storageId);
      setMasks(latest.masks.map((m: any) => ({ ...m, isHidden: true })));
      // Fetch URL for storageId (would need a query for this, or just rely on user upload for now)
      // For now, we assume user uploads new or we handle loading differently.
      // Ideally we should get the URL from the backend.
    }
  }, [existingOcclusions]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setImageUrl(URL.createObjectURL(file));
    setMasks([]);

    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      setStorageId(storageId);
      toast.success("Image uploaded! Analyzing for labels...");

      // Auto-detect labels
      setIsDetecting(true);
      try {
        const detected = await detectLabels({ storageId });
        const newMasks = detected.map((d: any) => ({ ...d, isHidden: true }));
        setMasks(newMasks);

        // Save immediately
        await saveOcclusion({
          materialId,
          storageId,
          title: file.name,
          masks: newMasks.map(({ id, x, y, width, height, label }: any) => ({
            id,
            x,
            y,
            width,
            height,
            label,
          })),
        });

        toast.success(`Auto-generated ${detected.length} labels!`);
      } catch (error) {
        console.error(error);
        toast.error("Auto-detection failed, but image is saved.");
      } finally {
        setIsDetecting(false);
      }
    } catch (error) {
      toast.error("Upload failed");
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode === "review" || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentRect({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;

    const width = Math.abs(currentX - startPos.x);
    const height = Math.abs(currentY - startPos.y);
    const x = Math.min(currentX, startPos.x);
    const y = Math.min(currentY, startPos.y);

    setCurrentRect({ x, y, width, height });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentRect) return;

    if (
      currentRect.width &&
      currentRect.width > 1 &&
      currentRect.height &&
      currentRect.height > 1
    ) {
      setMasks([
        ...masks,
        {
          id: crypto.randomUUID(),
          x: currentRect.x!,
          y: currentRect.y!,
          width: currentRect.width!,
          height: currentRect.height!,
          isHidden: true,
        },
      ]);
    }

    setIsDrawing(false);
    setCurrentRect(null);
  };

  const handleAutoDetect = async () => {
    if (!storageId) return;
    setIsDetecting(true);
    try {
      const detected = await detectLabels({ storageId });
      setMasks([
        ...masks,
        ...detected.map((d: any) => ({ ...d, isHidden: true })),
      ]);
      toast.success(`Detected ${detected.length} labels!`);
    } catch (error) {
      toast.error("Detection failed");
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSave = async () => {
    if (!storageId) return;
    try {
      await saveOcclusion({
        materialId,
        storageId,
        title: "Diagram Occlusion",
        masks: masks.map(({ id, x, y, width, height, label }) => ({
          id,
          x,
          y,
          width,
          height,
          label,
        })),
      });
      toast.success("Saved!");
    } catch (error) {
      toast.error("Save failed");
    }
  };

  const toggleMask = (id: string) => {
    setMasks(
      masks.map((m) => (m.id === id ? { ...m, isHidden: !m.isHidden } : m)),
    );
  };

  const deleteMask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMasks(masks.filter((m) => m.id !== id));
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex items-center justify-between bg-[#1a1a1a] p-4 rounded-lg border border-white/10">
        <div className="flex items-center gap-4">
          <Button variant="outline" className="relative overflow-hidden">
            <Upload className="w-4 h-4 mr-2" />
            Upload Diagram
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleUpload}
            />
          </Button>

          {storageId && (
            <>
              <div className="h-6 w-px bg-white/10" />
              <Button
                variant={mode === "edit" ? "secondary" : "ghost"}
                onClick={() => setMode("edit")}
                size="sm"
              >
                <MousePointer2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant={mode === "review" ? "secondary" : "ghost"}
                onClick={() => setMode("review")}
                size="sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                Review
              </Button>
            </>
          )}
        </div>

        {storageId && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoDetect}
              disabled={isDetecting}
            >
              <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
              {isDetecting ? "Detecting..." : "Auto-Detect Labels"}
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 bg-[#0f0f0f] rounded-lg border border-white/10 flex items-center justify-center overflow-hidden relative">
        {!imageUrl ? (
          <div className="text-center text-muted-foreground">
            <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Upload a diagram to start</p>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="relative inline-block max-h-full max-w-full shadow-2xl"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Diagram"
              className="max-h-[80vh] object-contain select-none pointer-events-none"
            />

            {/* Masks */}
            {masks.map((mask) => (
              <div
                key={mask.id}
                className={`absolute border-2 cursor-pointer transition-all duration-200 group
                  ${
                    mask.isHidden
                      ? "bg-orange-500/90 border-orange-600 hover:bg-orange-400/90"
                      : "bg-transparent border-orange-500/50 hover:bg-orange-500/10"
                  }`}
                style={{
                  left: `${mask.x}%`,
                  top: `${mask.y}%`,
                  width: `${mask.width}%`,
                  height: `${mask.height}%`,
                }}
                onClick={() => toggleMask(mask.id)}
              >
                {mode === "edit" && (
                  <button
                    onClick={(e) => deleteMask(mask.id, e)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                {!mask.isHidden && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xs text-orange-500 font-bold drop-shadow-md">
                      Reveal
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Drawing Rect */}
            {currentRect && (
              <div
                className="absolute border-2 border-blue-500 bg-blue-500/20"
                style={{
                  left: `${currentRect.x}%`,
                  top: `${currentRect.y}%`,
                  width: `${currentRect.width}%`,
                  height: `${currentRect.height}%`,
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
