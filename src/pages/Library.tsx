import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, FileText, Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";

export default function LibraryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Rich gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-400 via-purple-600 to-blue-900 -z-10" />
      
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-white/5 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_40px_rgba(0,0,0,0.25)] z-50">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Left: Brand & Back */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/app")}
              className="text-white hover:bg-white/10 rounded-lg gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">Library</span>
            </div>
          </div>

          {/* Right: User */}
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="text-sm text-white hidden lg:inline">{user.email?.split('@')[0]}</span>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="mb-8 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-light text-white">Your Library</h1>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white">
                    <Plus className="h-4 w-4" />
                    New Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Library Item</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={newItem.title}
                        onChange={(e) =>
                          setNewItem({ ...newItem, title: e.target.value })
                        }
                        placeholder="Summarize Text"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Prompt</label>
                      <Textarea
                        value={newItem.prompt}
                        onChange={(e) =>
                          setNewItem({ ...newItem, prompt: e.target.value })
                        }
                        placeholder="Please summarize the following text..."
                        className="min-h-[120px]"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Input
                        value={newItem.category}
                        onChange={(e) =>
                          setNewItem({ ...newItem, category: e.target.value })
                        }
                        placeholder="Writing"
                      />
                    </div>
                    <Button onClick={handleCreate} className="w-full">
                      Create Item
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Search Bar */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search library..."
                className="pl-12 h-12 text-lg"
              />
            </div>
          </div>

          {/* Library Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems?.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="cursor-pointer hover:border-white/40 transition-all hover:scale-105">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <FileText className="h-6 w-6 text-white/60" />
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                    <CardTitle className="text-xl text-white">{item.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-white/70">
                      {item.prompt}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredItems?.length === 0 && (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No items found</h3>
              <p className="text-white/60">Create your first library item to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}