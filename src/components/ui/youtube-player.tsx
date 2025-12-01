import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Play, ArrowLeft, Loader2, ExternalLink } from "lucide-react";
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const videos = await searchVideos({ query, maxResults: 20 });
      setResults(videos);
      setActiveVideo(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to search videos. Check API key.");
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
                rel="noreferrer"
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
      <form onSubmit={handleSearch} className="p-3 border-b border-white/10 flex gap-2 shrink-0">
        <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search YouTube..."
            className="bg-white/5 border-white/10 text-white h-8 text-xs focus-visible:ring-red-500/50"
        />
        <Button type="submit" size="sm" className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700 text-white shrink-0">
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
        </Button>
      </form>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
            {results.map((video) => (
                <div 
                    key={video.id}
                    onClick={() => setActiveVideo(video.id)}
                    className="flex gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors"
                >
                    <div className="relative w-28 aspect-video shrink-0 rounded-md overflow-hidden bg-white/10">
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/0 transition-colors">
                            <Play className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md fill-current" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="text-xs font-medium text-white line-clamp-2 leading-tight mb-1 group-hover:text-red-400 transition-colors">{video.title}</h4>
                        <p className="text-[10px] text-white/40 truncate">{video.channelTitle}</p>
                        <p className="text-[10px] text-white/30 truncate mt-0.5">{new Date(video.publishedAt).toLocaleDateString()}</p>
                    </div>
                </div>
            ))}
            {!loading && results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-white/20 gap-2">
                    <Search className="w-8 h-8 opacity-50" />
                    <span className="text-xs">Search for videos to watch</span>
                </div>
            )}
        </div>
      </ScrollArea>
    </div>
  );
}
