import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <AppLayout showBackButton>
      <div className="h-full flex flex-col">
        <div className="border-b px-6 py-4 flex items-center justify-between shrink-0">
          <h1 className="text-2xl font-semibold">GPTs</h1>
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

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gpts?.map((gpt, index) => (
              <motion.div
                key={gpt._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="cursor-pointer hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{gpt.emoji}</div>
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
        </ScrollArea>
      </div>
    </AppLayout>
  );
}
