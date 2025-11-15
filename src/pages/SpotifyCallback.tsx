import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Music } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export default function SpotifyCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Connecting to Spotify...");
  
  const exchangeCode = useAction(api.spotify.exchangeCode);
  const getUserProfile = useAction(api.spotify.getUserProfile);
  const saveConnection = useMutation(api.spotifyConnection.saveConnection);

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get("code");
      const error = params.get("error");

      if (error) {
        setStatus("error");
        setMessage(`Connection failed: ${error}`);
        return;
      }

      if (!code) {
        setStatus("error");
        setMessage("No authorization code received");
        return;
      }

      try {
        // Exchange code for tokens
        const convexSiteUrl = import.meta.env.VITE_CONVEX_SITE_URL || window.location.origin;
        const redirectUri = `${convexSiteUrl}/spotify/callback`;
        
        const tokens = await exchangeCode({ code, redirectUri });
        
        // Get user profile
        const profile = await getUserProfile({ accessToken: tokens.accessToken });
        
        // Save connection to database
        const expiresAt = Date.now() + tokens.expiresIn * 1000;
        await saveConnection({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt,
          spotifyUserId: profile.id,
          displayName: profile.display_name || profile.id,
        });

        setStatus("success");
        setMessage("Successfully connected to Spotify!");
        toast.success("Spotify account connected!");
        
        // Redirect to integrations after 2 seconds
        setTimeout(() => {
          navigate("/integrations");
        }, 2000);
      } catch (err: any) {
        console.error("Spotify callback error:", err);
        setStatus("error");
        setMessage(err.message || "Failed to connect to Spotify");
        toast.error("Failed to connect to Spotify");
      }
    };

    handleCallback();
  }, [location.search, navigate, exchangeCode, getUserProfile, saveConnection]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-[#1a1a1a] border-[#2a2a2a] w-full max-w-md">
          <CardContent className="p-8 text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              {status === "loading" && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-16 w-16 text-green-500" />
                </motion.div>
              )}
              {status === "success" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                </motion.div>
              )}
              {status === "error" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <XCircle className="h-16 w-16 text-red-500" />
                </motion.div>
              )}
            </div>

            {/* Spotify Logo */}
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                <Music className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white">
                {status === "loading" && "Connecting..."}
                {status === "success" && "Connected!"}
                {status === "error" && "Connection Failed"}
              </h2>
              <p className="text-[#aaaaaa]">{message}</p>
            </div>

            {/* Action Button */}
            {status === "error" && (
              <Button
                onClick={() => navigate("/integrations")}
                className="w-full bg-white text-black hover:bg-white/90"
              >
                Back to Integrations
              </Button>
            )}

            {status === "success" && (
              <p className="text-sm text-[#6b6b6b]">
                Redirecting to integrations...
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
