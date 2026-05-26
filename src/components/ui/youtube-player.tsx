import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Play,
  ArrowLeft,
  Loader2,
  ExternalLink,
  AlertCircle,
  Key,
} from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export function YouTubePlayer({ isMinimized }: { isMinimized: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const searchVideos = useAction(api.youtube.searchVideos);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const videos = await searchVideos({ query, maxResults: 20 });
      setResults(videos);
      setActiveVideo(null);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message?.includes("YOUTUBE_API_KEY")
        ? "YouTube API Key is missing. Please add it in the Integrations tab."
        : "Failed to search videos. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (activeVideo) {
    return (
      <div className="flex flex-col h-full bg-black">
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&playsinline=1`}
            className="w-full h-full absolute inset-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="p-3 bg-[#111] border-t border-white/10 shrink-0 flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveVideo(null)}
            className="text-white/60 hover:text-white hover:bg-white/10 h-8 text-xs"
          >
            <ArrowLeft className="w-3 h-3 mr-2" />
            Back to Results
          </Button>
          <a
            href={`https://www.youtube.com/watch?v=${activeVideo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/40 hover:text-white flex items-center gap-1 transition-colors"
          >
            Open <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f]">
      <form
        onSubmit={handleSearch}
        className="p-3 border-b border-white/10 flex gap-2 shrink-0"
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search YouTube..."
          className="bg-white/5 border-white/10 text-white h-8 text-xs focus-visible:ring-red-500/50"
        />
        <Button
          type="submit"
          size="sm"
          className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700 text-white shrink-0"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Search className="w-3 h-3" />
          )}
        </Button>
        <a
          href="https://console.cloud.google.com/apis/credentials"
          target="_blank"
          rel="noopener noreferrer"
          className="h-8 w-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors shrink-0"
          title="Get YouTube API Key"
        >
          <Key className="w-4 h-4" />
        </a>
      </form>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex flex-col items-center text-center gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <p className="text-xs text-red-200">{error}</p>
              {error.includes("API Key") && (
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-red-300 underline hover:text-red-100"
                >
                  Get API Key from Google Cloud Console
                </a>
              )}
            </div>
          )}
          {results.map((video) => (
            <div
              key={video.id}
              onClick={() => setActiveVideo(video.id)}
              className="flex gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors border border-transparent hover:border-white/5 active:scale-[0.98] active:bg-white/10"
            >
              <div className="relative w-32 aspect-video shrink-0 rounded-lg overflow-hidden bg-white/10 shadow-sm">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/0 transition-colors">
                  <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md fill-current" />
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                <h4 className="text-sm font-medium text-white line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                  {video.title}
                </h4>
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs text-white/50 truncate">
                    {video.channelTitle}
                  </p>
                  <p className="text-xs text-white/40 truncate">
                    {new Date(video.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {!loading && !error && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-white/20 gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <Search className="w-8 h-8 opacity-50" />
              </div>
              <span className="text-sm font-medium">
                Search for videos to watch
              </span>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
