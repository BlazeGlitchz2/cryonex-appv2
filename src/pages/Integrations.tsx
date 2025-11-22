import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, LogOut } from "lucide-react";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useEffect } from "react";
import { useLocation } from "react-router";

export default function IntegrationsPage() {
  const location = useLocation();
  const getSpotifyAuthUrl = useAction(api.spotify.getAuthUrl);
  const spotifyConnection = useQuery(api.spotifyConnection.getConnection);
  const disconnectSpotify = useMutation(api.spotifyConnection.disconnect);

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");
    const spotifyStatus = params.get("spotify");

    if (error) {
      toast.error(`Spotify connection failed: ${error}`);
    } else if (spotifyStatus === "connected") {
      toast.success("Spotify connected successfully!");
    }
  }, [location.search]);

  const handleSpotifyConnect = async () => {
    try {
      // Use the Convex site URL for the redirect
      const convexSiteUrl = import.meta.env.VITE_CONVEX_SITE_URL || window.location.origin;
      const redirectUri = `${convexSiteUrl}/spotify/callback`;
      const authUrl = await getSpotifyAuthUrl({ redirectUri });
      window.location.href = authUrl;
    } catch (error: any) {
      toast.error(error.message || "Failed to initiate Spotify connection");
    }
  };

  const handleSpotifyDisconnect = async () => {
    try {
      await disconnectSpotify();
      toast.success("Spotify account disconnected");
    } catch (error: any) {
      toast.error(error.message || "Failed to disconnect Spotify");
    }
  };

  const integrations = [
    {
      name: "Bytez",
      description: "Access to 100+ AI models including GPT-4, Claude, Gemini, and more",
      status: import.meta.env.VITE_BYTEZ_API_KEY ? "connected" : "disconnected",
      icon: "⚡",
    },
    {
      name: "OpenRouter",
      description: "Access to multiple AI models through a single API",
      status: (import.meta.env.VLY_OPENROUTER_API_KEY || import.meta.env.VITE_OPENROUTER_API_KEY) ? "connected" : "disconnected",
      icon: "🤖",
    },
    {
      name: "Ollama",
      description: "Run local AI models on your machine",
      status: "disconnected",
      icon: "🦙",
    },
    {
      name: "Spotify",
      description: "AI-powered playlist creation and music management",
      status: spotifyConnection ? "connected" : "disconnected",
      icon: "🎵",
      action: "connect",
      onConnect: handleSpotifyConnect,
      onDisconnect: spotifyConnection ? handleSpotifyDisconnect : undefined,
      connectedInfo: spotifyConnection ? `Connected as ${spotifyConnection.displayName}` : undefined,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground mt-1">
            Manage your connected services and APIs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{integration.icon}</div>
                      <div>
                        <CardTitle className="text-lg">
                          {integration.name}
                        </CardTitle>
                        <CardDescription>
                          {integration.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {integration.status === "connected" ? (
                        <Badge variant="outline" className="gap-1.5 border-green-500/50 text-green-500">
                          <CheckCircle2 className="h-3 w-3" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1.5">
                          <Circle className="h-3 w-3 text-muted-foreground" />
                          Disconnected
                        </Badge>
                      )}
                      {integration.connectedInfo && (
                        <p className="text-xs text-muted-foreground">{integration.connectedInfo}</p>
                      )}
                      {integration.action === "connect" && (
                        <div className="flex gap-2">
                          {integration.status === "disconnected" && integration.onConnect && (
                            <Button
                              size="sm"
                              onClick={integration.onConnect}
                              className="mt-2"
                            >
                              Connect
                            </Button>
                          )}
                          {integration.status === "connected" && integration.onDisconnect && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={integration.onDisconnect}
                              className="mt-2 gap-2"
                            >
                              <LogOut className="h-3 w-3" />
                              Disconnect
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}