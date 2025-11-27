import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function GPTsPage() {
  const gpts = useQuery(api.gpts.list);
  const createGPT = useMutation(api.gpts.create);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGPT, setNewGPT] = useState({
    name: "",
    emoji: "🤖",
    description: "",
    systemPrompt: "",
  });

  const handleCreate = async () => {
    if (!newGPT.name || !newGPT.systemPrompt) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createGPT(newGPT);
      toast.success("GPT created");
      setIsDialogOpen(false);
      setNewGPT({ name: "", emoji: "🤖", description: "", systemPrompt: "" });
    } catch (error) {
      toast.error("Failed to create GPT");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">GPTs</h1>
            <p className="text-muted-foreground mt-1">Create and manage custom AI assistants.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New GPT
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Custom GPT</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={newGPT.name}
                    onChange={(e) =>
                      setNewGPT({ ...newGPT, name: e.target.value })
                    }
                    placeholder="Code Assistant"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Emoji</label>
                  <Input
                    value={newGPT.emoji}
                    onChange={(e) =>
                      setNewGPT({ ...newGPT, emoji: e.target.value })
                    }
                    placeholder="🤖"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={newGPT.description}
                    onChange={(e) =>
                      setNewGPT({ ...newGPT, description: e.target.value })
                    }
                    placeholder="Helps with coding tasks"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">System Prompt</label>
                  <Textarea
                    value={newGPT.systemPrompt}
                    onChange={(e) =>
                      setNewGPT({ ...newGPT, systemPrompt: e.target.value })
                    }
                    placeholder="You are a helpful coding assistant..."
                    className="min-h-[120px]"
                  />
                </div>
                <Button onClick={handleCreate} className="w-full">
                  Create GPT
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gpts?.map((gpt, index) => (
            <motion.div
              key={gpt._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="cursor-pointer hover:border-primary transition-all hover:shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="text-4xl bg-secondary/50 rounded-lg p-2">{gpt.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg">{gpt.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {gpt.description}
                      </CardDescription>
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
