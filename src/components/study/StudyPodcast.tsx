import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, Volume2, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface StudyPodcastProps {
  materialId?: string;
  content?: string;
  title?: string;
}

export function StudyPodcast({ materialId, content, title }: StudyPodcastProps) {
  const [script, setScript] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voice, setVoice] = useState<"alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer">("alloy");
  const [speed, setSpeed] = useState([1.0]);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  
  const generatePodcast = useAction(api.studyAI.generatePodcastSummary);

  const handleGenerate = async () => {
    if (!content) {
      toast.error("No content available to generate podcast");
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading("AI is generating your podcast...");

    try {
      const result = await generatePodcast({
        content,
        voice,
        speed: speed[0],
      });

      setScript(result.script);
      
      // Get audio URL from storage
      const url = await fetch(`${import.meta.env.VITE_CONVEX_URL}/api/storage/${result.audioStorageId}`).then(r => r.url);
      setAudioUrl(url);
      
      toast.dismiss(loadingToast);
      toast.success("Podcast generated successfully!");
    } catch (error: any) {
      toast.dismiss(loadingToast);
      
      // Check if TTS is not configured
      if (error.message?.includes("OpenAI API key")) {
        toast.error("Text-to-Speech not configured. Showing script only.");
        // Generate script only
        try {
          const scriptResult = await generatePodcast({
            content,
            voice,
            speed: speed[0],
          });
          setScript(scriptResult.script);
        } catch (scriptError: any) {
          toast.error(scriptError.message || "Failed to generate podcast script");
        }
      } else {
        toast.error(error.message || "Failed to generate podcast");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioUrl) return;

    if (!audioElement) {
      const audio = new Audio(audioUrl);
      audio.playbackRate = speed[0];
      audio.onended = () => setIsPlaying(false);
      setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSpeedChange = (newSpeed: number[]) => {
    setSpeed(newSpeed);
    if (audioElement) {
      audioElement.playbackRate = newSpeed[0];
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Podcast Generator</h2>
            <p className="text-sm text-[#6b6b6b]">Convert your study material into an audio podcast</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm text-[#6b6b6b] mb-2 block">Voice</label>
            <Select value={voice} onValueChange={(v: any) => setVoice(v)}>
              <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alloy">Alloy (Neutral)</SelectItem>
                <SelectItem value="echo">Echo (Male)</SelectItem>
                <SelectItem value="fable">Fable (British)</SelectItem>
                <SelectItem value="onyx">Onyx (Deep)</SelectItem>
                <SelectItem value="nova">Nova (Female)</SelectItem>
                <SelectItem value="shimmer">Shimmer (Soft)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-[#6b6b6b] mb-2 block">Speed: {speed[0].toFixed(1)}x</label>
            <Slider
              value={speed}
              onValueChange={handleSpeedChange}
              min={0.5}
              max={2.0}
              step={0.1}
              className="mt-2"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !content}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Podcast"}
            </Button>
          </div>
        </div>

        {audioUrl && (
          <div className="flex items-center gap-4 p-4 bg-[#1a1a1a] rounded-lg">
            <Button
              onClick={handlePlayPause}
              size="icon"
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <div className="flex-1">
              <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-0 transition-all" />
              </div>
            </div>
            <Volume2 className="h-5 w-5 text-[#6b6b6b]" />
            <a href={audioUrl} download={`${title || "podcast"}.mp3`}>
              <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </a>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 p-6">
        {script ? (
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader>
              <CardTitle className="text-white">Podcast Script</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <p className="text-white whitespace-pre-wrap">{script}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Volume2 className="h-12 w-12 text-[#6b6b6b] mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No podcast generated yet</h3>
            <p className="text-sm text-[#6b6b6b]">
              Click "Generate Podcast" to create an audio summary of your study material
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}