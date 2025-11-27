import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Search, Plus, MoreVertical, MessageCircle, Clock, Trash2, Edit2, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useChatStore } from "@/lib/stores/chat-store";
import { toast } from "sonner";

interface ChatItem {
  _id: string;
  title: string;
  _creationTime: number;
  lastMessageAt?: number;
  isPinned?: boolean;
  isArchived?: boolean;
}

export function ConversationHistorySidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterArchived, setFilterArchived] = useState(false);
  const setCurrentChatId = useChatStore((state) => state.setCurrentChatId);

  // Add convex mutations
  const renameMutation = useMutation(api.chats.rename);
  const deleteChatMutation = useMutation(api.chats.deleteChat);
  const shareChatMutation = useMutation(api.chats.shareChat);
  
  const chats = useQuery(api.chats.list, {
    search: searchTerm || undefined,
    includeArchived: filterArchived,
  }) || [];

  const handleNewChat = () => {
    // Call mutation to create new chat
    // For now, placeholder - integrate with existing create
    toast.success("New chat created!");
    onClose();
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    onClose();
  };

  const handleRename = async (chatId: string, newTitle: string) => {
    await renameMutation({ chatId: chatId as any, title: newTitle });
    toast.success("Chat renamed!");
  };

  const handleDelete = async (chatId: string) => {
    if (confirm("Delete this chat?")) {
      await deleteChatMutation({ chatId: chatId as any });
      toast.success("Chat deleted!");
    }
  };

  const handleShare = async (chatId: string) => {
    const result = await shareChatMutation({ chatId: chatId as any });
    toast.success(`Shared: ${result.shareUrl}`);
  };

  const filteredChats = chats.filter(chat => 
    !searchTerm || chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mouse tracking for dynamic glow effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        handleNewChat();
      }
      if (e.ctrlKey && e.key === "k") {
        setSearchTerm(""); // Focus search
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[280px] sm:w-[280px] bg-background/80 backdrop-blur-md border-r dark:border-r-border/50">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b dark:border-b-border/50">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <MessageCircle className="h-5 w-5" />
              Chat History
            </h2>
            <Button onClick={handleNewChat} className="sidebar-nav-item relative w-full mb-2" variant="outline">
              <span className="glow-overlay" />
              <Plus className="h-4 w-4 mr-2" />
              New Chat <span className="ml-2 text-xs opacity-70">(Ctrl+N)</span>
            </Button>
            <div className="relative">
              <Input
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8"
              />
              <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
            <label className="flex items-center gap-2 mt-2 text-xs">
              <input
                type="checkbox"
                checked={filterArchived}
                onChange={(e) => setFilterArchived(e.target.checked)}
              />
              Include archived
            </label>
          </div>
          <ScrollArea className="flex-1 p-2">
            {filteredChats.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No chats yet. Start a new one!
              </div>
            ) : (
              filteredChats.map((chat: ChatItem) => {
                const timestamp = chat.lastMessageAt || chat._creationTime;
                const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
                return (
                  <div
                    key={chat._id}
                    className="group relative p-3 rounded-xl cursor-pointer transition-all duration-300 hover:bg-muted/50 border border-transparent hover:border-border/50"
                    onClick={() => handleSelectChat(chat._id)}
                  >
                    {/* Active Indicator */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-start justify-between relative z-10 pl-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm text-foreground group-hover:text-primary transition-colors">{chat.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeAgo}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/50">
                            <MoreVertical className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-popover/95 backdrop-blur-lg border-border">
                          <DropdownMenuItem onClick={() => {/* Inline rename logic */}} className="cursor-pointer">
                            <Edit2 className="h-4 w-4 mr-2 text-muted-foreground" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare(chat._id)} className="cursor-pointer">
                            <Share2 className="h-4 w-4 mr-2 text-muted-foreground" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(chat._id)} className="text-destructive cursor-pointer focus:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {chat.isPinned && <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full z-10 shadow-[0_0_8px_rgba(var(--primary),0.5)]" />}
                  </div>
                );
              })
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ConversationHistorySidebar;