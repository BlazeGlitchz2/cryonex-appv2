import { useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, ExternalLink, Settings2, Key } from "lucide-react";

export default function IntegrationsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);

  const integrations = [
    {
      name: "Bytez",
      description: "Access to 100+ AI models including GPT-4, Claude, Gemini, and more",
      status: import.meta.env.VITE_BYTEZ_API_KEY ? "connected" : "disconnected",
      icon: "⚡",
      instructions: "Add your Bytez API Key to the 'Integrations' tab in the sidebar.",
    },
    {
      name: "OpenRouter",
      description: "Access to multiple AI models through a single API",
      status: (import.meta.env.VLY_OPENROUTER_API_KEY || import.meta.env.VITE_OPENROUTER_API_KEY) ? "connected" : "disconnected",
      icon: "🤖",
      instructions: "Add your OpenRouter API Key to the 'Integrations' tab in the sidebar.",
    },
    {
      name: "Ollama",
      description: "Run local AI models on your machine",
      status: "disconnected",
      icon: "🦙",
      instructions: "Ensure Ollama is running locally. No API key required for local host.",
    },
    {
      name: "YouTube",
      description: "Search and play videos directly in the workspace",
      status: "optional",
      icon: "📹",
      instructions: "To enable YouTube search:\n1. Go to the 'Integrations' tab in the left sidebar of this project dashboard.\n2. Click on 'YouTube Data API v3'.\n3. Paste your key into the 'YOUTUBE_API_KEY' field.\n4. Click Save.",
      link: "https://console.cloud.google.com/apis/credentials",
      linkText: "Get API Key"
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
                        <Badge variant="outline" className="gap-1.5 border-green-500/50 text-green-500">
                          <CheckCircle2 className="h-3 w-3" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1.5">
                          <Circle className="h-3 w-3 text-muted-foreground" />
                          {integration.status === "optional" ? "Configure" : "Disconnected"}
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
      </div>

      <Dialog open={!!selectedIntegration} onOpenChange={(open) => !open && setSelectedIntegration(null)}>
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
                  <a href={selectedIntegration.link} target="_blank" rel="noreferrer" className="gap-2">
                    {selectedIntegration.linkText} <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setSelectedIntegration(null)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}