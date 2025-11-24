import React, { useState, useEffect } from "react";
import { 
  Play, Save, Settings, 
  FileCode, FolderOpen, X, Plus, 
  ChevronRight, ChevronDown, Sparkles,
  Trash2, LayoutTemplate, PanelBottom
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";
import { StudioSettings } from "@/components/studio/StudioSettings";
import { useThemeStore } from "@/lib/stores/theme-store";
import CosmicShader from "@/components/shaders/CosmicShader";
import LiquidShader from "@/components/shaders/LiquidShader";

// Mock File System
const INITIAL_FILES = [
  { id: "1", name: "main.js", language: "javascript", content: "// Welcome to Cryonex Studio\n// Start coding here...\n\nconsole.log('Hello, Universe!');\n" },
  { id: "2", name: "utils.js", language: "javascript", content: "export const add = (a, b) => a + b;" },
  { id: "3", name: "styles.css", language: "css", content: "body { background: #fff; }" },
];

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
  const [showSettings, setShowSettings] = useState(false);
  const [panelVisible, setPanelVisible] = useState(true);

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
    <div className="h-screen w-full relative flex flex-col overflow-hidden font-sans selection:bg-pink-100 text-foreground">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {theme === 'cosmic' ? (
          <>
            <CosmicShader />
            <div className="absolute inset-0 bg-black/20 mix-blend-overlay" />
          </>
        ) : (
          <>
            <LiquidShader />
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100/40 via-white/20 to-purple-100/40 backdrop-blur-[2px]" />
          </>
        )}
      </div>

      <StudioSettings open={showSettings} onOpenChange={setShowSettings} />
      
      {/* Header */}
      <header className="h-14 border-b border-border/40 bg-background/70 backdrop-blur-xl flex items-center justify-between px-4 shrink-0 z-20 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-pink-200">
            <FileCode className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">Cryonex Studio</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRun} disabled={isRunning} className="gap-2 border-border/40 bg-background/50 hover:bg-pink-50 hover:text-pink-700 hover:border-pink-200 text-foreground transition-all">
            <Play className="w-4 h-4 text-pink-600" />
            {isRunning ? "Running..." : "Run"}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} className="text-muted-foreground hover:text-pink-600 hover:bg-pink-50/50">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        <ResizablePanelGroup direction="horizontal">
          
          {/* Sidebar */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-background/60 backdrop-blur-xl border-r border-border/40 flex flex-col">
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Explorer</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-pink-100 hover:text-pink-600" onClick={handleNewFile}>
                <Plus className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {files.map(file => (
                  <div
                    key={file.id}
                    onClick={() => {
                      if (!openFiles.includes(file.id)) setOpenFiles([...openFiles, file.id]);
                      setActiveFileId(file.id);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer transition-colors group",
                      activeFileId === file.id 
                        ? "bg-pink-50/80 text-pink-700 font-medium border border-pink-100/50" 
                        : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    )}
                  >
                    <FileCode className={cn("w-4 h-4", 
                      file.language === "javascript" ? "text-yellow-500" : 
                      file.language === "css" ? "text-blue-500" : "text-muted-foreground"
                    )} />
                    <span className="truncate flex-1">{file.name}</span>
                    <Trash2 
                      className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500" 
                      onClick={(e) => handleDeleteFile(file.id, e)}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* AI Assistant Mini Panel */}
            <div className="p-4 border-t border-border/40 bg-background/40 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-foreground">
                <Sparkles className="w-4 h-4 text-pink-500" />
                AI Assistant
              </div>
              <form onSubmit={handleAiSubmit}>
                <div className="relative">
                  <input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ask AI to edit code..."
                    className="w-full bg-background/50 border border-border/40 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all placeholder:text-muted-foreground text-foreground"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={isAiGenerating}
                    className="absolute right-1 top-1 h-7 w-7 bg-pink-600 hover:bg-pink-700 text-white rounded-sm shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>
          </ResizablePanel>
          
          <ResizableHandle className="bg-border/40 w-[1px]" />

          {/* Center: Editor & Terminal */}
          <ResizablePanel defaultSize={80}>
            <ResizablePanelGroup direction="vertical">
              
              {/* Editor Area */}
              <ResizablePanel defaultSize={75} className="bg-background/80 backdrop-blur-sm flex flex-col relative">
                {/* Tabs */}
                <div className="flex items-center bg-background/50 border-b border-border/40 overflow-x-auto scrollbar-hide backdrop-blur-sm">
                  {openFiles.map(fileId => {
                    const file = files.find(f => f.id === fileId);
                    if (!file) return null;
                    return (
                      <div
                        key={file.id}
                        onClick={() => setActiveFileId(file.id)}
                        className={cn(
                          "group px-4 py-2.5 text-sm cursor-pointer flex items-center gap-2 min-w-[120px] max-w-[200px] border-r border-border/40 select-none transition-all",
                          activeFileId === file.id 
                            ? "text-pink-600 font-medium border-t-2 border-t-pink-600 bg-background/80" 
                            : "text-muted-foreground hover:bg-background/50 border-t-2 border-t-transparent bg-transparent"
                        )}
                      >
                        <span className="truncate flex-1">{file.name}</span>
                        <X 
                          className={cn("w-3.5 h-3.5 rounded-full hover:bg-pink-100 hover:text-pink-600 p-0.5 transition-colors", activeFileId === file.id ? "opacity-100" : "opacity-0 group-hover:opacity-100")} 
                          onClick={(e) => handleCloseTab(file.id, e)}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Code Editor */}
                <div className="flex-1 relative group">
                  {activeFile ? (
                    <div className="absolute inset-0 flex">
                      {/* Line Numbers */}
                      <div className="w-12 bg-background/50 text-muted-foreground text-right pr-3 pt-4 text-sm font-mono select-none border-r border-border/40">
                        {activeFile.content.split('\n').map((_, i) => (
                          <div key={i} className="leading-relaxed">{i + 1}</div>
                        ))}
                      </div>
                      <textarea
                        value={activeFile.content}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        className="flex-1 bg-transparent text-foreground p-4 pt-4 font-mono text-sm resize-none focus:outline-none leading-relaxed border-none"
                        spellCheck={false}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center space-y-2">
                        <FileCode className="w-12 h-12 mx-auto opacity-20" />
                        <p className="text-sm">Select a file to start coding</p>
                      </div>
                    </div>
                  )}
                </div>
              </ResizablePanel>

              {panelVisible && (
                <>
                  <ResizableHandle className="bg-border/40 h-[1px]" />
                  {/* Terminal Area */}
                  <ResizablePanel defaultSize={25} minSize={10} className="bg-background/90 backdrop-blur-md flex flex-col border-t border-border/40">
                    <div className="h-9 flex items-center px-4 gap-4 bg-background/50 border-b border-border/40">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Terminal</div>
                      <div className="ml-auto flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-pink-100 hover:text-pink-600" onClick={() => setPanelVisible(false)}>
                          <X className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                    <ScrollArea className="flex-1 p-4 font-mono text-xs text-foreground bg-transparent">
                      <div className="whitespace-pre-wrap">
                        <span className="text-pink-600">➜</span> <span className="text-purple-600">project</span> {output || "Ready..."}
                        {output && <div className="mt-2 text-foreground">{output}</div>}
                      </div>
                    </ScrollArea>
                  </ResizablePanel>
                </>
              )}

            </ResizablePanelGroup>
          </ResizablePanel>

        </ResizablePanelGroup>
      </div>
    </div>
  );
}