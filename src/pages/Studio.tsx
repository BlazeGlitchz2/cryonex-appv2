import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, Play, Save, Settings, Sidebar, 
  Bot, FileCode, FolderOpen, X, Plus, 
  ChevronRight, ChevronDown, Sparkles, Command,
  Search, GitBranch, Box, MoreHorizontal,
  LayoutTemplate, Split, PanelBottom, Monitor,
  FilePlus, FolderPlus, Trash2, Copy, Scissors
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";
import { StudioOnboarding } from "@/components/studio/StudioOnboarding";
import { useThemeStore } from "@/lib/stores/theme-store";
import CosmicShader from "@/components/shaders/CosmicShader";
import LiquidShader from "@/components/shaders/LiquidShader";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

// Mock File System
const INITIAL_FILES = [
  { id: "1", name: "main.js", language: "javascript", content: "// Welcome to Cryonex Studio\n// Start coding here...\n\nconsole.log('Hello, Universe!');\n" },
  { id: "2", name: "utils.js", language: "javascript", content: "export const add = (a, b) => a + b;" },
  { id: "3", name: "styles.css", language: "css", content: "body { background: #000; }" },
];

type View = "explorer" | "search" | "git" | "extensions" | "ai";

export default function Studio() {
  const navigate = useNavigate();
  const { theme, mode } = useThemeStore();
  const [files, setFiles] = useState(INITIAL_FILES);
  const [activeFileId, setActiveFileId] = useState("1");
  const [openFiles, setOpenFiles] = useState<string[]>(["1", "2", "3"]);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [activeView, setActiveView] = useState<View>("explorer");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [panelVisible, setPanelVisible] = useState(true);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem("cryonex-studio-onboarding");
    if (!hasOnboarded) {
      setShowOnboarding(true);
    }
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "p" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        setShowCommandPalette((open) => !open);
      }
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSidebarVisible((v) => !v);
      }
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPanelVisible((v) => !v);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [activeFileId, files]);

  // Apply Theme
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme, mode]);

  const executeCode = useAction(api.studio.executeCode);
  const generateCode = useAction(api.studio.generateCode);

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  const handleCodeChange = (newCode: string) => {
    setFiles(files.map(f => f.id === activeFileId ? { ...f, content: newCode } : f));
  };

  const handleSave = () => {
    toast.success(`Saved ${activeFile.name}`);
    // In a real app, this would persist to backend
  };

  const handleNewFile = () => {
    const newId = Date.now().toString();
    const newFile = {
      id: newId,
      name: `untitled-${files.length + 1}.js`,
      language: "javascript",
      content: "// New file"
    };
    setFiles([...files, newFile]);
    setOpenFiles([...openFiles, newId]);
    setActiveFileId(newId);
    toast.success("New file created");
  };

  const handleDeleteFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (files.length === 1) {
      toast.error("Cannot delete the last file");
      return;
    }
    setFiles(files.filter(f => f.id !== id));
    setOpenFiles(openFiles.filter(fid => fid !== id));
    if (activeFileId === id) {
      setActiveFileId(files.find(f => f.id !== id)?.id || "");
    }
    toast.success("File deleted");
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newOpenFiles = openFiles.filter(fid => fid !== id);
    setOpenFiles(newOpenFiles);
    if (activeFileId === id && newOpenFiles.length > 0) {
      setActiveFileId(newOpenFiles[newOpenFiles.length - 1]);
    } else if (newOpenFiles.length === 0) {
      setActiveFileId("");
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("Running...");
    try {
      const result = await executeCode({
        language: activeFile.language,
        code: activeFile.content
      });
      setOutput(result.stdout || result.stderr || "No output");
      setPanelVisible(true);
    } catch (error) {
      setOutput("Error executing code: " + (error as any).message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiGenerating(true);
    try {
      const result = await generateCode({
        prompt: aiPrompt,
        currentCode: activeFile.content
      });
      
      const newContent = activeFile.content + "\n\n" + result;
      handleCodeChange(newContent);
      setAiPrompt("");
      toast.success("AI generated code added!");
    } catch (error) {
      toast.error("Failed to generate code");
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#1e1e1e] text-[#cccccc] flex flex-col overflow-hidden font-mono selection:bg-[#264f78] relative">
      <StudioOnboarding open={showOnboarding} onOpenChange={setShowOnboarding} />
      
      <CommandDialog open={showCommandPalette} onOpenChange={setShowCommandPalette}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="File">
            <CommandItem onSelect={handleNewFile}>
              <FilePlus className="mr-2 h-4 w-4" />
              <span>New File</span>
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              <span>Save File</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Editor">
            <CommandItem onSelect={() => setSidebarVisible(!sidebarVisible)}>
              <Sidebar className="mr-2 h-4 w-4" />
              <span>Toggle Sidebar</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => setPanelVisible(!panelVisible)}>
              <PanelBottom className="mr-2 h-4 w-4" />
              <span>Toggle Panel</span>
              <CommandShortcut>⌘J</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={handleRun}>
              <Play className="mr-2 h-4 w-4" />
              <span>Run Code</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Activity Bar */}
        <div className="w-12 bg-[#333333] flex flex-col items-center py-2 border-r border-[#252526] shrink-0 z-20">
          <ActivityBarItem icon={FileCode} active={activeView === "explorer"} onClick={() => { setActiveView("explorer"); setSidebarVisible(true); }} />
          <ActivityBarItem icon={Search} active={activeView === "search"} onClick={() => { setActiveView("search"); setSidebarVisible(true); }} />
          <ActivityBarItem icon={GitBranch} active={activeView === "git"} onClick={() => { setActiveView("git"); setSidebarVisible(true); }} />
          <ActivityBarItem icon={Box} active={activeView === "extensions"} onClick={() => { setActiveView("extensions"); setSidebarVisible(true); }} />
          <ActivityBarItem icon={Sparkles} active={activeView === "ai"} onClick={() => { setActiveView("ai"); setSidebarVisible(true); }} />
          <div className="mt-auto flex flex-col gap-2">
            <ActivityBarItem icon={Settings} />
          </div>
        </div>

        <ResizablePanelGroup direction="horizontal">
          
          {/* Sidebar */}
          {sidebarVisible && (
            <>
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-[#252526] border-r border-[#1e1e1e] flex flex-col">
                <div className="h-9 px-4 flex items-center justify-between text-xs font-medium text-[#bbbbbb] uppercase tracking-wide select-none">
                  <span>{activeView.toUpperCase()}</span>
                  <MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-white" />
                </div>
                
                {activeView === "explorer" && (
                  <div className="flex-1 flex flex-col">
                    <div className="px-4 py-2 flex items-center justify-between group cursor-pointer hover:bg-[#2a2d2e]">
                      <div className="flex items-center gap-1 text-xs font-bold text-[#bbbbbb]">
                        <ChevronDown className="w-3 h-3" />
                        <span>CRYONEX-PROJECT</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <FilePlus className="w-3.5 h-3.5 text-[#cccccc] hover:text-white" onClick={(e) => { e.stopPropagation(); handleNewFile(); }} />
                        <FolderPlus className="w-3.5 h-3.5 text-[#cccccc] hover:text-white" />
                      </div>
                    </div>
                    <ScrollArea className="flex-1">
                      <div className="px-0">
                        {files.map(file => (
                          <div
                            key={file.id}
                            onClick={() => {
                              if (!openFiles.includes(file.id)) setOpenFiles([...openFiles, file.id]);
                              setActiveFileId(file.id);
                            }}
                            className={cn(
                              "flex items-center gap-1.5 px-6 py-1 text-sm cursor-pointer transition-colors border-l-2",
                              activeFileId === file.id 
                                ? "bg-[#37373d] text-white border-[#007acc]" 
                                : "text-[#cccccc] border-transparent hover:bg-[#2a2d2e] hover:text-white"
                            )}
                          >
                            <FileCode className={cn("w-4 h-4", 
                              file.language === "javascript" ? "text-[#f1e05a]" : 
                              file.language === "css" ? "text-[#563d7c]" : "text-blue-400"
                            )} />
                            <span className="truncate flex-1">{file.name}</span>
                            <Trash2 
                              className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 hover:text-red-400" 
                              onClick={(e) => handleDeleteFile(file.id, e)}
                            />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {activeView === "ai" && (
                  <div className="flex-1 flex flex-col p-4">
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-[#888] space-y-4">
                      <div className="w-16 h-16 rounded-full bg-[#333] flex items-center justify-center">
                        <Bot className="w-8 h-8 text-[#007acc]" />
                      </div>
                      <p className="text-sm">Cryonex AI Assistant</p>
                      <p className="text-xs max-w-[200px]">
                        I can help you write, debug, and explain code.
                      </p>
                    </div>
                    <form onSubmit={handleAiSubmit} className="mt-4">
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Ask anything..."
                        className="w-full bg-[#3c3c3c] border border-[#333] rounded-sm px-3 py-2 text-sm text-[#cccccc] placeholder:text-[#888] focus:outline-none focus:border-[#007acc] min-h-[80px] resize-none"
                      />
                      <Button type="submit" disabled={isAiGenerating} className="w-full mt-2 bg-[#007acc] hover:bg-[#0062a3] text-white h-8 text-xs">
                        {isAiGenerating ? "Thinking..." : "Generate"}
                      </Button>
                    </form>
                  </div>
                )}

                {(activeView === "search" || activeView === "git" || activeView === "extensions") && (
                  <div className="flex-1 flex items-center justify-center text-[#666] text-sm p-8 text-center">
                    Feature coming soon in this demo.
                  </div>
                )}
              </ResizablePanel>
              <ResizableHandle className="bg-[#1e1e1e] w-[1px]" />
            </>
          )}

          {/* Center: Editor & Terminal */}
          <ResizablePanel defaultSize={80}>
            <ResizablePanelGroup direction="vertical">
              
              {/* Editor Area */}
              <ResizablePanel defaultSize={75} className="bg-[#1e1e1e] flex flex-col relative">
                {/* Tabs */}
                <div className="flex items-center bg-[#252526] overflow-x-auto scrollbar-hide">
                  {openFiles.map(fileId => {
                    const file = files.find(f => f.id === fileId);
                    if (!file) return null;
                    return (
                      <div
                        key={file.id}
                        onClick={() => setActiveFileId(file.id)}
                        className={cn(
                          "group px-3 py-2.5 text-sm cursor-pointer flex items-center gap-2 min-w-[120px] max-w-[200px] border-r border-[#1e1e1e] select-none",
                          activeFileId === file.id 
                            ? "bg-[#1e1e1e] text-white border-t-2 border-t-[#007acc]" 
                            : "bg-[#2d2d2d] text-[#969696] hover:bg-[#2a2d2e]"
                        )}
                      >
                        <FileCode className={cn("w-3.5 h-3.5", 
                          file.language === "javascript" ? "text-[#f1e05a]" : 
                          file.language === "css" ? "text-[#563d7c]" : "text-blue-400"
                        )} />
                        <span className="truncate flex-1">{file.name}</span>
                        <X 
                          className={cn("w-4 h-4 p-0.5 rounded-md hover:bg-[#444]", activeFileId === file.id ? "opacity-100" : "opacity-0 group-hover:opacity-100")} 
                          onClick={(e) => handleCloseTab(file.id, e)}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Breadcrumbs / Toolbar */}
                <div className="h-6 bg-[#1e1e1e] flex items-center px-4 text-xs text-[#888] border-b border-[#333] gap-2">
                  <span>src</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>{activeFile?.name}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-[#333]" onClick={handleRun}>
                      <Play className="w-3 h-3 text-green-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-[#333]" onClick={() => setPanelVisible(!panelVisible)}>
                      <LayoutTemplate className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Code Editor */}
                <div className="flex-1 relative group">
                  {activeFile ? (
                    <div className="absolute inset-0 flex">
                      {/* Line Numbers */}
                      <div className="w-12 bg-[#1e1e1e] text-[#6e7681] text-right pr-3 pt-4 text-sm font-mono select-none border-r border-[#333]">
                        {activeFile.content.split('\n').map((_, i) => (
                          <div key={i} className="leading-relaxed">{i + 1}</div>
                        ))}
                      </div>
                      <textarea
                        value={activeFile.content}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        className="flex-1 bg-[#1e1e1e] text-[#d4d4d4] p-4 pt-4 font-mono text-sm resize-none focus:outline-none leading-relaxed border-none"
                        spellCheck={false}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-[#666]">
                      <div className="text-center space-y-2">
                        <div className="text-4xl font-light opacity-20">Cryonex</div>
                        <p className="text-sm">Select a file to start coding</p>
                        <div className="text-xs opacity-50 space-y-1 mt-4">
                          <p>Show All Commands <span className="bg-[#333] px-1 rounded">⇧⌘P</span></p>
                          <p>Go to File <span className="bg-[#333] px-1 rounded">⌘P</span></p>
                          <p>Find in Files <span className="bg-[#333] px-1 rounded">⇧⌘F</span></p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ResizablePanel>

              {panelVisible && (
                <>
                  <ResizableHandle className="bg-[#1e1e1e] h-[1px]" />
                  {/* Terminal Area */}
                  <ResizablePanel defaultSize={25} minSize={10} className="bg-[#1e1e1e] flex flex-col border-t border-[#333]">
                    <div className="h-8 flex items-center px-4 gap-6 bg-[#1e1e1e] border-b border-[#333]">
                      <div className="text-xs text-white border-b border-[#007acc] h-full flex items-center px-1 cursor-pointer">TERMINAL</div>
                      <div className="text-xs text-[#888] h-full flex items-center px-1 hover:text-[#cccccc] cursor-pointer">OUTPUT</div>
                      <div className="text-xs text-[#888] h-full flex items-center px-1 hover:text-[#cccccc] cursor-pointer">PROBLEMS</div>
                      <div className="text-xs text-[#888] h-full flex items-center px-1 hover:text-[#cccccc] cursor-pointer">DEBUG CONSOLE</div>
                      <div className="ml-auto flex items-center gap-2">
                        <X className="w-3 h-3 text-[#888] hover:text-white cursor-pointer" onClick={() => setPanelVisible(false)} />
                      </div>
                    </div>
                    <ScrollArea className="flex-1 p-4 font-mono text-xs text-[#cccccc]">
                      <div className="whitespace-pre-wrap">
                        <span className="text-green-500">➜</span> <span className="text-blue-400">project</span> <span className="text-[#888]">git:(</span><span className="text-red-400">main</span><span className="text-[#888]">)</span> {output || "node main.js"}
                        {output && <div className="mt-2 text-[#cccccc]">{output}</div>}
                      </div>
                    </ScrollArea>
                  </ResizablePanel>
                </>
              )}

            </ResizablePanelGroup>
          </ResizablePanel>

        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-xs select-none z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 hover:bg-white/20 px-1 rounded cursor-pointer">
            <GitBranch className="w-3 h-3" />
            <span>main*</span>
          </div>
          <div className="flex items-center gap-1 hover:bg-white/20 px-1 rounded cursor-pointer">
            <X className="w-3 h-3 rounded-full border border-white p-[1px]" />
            <span>0</span>
            <div className="w-3 h-3 rounded-full border border-white p-[1px] flex items-center justify-center">!</div>
            <span>0</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hover:bg-white/20 px-1 rounded cursor-pointer">Ln 12, Col 34</div>
          <div className="hover:bg-white/20 px-1 rounded cursor-pointer">UTF-8</div>
          <div className="hover:bg-white/20 px-1 rounded cursor-pointer">{activeFile?.language === 'javascript' ? 'JavaScript' : 'Plain Text'}</div>
          <div className="hover:bg-white/20 px-1 rounded cursor-pointer">Prettier</div>
          <div className="hover:bg-white/20 px-1 rounded cursor-pointer">
            <Bot className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityBarItem({ icon: Icon, active, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "w-12 h-12 flex items-center justify-center cursor-pointer transition-colors relative",
        active ? "text-white" : "text-[#858585] hover:text-white"
      )}
    >
      {active && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white" />}
      <Icon className="w-6 h-6" strokeWidth={1.5} />
    </div>
  );
}