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
    <div className="h-screen w-full bg-white text-gray-900 flex flex-col overflow-hidden font-sans selection:bg-blue-100">
      <StudioSettings open={showSettings} onOpenChange={setShowSettings} />
      
      {/* Header */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <FileCode className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">Cryonex Studio</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRun} disabled={isRunning} className="gap-2 border-gray-200 hover:bg-gray-50 text-gray-700">
            <Play className="w-4 h-4 text-green-600" />
            {isRunning ? "Running..." : "Run"}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} className="text-gray-500 hover:text-gray-900">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        <ResizablePanelGroup direction="horizontal">
          
          {/* Sidebar */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-gray-50 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Explorer</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleNewFile}>
                <Plus className="w-4 h-4 text-gray-500" />
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
                        ? "bg-white shadow-sm text-blue-600 font-medium" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <FileCode className={cn("w-4 h-4", 
                      file.language === "javascript" ? "text-yellow-500" : 
                      file.language === "css" ? "text-blue-500" : "text-gray-400"
                    )} />
                    <span className="truncate flex-1">{file.name}</span>
                    <Trash2 
                      className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500" 
                      onClick={(e) => handleDeleteFile(file.id, e)}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* AI Assistant Mini Panel */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <Sparkles className="w-4 h-4 text-purple-500" />
                AI Assistant
              </div>
              <form onSubmit={handleAiSubmit}>
                <div className="relative">
                  <input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ask AI to edit code..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    disabled={isAiGenerating}
                    className="absolute right-1 top-1 h-7 w-7 bg-blue-600 hover:bg-blue-700 text-white rounded-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>
          </ResizablePanel>
          
          <ResizableHandle className="bg-gray-200 w-[1px]" />

          {/* Center: Editor & Terminal */}
          <ResizablePanel defaultSize={80}>
            <ResizablePanelGroup direction="vertical">
              
              {/* Editor Area */}
              <ResizablePanel defaultSize={75} className="bg-white flex flex-col relative">
                {/* Tabs */}
                <div className="flex items-center bg-gray-50 border-b border-gray-200 overflow-x-auto scrollbar-hide">
                  {openFiles.map(fileId => {
                    const file = files.find(f => f.id === fileId);
                    if (!file) return null;
                    return (
                      <div
                        key={file.id}
                        onClick={() => setActiveFileId(file.id)}
                        className={cn(
                          "group px-4 py-2.5 text-sm cursor-pointer flex items-center gap-2 min-w-[120px] max-w-[200px] border-r border-gray-200 select-none bg-white",
                          activeFileId === file.id 
                            ? "text-blue-600 font-medium border-t-2 border-t-blue-600" 
                            : "text-gray-500 hover:bg-gray-50 border-t-2 border-t-transparent"
                        )}
                      >
                        <span className="truncate flex-1">{file.name}</span>
                        <X 
                          className={cn("w-3.5 h-3.5 rounded-full hover:bg-gray-200 p-0.5", activeFileId === file.id ? "opacity-100" : "opacity-0 group-hover:opacity-100")} 
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
                      <div className="w-12 bg-white text-gray-300 text-right pr-3 pt-4 text-sm font-mono select-none border-r border-gray-100">
                        {activeFile.content.split('\n').map((_, i) => (
                          <div key={i} className="leading-relaxed">{i + 1}</div>
                        ))}
                      </div>
                      <textarea
                        value={activeFile.content}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        className="flex-1 bg-white text-gray-800 p-4 pt-4 font-mono text-sm resize-none focus:outline-none leading-relaxed border-none"
                        spellCheck={false}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
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
                  <ResizableHandle className="bg-gray-200 h-[1px]" />
                  {/* Terminal Area */}
                  <ResizablePanel defaultSize={25} minSize={10} className="bg-white flex flex-col border-t border-gray-200">
                    <div className="h-9 flex items-center px-4 gap-4 bg-gray-50 border-b border-gray-200">
                      <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">Terminal</div>
                      <div className="ml-auto flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPanelVisible(false)}>
                          <X className="w-3.5 h-3.5 text-gray-500" />
                        </Button>
                      </div>
                    </div>
                    <ScrollArea className="flex-1 p-4 font-mono text-xs text-gray-700 bg-white">
                      <div className="whitespace-pre-wrap">
                        <span className="text-green-600">➜</span> <span className="text-blue-600">project</span> {output || "Ready..."}
                        {output && <div className="mt-2 text-gray-900">{output}</div>}
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