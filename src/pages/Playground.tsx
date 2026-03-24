import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Copy,
  RotateCcw,
  Settings,
  Play,
  Image as ImageIcon,
  Video,
  Download,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { useChatStore } from "@/lib/stores/chat-store";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

let puterScriptPromise: Promise<void> | null = null;

function ensurePuterScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Puter is only available in the browser."));
  }

  const puterWindow = window as any;
  if (puterWindow.puter?.ai?.txt2vid) {
    return Promise.resolve();
  }

  if (puterScriptPromise) {
    return puterScriptPromise;
  }

  puterScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-puter-sdk="true"]',
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Puter SDK.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.puter.com/v2/";
    script.async = true;
    script.dataset.puterSdk = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Puter SDK."));
    document.head.appendChild(script);
  }).catch((error) => {
    puterScriptPromise = null;
    throw error;
  });

  return puterScriptPromise;
}

export default function PlaygroundPage() {
  const { activeModel, activeImageModel, activeVideoModel } = useChatStore();
  const runChat = useAction(api.playground.chat);
  const [activeTab, setActiveTab] = useState("text");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [generatedMedia, setGeneratedMedia] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);

  const handleRunText = async () => {
    if (!input.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    setOutput("");

    try {
      // Use the server-side action which handles the API key
      const result = await runChat({
        model: activeModel,
        messages: [{ role: "user", content: input }],
        temperature,
        maxTokens,
      });

      setOutput(result);
      toast.success("Response generated");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to generate response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunImage = async () => {
    if (!input.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    setGeneratedMedia(null);

    try {
      if (activeImageModel.startsWith("replicate/")) {
        toast.error("Replicate models are currently unavailable.");
        setIsLoading(false);
        return;
      }

      toast.info("Image generation is currently disabled.");
      return;
    } catch (error: any) {
      console.error("Image generation error:", error);
      toast.error(error.message || "Failed to generate image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunVideo = async () => {
    if (!input.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    setGeneratedMedia(null);

    try {
      await ensurePuterScript();
      if (activeVideoModel.startsWith("replicate/")) {
        toast.error("Replicate models are currently unavailable.");
        setIsLoading(false);
        return;
      }

      const puterWindow = window as any;
      if (
        !puterWindow.puter ||
        !puterWindow.puter.ai ||
        !puterWindow.puter.ai.txt2vid
      ) {
        throw new Error("Puter.js is not loaded. Please refresh the page.");
      }

      toast.info(
        "Generating video with Puter Sora-2... This may take a moment.",
      );

      const video = await puterWindow.puter.ai.txt2vid(input, {
        model: "sora-2",
        seconds: 8,
        size: "1280x720",
      });

      if (!video || !video.src) {
        throw new Error("No video URL returned from Puter");
      }

      setGeneratedMedia(video.src);
      toast.success("Video generated successfully!");
    } catch (error: any) {
      console.error("Video generation error:", error);
      toast.error(error.message || "Failed to generate video");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRun = async () => {
    if (!input.trim()) return;

    if (activeTab === "text") {
      await handleRunText();
    } else if (activeTab === "image") {
      await handleRunImage();
    } else if (activeTab === "video") {
      await handleRunVideo();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="h-full flex flex-col bg-background/50 backdrop-blur-sm">
      <div className="border-b border-border px-6 py-4 shrink-0 bg-background/50 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              AI Playground
            </h1>
            <p className="text-muted-foreground mt-1">
              Test and experiment with text, image, and video generation
            </p>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="border-b border-border px-6 pt-4 bg-background/30">
          <TabsList className="bg-muted/50 border border-border">
            <TabsTrigger
              value="text"
              className="gap-2 data-[state=active]:bg-background"
            >
              <Sparkles className="h-4 w-4" />
              Text
            </TabsTrigger>
            <TabsTrigger
              value="image"
              className="gap-2 data-[state=active]:bg-background"
            >
              <ImageIcon className="h-4 w-4" />
              Image
            </TabsTrigger>
            <TabsTrigger
              value="video"
              className="gap-2 data-[state=active]:bg-background"
            >
              <Video className="h-4 w-4" />
              Video
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto md:overflow-hidden flex flex-col md:flex-row gap-4 p-4">
          {/* Left Panel - Input */}
          <div className="flex-shrink-0 md:flex-1 flex flex-col min-w-0 min-h-[500px] md:min-h-0">
            <Card className="flex-1 flex flex-col bg-card/50 border-border backdrop-blur-sm">
              <div className="p-4 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">
                  Prompt
                </h2>
              </div>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  activeTab === "text"
                    ? "Enter your prompt here..."
                    : activeTab === "image"
                      ? "Describe the image you want to generate..."
                      : "Describe the video you want to generate..."
                }
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-4 placeholder:text-muted-foreground text-foreground resize-none"
              />
            </Card>

            {/* Settings - Only for text */}
            {activeTab === "text" && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Card className="bg-card/50 border-border p-4 backdrop-blur-sm">
                  <label className="text-xs font-semibold text-muted-foreground block mb-2">
                    Temperature: {temperature.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-primary"
                  />
                </Card>
                <Card className="bg-card/50 border-border p-4 backdrop-blur-sm">
                  <label className="text-xs font-semibold text-muted-foreground block mb-2">
                    Max Tokens: {maxTokens}
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="4000"
                    step="100"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full accent-primary"
                  />
                </Card>
              </div>
            )}

            {/* Run Button */}
            <motion.div className="mt-4">
              <Button
                onClick={handleRun}
                disabled={isLoading || !input.trim()}
                className="w-full gap-2 h-10"
              >
                <motion.div
                  animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                  transition={{
                    duration: 1,
                    repeat: isLoading ? Infinity : 0,
                    ease: "linear",
                  }}
                >
                  <Play className="h-4 w-4" />
                </motion.div>
                {isLoading ? "Generating..." : "Run"}
              </Button>
            </motion.div>
          </div>

          {/* Right Panel - Output */}
          <div className="flex-shrink-0 md:flex-1 flex flex-col min-w-0 min-h-[500px] md:min-h-0">
            <Card className="flex-1 flex flex-col bg-card/50 border-border overflow-hidden backdrop-blur-sm">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Output
                  </h2>
                  <Badge
                    variant="outline"
                    className="mt-2 text-xs border-border"
                  >
                    {activeTab === "text"
                      ? activeModel.split("/")[1] || activeModel
                      : activeTab === "image"
                        ? activeImageModel.split("/")[1] || activeImageModel
                        : activeVideoModel.split("/")[1] || activeVideoModel}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {activeTab === "text" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopy}
                        disabled={!output}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setOutput("")}
                        disabled={!output}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {(activeTab === "image" || activeTab === "video") &&
                    generatedMedia && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(generatedMedia, "_blank")}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4">
                  {activeTab === "text" &&
                    (output ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
                        <ReactMarkdown>{output}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p className="text-sm">Output will appear here...</p>
                      </div>
                    ))}
                  {activeTab === "image" &&
                    (generatedMedia ? (
                      <div className="flex items-center justify-center">
                        <img
                          src={generatedMedia}
                          alt="Generated"
                          className="max-w-full rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p className="text-sm">
                          Generated image will appear here...
                        </p>
                      </div>
                    ))}
                  {activeTab === "video" &&
                    (generatedMedia ? (
                      <div className="flex items-center justify-center">
                        <video
                          src={generatedMedia}
                          controls
                          className="max-w-full rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p className="text-sm">
                          Generated video will appear here...
                        </p>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
