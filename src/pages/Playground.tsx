import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, RotateCcw, Settings, Play, Image as ImageIcon, Video, Download, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useChatStore } from "@/lib/stores/chat-store";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function PlaygroundPage() {
  const { activeModel, activeImageModel, activeVideoModel } = useChatStore();
  const [activeTab, setActiveTab] = useState("text");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [generatedMedia, setGeneratedMedia] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);

  const apiKeys = useQuery(api.keys.getApiKeys);

  const handleRunText = async () => {
    if (!input.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    const apiKey = apiKeys?.BYTEZ_API_KEY || import.meta.env.VITE_BYTEZ_API_KEY;

    if (!apiKey) {
      toast.error("Please configure your BYTEZ_API_KEY");
      return;
    }

    setIsLoading(true);
    setOutput("");

    try {
      const response = await fetch(`https://api.bytez.com/models/v2/openai/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey,
          "provider-key": apiKeys?.PROVIDER_API_KEY || "",
        },
        body: JSON.stringify({
          model: activeModel,
          messages: [{ role: "user", content: input }],
          stream: true,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || parsed.output?.content;
                if (content) {
                  result += content;
                  setOutput(result);
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

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
      // Check if using Replicate model - REMOVED REPLICATE SUPPORT
      if (activeImageModel.startsWith("replicate/")) {
         toast.error("Replicate models are currently unavailable.");
         setIsLoading(false);
         return;
      }

      // Bytez image generation (default for non-Replicate models)
      const apiKey = apiKeys?.BYTEZ_API_KEY || import.meta.env.VITE_BYTEZ_API_KEY;
      if (!apiKey) {
        throw new Error("Please configure your BYTEZ_API_KEY in the API Keys tab (Backend section)");
      }

      toast.info("Generating image with Bytez...");

      const response = await fetch(`https://api.bytez.com/models/v2/${activeImageModel}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey,
        },
        body: JSON.stringify({
          text: input,
          stream: false,
          params: {}
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Bytez API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const imageUrl = data.output?.images?.[0] || data.output;
      
      if (!imageUrl) {
        throw new Error("No image URL in response from Bytez");
      }
      
      setGeneratedMedia(imageUrl);
      toast.success("Image generated successfully!");
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
      // Check if using Replicate model - REMOVED REPLICATE SUPPORT
      if (activeVideoModel.startsWith("replicate/")) {
         toast.error("Replicate models are currently unavailable.");
         setIsLoading(false);
         return;
      }

      // Puter video generation (default for puter/ models)
      const puterWindow = window as any;
      if (!puterWindow.puter || !puterWindow.puter.ai || !puterWindow.puter.ai.txt2vid) {
        throw new Error("Puter.js is not loaded. Please refresh the page.");
      }

      toast.info("Generating video with Puter Sora-2... This may take a moment.");
      
      const video = await puterWindow.puter.ai.txt2vid(input, {
        model: "sora-2",
        seconds: 8,
        size: "1280x720"
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

    setIsLoading(true);
    try {
      // Placeholder for Bytez integration
      toast.info("Playground execution coming soon with Bytez!");
      /*
      const result = await runModel({
        model: activeModel,
        prompt,
      });
      setOutput(result);
      */
      setOutput("AI execution placeholder");
    } catch (error) {
      toast.error("Failed to run model");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  return (
    <AppLayout>
      <div className="h-full flex flex-col bg-[#0a0a0a]">
        <div className="border-b border-[#1a1a1a] px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">AI Playground</h1>
              <p className="text-[#aaaaaa] mt-1">Test and experiment with text, image, and video generation</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-[#1a1a1a] px-6 pt-4">
            <TabsList className="bg-[#1a1a1a] border border-[#2a2a2a]">
              <TabsTrigger value="text" className="gap-2 data-[state=active]:bg-[#2a2a2a]">
                <Sparkles className="h-4 w-4" />
                Text
              </TabsTrigger>
              <TabsTrigger value="image" className="gap-2 data-[state=active]:bg-[#2a2a2a]">
                <ImageIcon className="h-4 w-4" />
                Image
              </TabsTrigger>
              <TabsTrigger value="video" className="gap-2 data-[state=active]:bg-[#2a2a2a]">
                <Video className="h-4 w-4" />
                Video
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden flex gap-4 p-4">
            {/* Left Panel - Input */}
            <div className="flex-1 flex flex-col min-w-0">
              <Card className="flex-1 flex flex-col bg-[#1a1a1a] border-[#2a2a2a]">
                <div className="p-4 border-b border-[#2a2a2a]">
                  <h2 className="text-sm font-semibold text-white">Prompt</h2>
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
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-4 placeholder:text-[#6b6b6b] text-white resize-none"
                />
              </Card>

              {/* Settings - Only for text */}
              {activeTab === "text" && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-4">
                    <label className="text-xs font-semibold text-[#aaaaaa] block mb-2">
                      Temperature: {temperature.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </Card>
                  <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-4">
                    <label className="text-xs font-semibold text-[#aaaaaa] block mb-2">
                      Max Tokens: {maxTokens}
                    </label>
                    <input
                      type="range"
                      min="100"
                      max="4000"
                      step="100"
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </Card>
                </div>
              )}

              {/* Run Button */}
              <motion.div className="mt-4">
                <Button
                  onClick={handleRun}
                  disabled={isLoading || !input.trim()}
                  className="w-full bg-white text-black hover:bg-white/90 disabled:opacity-50 gap-2 h-10"
                >
                  <motion.div
                    animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                    transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
                  >
                    <Play className="h-4 w-4" />
                  </motion.div>
                  {isLoading ? "Generating..." : "Run"}
                </Button>
              </motion.div>
            </div>

            {/* Right Panel - Output */}
            <div className="flex-1 flex flex-col min-w-0">
              <Card className="flex-1 flex flex-col bg-[#1a1a1a] border-[#2a2a2a] overflow-hidden">
                <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Output</h2>
                    <Badge variant="outline" className="mt-2 text-xs border-[#3a3a3a]">
                      {activeTab === "text" 
                        ? activeModel.split("/")[1] || activeModel
                        : activeTab === "image"
                        ? activeImageModel.split("/")[1] || activeImageModel
                        : activeVideoModel.split("/")[1] || activeVideoModel
                      }
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
                          className="h-8 w-8 text-[#6b6b6b] hover:text-white hover:bg-[#2a2a2a]"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setOutput("")}
                          disabled={!output}
                          className="h-8 w-8 text-[#6b6b6b] hover:text-white hover:bg-[#2a2a2a]"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {(activeTab === "image" || activeTab === "video") && generatedMedia && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(generatedMedia, "_blank")}
                        className="h-8 w-8 text-[#6b6b6b] hover:text-white hover:bg-[#2a2a2a]"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4">
                    {activeTab === "text" && (
                      output ? (
                        <div className="prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown>{output}</ReactMarkdown>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-[#6b6b6b]">
                          <p className="text-sm">Output will appear here...</p>
                        </div>
                      )
                    )}
                    {activeTab === "image" && (
                      generatedMedia ? (
                        <div className="flex items-center justify-center">
                          <img src={generatedMedia} alt="Generated" className="max-w-full rounded-lg" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-[#6b6b6b]">
                          <p className="text-sm">Generated image will appear here...</p>
                        </div>
                      )
                    )}
                    {activeTab === "video" && (
                      generatedMedia ? (
                        <div className="flex items-center justify-center">
                          <video src={generatedMedia} controls className="max-w-full rounded-lg" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-[#6b6b6b]">
                          <p className="text-sm">Generated video will appear here...</p>
                        </div>
                      )
                    )}
                  </div>
                </ScrollArea>
              </Card>
            </div>
          </div>
        </Tabs>
      </div>
    </AppLayout>
  );
}