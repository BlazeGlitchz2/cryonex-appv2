import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Search, Music, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SpotifySearchPage() {
  const [query, setQuery] = useState("");
  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchAlbums = useAction(api.spotify.searchAlbums);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchAlbums({ query, limit: 20 });
      setAlbums(results);
      toast.success(`Found ${results.length} albums`);
    } catch (error: any) {
      console.error("Search error:", error);
      toast.error(error.message || "Failed to search albums");
      setAlbums([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout showBackButton>
      <div className="h-full flex flex-col bg-[#0a0a0a]">
        <div className="border-b border-[#1a1a1a] px-6 py-4 shrink-0">
          <h1 className="text-2xl font-semibold text-white">Spotify Album Search</h1>
          <p className="text-[#aaaaaa] mt-1">Search for albums using the Spotify API</p>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-hidden flex flex-col">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for albums..."
              className="flex-1 bg-[#1a1a1a] border-[#2a2a2a] text-white"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-white gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </form>

          {/* Results */}
          <ScrollArea className="flex-1">
            {albums.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {albums.map((album, index) => (
                  <motion.div
                    key={album.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-[#1a1a1a] border-[#2a2a2a] hover:bg-[#1f1f1f] transition-colors">
                      <CardHeader className="p-4">
                        {album.images[0] && (
                          <img
                            src={album.images[0].url}
                            alt={album.name}
                            className="w-full aspect-square object-cover rounded-lg mb-3"
                          />
                        )}
                        <CardTitle className="text-white text-base line-clamp-1">
                          {album.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-1">
                          {album.artists.map((a: any) => a.name).join(", ")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {album.release_date.split("-")[0]}
                        </Badge>
                        <a
                          href={album.external_urls.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:text-green-400 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <Music className="h-16 w-16 text-[#3a3a3a]" />
                <div>
                  <h3 className="text-lg font-semibold text-white">No albums yet</h3>
                  <p className="text-[#6b6b6b] text-sm mt-1">
                    Search for albums to see results here
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </AppLayout>
  );
}
