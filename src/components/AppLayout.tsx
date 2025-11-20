import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import {
  MessageSquare,
  Search,
  Library,
  FolderKanban,
  Bot,
  Settings,
  Plug,
  ChevronLeft,
  Menu,
  X as CloseIcon,
  Sparkles,
  Image as ImageIcon,
  Video,
  BarChart3,
  Headphones,
  Puzzle,
  BookOpen,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface AppLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
}

const navItems = [
  { icon: MessageSquare, label: "App", path: "/app" },
  { icon: Sparkles, label: "Playground", path: "/playground" },
  { icon: Library, label: "Library", path: "/library" },
  { icon: FolderKanban, label: "Projects", path: "/projects" },
  { icon: Bot, label: "GPTs", path: "/gpts" },
  { icon: BookOpen, label: "Study", path: "/study" },
  { icon: Puzzle, label: "Integrations", path: "/integrations" },
];

export function AppLayout({ children, showBackButton }: AppLayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chats = useQuery(api.chats.list, user ? {} : "skip");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="p-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 8L48 24L32 40L16 24L32 8Z" fill="black" />
              <path d="M32 24L48 40L32 56L16 40L32 24Z" fill="black" opacity="0.6" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Cryonex</h2>
            <p className="text-xs text-[#6b6b6b]">Productivity at Every Step.</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 rounded-xl h-11 transition-all ${
                  isActive 
                    ? "bg-white text-black hover:bg-white/90" 
                    : "text-[#aaaaaa] hover:bg-[#1a1a1a] hover:text-white"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1 text-left">{item.label}</span>
              </Button>
            </Link>
          );
        })}
        
        <Separator className="bg-[#2a2a2a] my-4" />
        
        <Link to="/integrations">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 rounded-xl h-11 text-[#aaaaaa] hover:bg-[#1a1a1a] hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <Headphones className="h-5 w-5" />
            Support
          </Button>
        </Link>
      </div>

      {/* Chat History Section */}
      <div className="flex-1 px-4 mt-6 overflow-hidden">
        <div className="flex items-center justify-between mb-3 px-2">
          <h3 className="text-sm font-semibold text-white">History</h3>
        </div>
        
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {chats && chats.length > 0 ? (
              <>
                {/* Group chats by date */}
                {(() => {
                  const today = new Date();
                  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                  
                  const groupedChats = {
                    today: chats.filter(chat => {
                      const chatDate = new Date(chat._creationTime);
                      return chatDate.toDateString() === today.toDateString();
                    }),
                    thisWeek: chats.filter(chat => {
                      const chatDate = new Date(chat._creationTime);
                      return chatDate > thisWeek && chatDate.toDateString() !== today.toDateString();
                    }),
                    thisMonth: chats.filter(chat => {
                      const chatDate = new Date(chat._creationTime);
                      return chatDate > thisMonth && chatDate <= thisWeek;
                    }),
                    older: chats.filter(chat => {
                      const chatDate = new Date(chat._creationTime);
                      return chatDate <= thisMonth;
                    }),
                  };
                  
                  return (
                    <>
                      {groupedChats.today.length > 0 && (
                        <div>
                          <p className="text-xs text-[#6b6b6b] mb-2 px-2">Today</p>
                          {groupedChats.today.map((chat) => (
                            <Link key={chat._id} to={`/app?chat=${chat._id}`}>
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-left h-auto py-2 px-2 rounded-lg hover:bg-[#1a1a1a] text-[#aaaaaa] hover:text-white"
                              >
                                <span className="truncate text-sm">{chat.title}</span>
                              </Button>
                            </Link>
                          ))}
                        </div>
                      )}
                      
                      {groupedChats.thisWeek.length > 0 && (
                        <div>
                          <p className="text-xs text-[#6b6b6b] mb-2 px-2">This Week</p>
                          {groupedChats.thisWeek.map((chat) => (
                            <Link key={chat._id} to={`/app?chat=${chat._id}`}>
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-left h-auto py-2 px-2 rounded-lg hover:bg-[#1a1a1a] text-[#aaaaaa] hover:text-white"
                              >
                                <span className="truncate text-sm">{chat.title}</span>
                              </Button>
                            </Link>
                          ))}
                        </div>
                      )}
                      
                      {groupedChats.thisMonth.length > 0 && (
                        <div>
                          <p className="text-xs text-[#6b6b6b] mb-2 px-2">This Month</p>
                          {groupedChats.thisMonth.map((chat) => (
                            <Link key={chat._id} to={`/app?chat=${chat._id}`}>
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-left h-auto py-2 px-2 rounded-lg hover:bg-[#1a1a1a] text-[#aaaaaa] hover:text-white"
                              >
                                <span className="truncate text-sm">{chat.title}</span>
                              </Button>
                            </Link>
                          ))}
                        </div>
                      )}
                      
                      {groupedChats.older.length > 0 && (
                        <div>
                          <p className="text-xs text-[#6b6b6b] mb-2 px-2">Older</p>
                          {groupedChats.older.map((chat) => (
                            <Link key={chat._id} to={`/app?chat=${chat._id}`}>
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-left h-auto py-2 px-2 rounded-lg hover:bg-[#1a1a1a] text-[#aaaaaa] hover:text-white"
                              >
                                <span className="truncate text-sm">{chat.title}</span>
                              </Button>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            ) : (
              <p className="text-xs text-[#6b6b6b] px-2">No chat history yet</p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* User Section */}
      <div className="p-4 mt-auto">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#1a1a1a] cursor-pointer transition-colors">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
            <span className="text-sm font-medium text-white">
              {user?.email?.[0].toUpperCase() || "G"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.email?.split('@')[0] || "Guest User"}
            </p>
            <p className="text-xs text-[#6b6b6b] truncate">{user?.email || "guest@cryonex.ai"}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 hover:bg-[#2a2a2a]"
            onClick={handleSignOut}
          >
            <ChevronLeft className="h-4 w-4 rotate-180 text-[#6b6b6b]" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-[#0a0a0a]">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.15 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-[#0f0f0f] border-r border-[#1a1a1a] flex flex-col z-50 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-[#0f0f0f] border-r border-[#1a1a1a] flex-col">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-[#1a1a1a] bg-[#0a0a0a] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2 text-[#aaaaaa] hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link to="/integrations">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-[#1a1a1a] transition-colors cursor-pointer">
                <Badge variant="outline" className="gap-1.5 text-xs border-[#2a2a2a]">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  OpenRouter
                </Badge>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}