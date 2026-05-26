import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Settings2,
  Zap,
  BadgeCent,
  BrainCircuit,
  ShieldCheck,
} from "lucide-react";

export default function IntegrationsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const providerStatus = useQuery(api.keys.getProviderStatus);
  const configuredCount = providerStatus
    ? Object.values(providerStatus.providers).filter((provider: any) =>
        Boolean(provider?.configured),
      ).length
    : 0;

  const simpleModes = [
    {
      name: "Fastest",
      description: "Use the quickest available model for short study help and drafts.",
      icon: Zap,
    },
    {
      name: "Cheapest",
      description: "Prefer low-cost routes and free fallbacks when quality is good enough.",
      icon: BadgeCent,
    },
    {
      name: "Best reasoning",
      description: "Use stronger models for hard explanations, quizzes, and research tasks.",
      icon: BrainCircuit,
    },
    {
      name: "Use my own key",
      description: "Advanced users can connect provider keys and manage fallback behavior.",
      icon: ShieldCheck,
    },
  ];

  const integrations = [
    {
      name: "Groq",
      description: "Fast chat and Whisper transcription with OpenAI-compatible APIs",
      status: providerStatus?.providers.groq.configured ? "connected" : "disconnected",
      icon: "⚡",
      instructions:
        "Set GROQ_API_KEY in your server environment. Legacy API_KEY_GROQ is also supported.",
      link: "https://console.groq.com/keys",
      linkText: "Get Groq Key",
    },
    {
      name: "SambaNova",
      description: "High-capacity reasoning and study-generation fallback provider",
      status: providerStatus?.providers.sambanova.configured ? "connected" : "disconnected",
      icon: "🧠",
      instructions:
        "Set SAMBANOVA_API_KEY in your server environment. Legacy API_KEY_SAMBANOVA is also supported.",
      link: "https://cloud.sambanova.ai/apis",
      linkText: "Get SambaNova Key",
    },
    {
      name: "Cerebras",
      description: "Ultra-fast inference for structured and study workloads",
      status: providerStatus?.providers.cerebras.configured ? "connected" : "disconnected",
      icon: "🟠",
      instructions:
        "Set CEREBRAS_API_KEY in your server environment.",
      link: "https://cloud.cerebras.ai/",
      linkText: "Get Cerebras Key",
    },
    {
      name: "Google Gemini",
      description: "Native multimodal chat and embeddings provider",
      status: providerStatus?.providers.google.configured ? "connected" : "disconnected",
      icon: "✨",
      instructions:
        "Set GEMINI_API_KEY in your server environment. GOOGLE_GENERATIVE_AI_API_KEY and API_KEY_GOOGLE are also supported.",
      link: "https://ai.google.dev/",
      linkText: "Get Gemini Key",
    },
    {
      name: "OpenRouter",
      description: "Free-model router and broad model-compatibility fallback layer",
      status: providerStatus?.providers.openrouter.configured ? "connected" : "disconnected",
      icon: "🧭",
      instructions:
        "Set OPENROUTER_API_KEY in your server environment. Legacy OPENROUTER aliases are also supported.",
      link: "https://openrouter.ai/keys",
      linkText: "Get OpenRouter Key",
    },
    {
      name: "Hugging Face",
      description: "Inference Providers backup route for open and hosted models",
      status: providerStatus?.providers.huggingface.configured ? "connected" : "disconnected",
      icon: "🤗",
      instructions:
        "Set HF_TOKEN in your server environment. HUGGINGFACE_API_KEY and API_KEY_HUGGINGFACE are also supported.",
      link: "https://huggingface.co/settings/tokens",
      linkText: "Get HF Token",
    },
    {
      name: "Pollinations",
      description: "Free text, image, and multimodal fallback layer with optional API key",
      status: providerStatus?.providers.pollinations.configured ? "connected" : "optional",
      icon: "🌸",
      instructions:
        "Basic Pollinations usage can work without a key. Add POLLINATIONS_API_KEY for higher limits, current authenticated text models, and advanced features like premium video.",
      link: "https://enter.pollinations.ai",
      linkText: "Get Pollinations Key",
    },
    {
      name: "Mistral OCR",
      description: "PDF OCR and upload-readiness provider for study extraction",
      status: providerStatus?.providers.mistral.configured ? "connected" : "disconnected",
      icon: "📄",
      instructions:
        "Set MISTRAL_API_KEY in your server environment. Legacy API_KEY_MISTRAL is also supported.",
      link: "https://console.mistral.ai/",
      linkText: "Get Mistral Key",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            AI Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Choose how Cryonex should balance speed, cost, and reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {simpleModes.map((mode, index) => {
            const Icon = mode.icon;
            return (
              <motion.div
                key={mode.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <Card className="bg-card/60 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{mode.name}</CardTitle>
                        <CardDescription>{mode.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <details className="rounded-2xl border border-border bg-card/40 p-4">
          <summary className="cursor-pointer list-none text-sm font-semibold">
            Advanced Providers
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {configuredCount} connected
            </span>
          </summary>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors cursor-pointer group relative overflow-hidden"
                  onClick={() => setSelectedIntegration(integration)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{integration.icon}</div>
                        <div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {integration.name}
                          </CardTitle>
                          <CardDescription>
                            {integration.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {integration.status === "connected" ? (
                          <Badge
                            variant="outline"
                            className="gap-1.5 border-green-500/50 text-green-500"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1.5">
                            <Circle className="h-3 w-3 text-muted-foreground" />
                            {integration.status === "optional"
                              ? "Configure"
                              : "Disconnected"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Card>
              </motion.div>
            ))}
          </div>
        </details>
      </div>

      <Dialog
        open={!!selectedIntegration}
        onOpenChange={(open) => !open && setSelectedIntegration(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedIntegration?.icon} Configure {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription>
              Follow these steps to connect this integration.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
              <div className="flex items-start gap-3">
                <Settings2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">Setup Instructions</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {selectedIntegration?.instructions}
                  </p>
                </div>
              </div>
            </div>

            {selectedIntegration?.link && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={selectedIntegration.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    {selectedIntegration.linkText}{" "}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setSelectedIntegration(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
