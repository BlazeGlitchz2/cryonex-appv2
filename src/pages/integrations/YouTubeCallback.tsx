import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function YouTubeCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const exchangeCode = useAction(api.youtubeAuth.exchangeCode);
  const processedRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (processedRef.current) return;

    if (error) {
      processedRef.current = true;
      toast.error("YouTube authorization failed");
      navigate("/settings");
      return;
    }

    if (code) {
      processedRef.current = true;
      const redirectUri = window.location.origin + "/youtube-callback";
      
      exchangeCode({ code, redirectUri })
        .then(() => {
          toast.success("YouTube connected successfully!");
          navigate("/settings");
        })
        .catch((err) => {
          console.error("YouTube connection error:", err);
          toast.error("Failed to connect YouTube account");
          navigate("/settings");
        });
    } else {
        navigate("/settings");
    }
  }, [searchParams, navigate, exchangeCode]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020005] text-white">
      <Loader2 className="h-10 w-10 animate-spin text-red-500 mb-4" />
      <h2 className="text-xl font-semibold">Connecting to YouTube...</h2>
      <p className="text-white/50 mt-2">Please wait while we complete the setup.</p>
    </div>
  );
}

