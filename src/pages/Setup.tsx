import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ExternalLink, Key, Database, Mic, CheckCircle } from "lucide-react";

export default function SetupPage() {
  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a]">
      {/* Top Bar */}
      <div className="h-16 border-b border-[#1a1a1a] flex items-center justify-between px-6 shrink-0">
        <h1 className="text-xl font-bold text-white">Study App Setup Guide</h1>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Required Configuration
            </h2>
            <p className="text-[#6b6b6b]">
              Set these environment variables in your backend (Convex) to enable
              all Study App features.
            </p>
          </div>

          {/* PDF Extraction - Now using Hugging Face Gradio */}
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                PDF Extraction Service (Automatic)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border border-green-500/30 rounded-lg p-4 bg-green-500/5">
                <h4 className="text-sm font-semibold text-green-400 mb-2">
                  ✅ No Setup Required!
                </h4>
                <p className="text-sm text-[#6b6b6b]">
                  PDF extraction now uses the free Hugging Face Gradio Space:{" "}
                  <code className="text-xs bg-[#2a2a2a] px-1 py-0.5 rounded">
                    Biifruu/PDF_to_JSON
                  </code>
                </p>
                <p className="text-sm text-[#6b6b6b] mt-2">
                  This service is automatically integrated and requires no
                  additional configuration or deployment.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() =>
                    window.open(
                      "https://huggingface.co/spaces/Biifruu/PDF_to_JSON",
                      "_blank",
                    )
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Hugging Face Space
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* LLM Configuration */}
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-400" />
                LLM & Embeddings (Required)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <code className="text-sm bg-[#2a2a2a] px-2 py-1 rounded text-blue-400">
                  OPENROUTER_API_KEY
                </code>
                <p className="text-sm text-[#6b6b6b] mt-2">
                  API key for OpenRouter (or OpenAI). Used for generating
                  summaries, flashcards, quizzes, and chat responses.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    window.open("https://openrouter.ai/keys", "_blank")
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Get OpenRouter Key
                </Button>
              </div>
              <div>
                <code className="text-sm bg-[#2a2a2a] px-2 py-1 rounded text-blue-400">
                  EMBEDDINGS_PROVIDER
                </code>
                <p className="text-sm text-[#6b6b6b] mt-2">
                  Default: "openai". Provider for text embeddings (openai,
                  azure, cohere).
                </p>
              </div>
              <div>
                <code className="text-sm bg-[#2a2a2a] px-2 py-1 rounded text-blue-400">
                  EMBEDDINGS_MODEL
                </code>
                <p className="text-sm text-[#6b6b6b] mt-2">
                  Default: "text-embedding-3-large". Model for generating
                  embeddings.
                </p>
              </div>
              <div>
                <code className="text-sm bg-[#2a2a2a] px-2 py-1 rounded text-blue-400">
                  LLM_MODEL
                </code>
                <p className="text-sm text-[#6b6b6b] mt-2">
                  Default: "gpt-4o-mini". Model for text generation tasks.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Text-to-Speech */}
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-green-400" />
                Text-to-Speech (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <code className="text-sm bg-[#2a2a2a] px-2 py-1 rounded text-green-400">
                  OPENAI_API_KEY
                </code>
                <p className="text-sm text-[#6b6b6b] mt-2">
                  OpenAI API key for TTS (podcast audio generation). If not set,
                  only podcast scripts will be generated.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    window.open(
                      "https://platform.openai.com/api-keys",
                      "_blank",
                    )
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  OpenAI TTS Docs
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Start */}
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-[#6b6b6b]">
                1. ✅ PDF extraction is already configured (no setup needed)
              </p>
              <p className="text-sm text-[#6b6b6b]">
                2. Set <code className="text-blue-400">OPENROUTER_API_KEY</code>{" "}
                in your backend environment
              </p>
              <p className="text-sm text-[#6b6b6b]">
                3. Upload a PDF to the Study Dashboard
              </p>
              <p className="text-sm text-[#6b6b6b]">
                4. Wait for extraction and auto-generation (≤30s for 20-page
                PDFs)
              </p>
              <p className="text-sm text-[#6b6b6b]">
                5. Access Flashcards, Quizzes, Podcast, and Planner in the
                Workspace
              </p>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
