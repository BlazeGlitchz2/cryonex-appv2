import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

export default function IntegrationsPage() {
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