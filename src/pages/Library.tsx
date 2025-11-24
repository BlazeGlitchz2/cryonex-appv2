import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, FileText, Sparkles, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function LibraryPage() {
  const libraryItems = useQuery(api.library.list);
  const createItem = useMutation(api.library.create);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    prompt: "",
    category: "",
  });

  const handleCreate = async () => {
    if (!newItem.title || !newItem.prompt) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createItem(newItem);
      toast.success("Library item created");
      setIsDialogOpen(false);
      setNewItem({ title: "", prompt: "", category: "" });
    } catch (error) {
      toast.error("Failed to create item");
    }
  };

  const filteredItems = libraryItems?.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 h-full overflow-hidden relative">
       {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[#020005]">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.15),_transparent_50%)]" />
      </div>

      <div className="h-full overflow-y-auto p-6 md:p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
          
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Your Library</h1>
              <p className="text-white/50 mt-2 text-lg">Manage your prompts and knowledge assets</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search library..."
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 h-10 rounded-full focus:bg-white/10 transition-colors"
                />
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white hover:opacity-90 rounded-full h-10 px-5 shadow-lg shadow-fuchsia-900/20">
                    <Plus className="h-4 w-4" />
                    New Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0a0a0a] border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle>Create Library Item</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">Title</label>
                      <Input
                        value={newItem.title}
                        onChange={(e) =>
                          setNewItem({ ...newItem, title: e.target.value })
                        }
                        placeholder="E.g., Code Review Prompt"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">Prompt / Content</label>
                      <Textarea
                        value={newItem.prompt}
                        onChange={(e) =>
                          setNewItem({ ...newItem, prompt: e.target.value })
                        }
                        placeholder="Enter your text here..."
                        className="bg-white/5 border-white/10 text-white min-h-[120px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">Category</label>
                      <Input
                        value={newItem.category}
                        onChange={(e) =>
                          setNewItem({ ...newItem, category: e.target.value })
                        }
                        placeholder="E.g., Development"
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <Button onClick={handleCreate} className="w-full bg-white text-black hover:bg-white/90">
                      Save Item
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Library Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems?.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group cursor-pointer bg-white/5 backdrop-blur-sm border-white/5 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-500/10">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                        <BookOpen className="h-5 w-5 text-fuchsia-400" />
                      </div>
                      {item.category && (
                          <Badge variant="secondary" className="bg-white/5 text-white/60 hover:bg-white/10 border-transparent">
                            {item.category}
                          </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg font-semibold text-white group-hover:text-fuchsia-300 transition-colors">
                        {item.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3 text-white/40 mt-2 leading-relaxed">
                      {item.prompt}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredItems?.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-10 w-10 text-white/20" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Library is empty</h3>
              <p className="text-white/40 max-w-sm mx-auto mb-6">Save your favorite prompts and snippets here for quick access.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}