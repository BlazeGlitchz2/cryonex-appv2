import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, Play, Save, Settings, Sidebar, 
  Bot, FileCode, FolderOpen, X, Plus, 
  ChevronRight, ChevronDown, Sparkles, Command
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";

// Mock File System
const INITIAL_FILES = [
  { id: "1", name: "main.js", language: "javascript", content: "// Welcome to Cryonex Studio\n// Start coding here...\n\nconsole.log('Hello, Universe!');\n" },
  { id: "2", name: "utils.js", language: "javascript", content: "export const add = (a, b) => a + b;" },
  { id: "3", name: "styles.css", language: "css", content: "body { background: #000; }" },
];

export default function Studio() {
  const navigate = useNavigate();
  const [files, setFiles] = useState(INITIAL_FILES);
  const [activeFileId, setActiveFileId] = useState("1");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(true);

  const executeCode = useAction(api.studio.executeCode);
  const generateCode = useAction(api.studio.generateCode);

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  const handleCodeChange = (newCode: string) => {
    setFiles(files.map(f => f.id === activeFileId ? { ...f, content: newCode } : f));
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
      
      // Append AI comment/code to the file
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
    <div className="h-screen w-full bg-[#050505] text-white flex flex-col overflow-hidden font-mono selection:bg-purple-500/30">
      {/* Top Bar */}
      <header className="h-12 border-b border-white/10 bg-[#0a0a0a] flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          >
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="font-bold text-xs">C</span>
            </div>
            <span className="font-semibold text-sm tracking-tight">Cryonex Studio</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span>Project</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/90">demo-project</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/5"
            onClick={() => setShowAiPanel(!showAiPanel)}
          >
            <Bot className={cn("w-4 h-4", showAiPanel && "text-purple-400")} />
          </Button>
          <Button 
            size="sm" 
            className="h-8 bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/30 gap-2"
            onClick={handleRun}
            disabled={isRunning}
          >
            <Play className="w-3 h-3 fill-current" />
            {isRunning ? "Running..." : "Run"}
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          
          {/* Sidebar: Explorer */}
          <ResizablePanel defaultSize={15} minSize={10} maxSize={20} className="bg-[#0a0a0a] border-r border-white/5 flex flex-col">
            <div className="p-3 text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center justify-between">
              <span>Explorer</span>
              <Plus className="w-3 h-3 cursor-pointer hover:text-white" />
            </div>
            <ScrollArea className="flex-1">
              <div className="px-2 space-y-0.5">
                {files.map(file => (
                  <div
                    key={file.id}
                    onClick={() => setActiveFileId(file.id)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer transition-colors",
                      activeFileId === file.id 
                        ? "bg-white/10 text-white" 
                        : "text-white/60 hover:bg-white/5 hover:text-white/90"
                    )}
                  >
                    <FileCode className="w-3.5 h-3.5 text-blue-400" />
                    {file.name}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle className="bg-white/5 w-[1px]" />

          {/* Center: Editor & Terminal */}
          <ResizablePanel defaultSize={65}>
            <ResizablePanelGroup direction="vertical">
              
              {/* Editor Area */}
              <ResizablePanel defaultSize={70} className="bg-[#050505] relative flex flex-col">
                {/* Tabs */}
                <div className="flex items-center border-b border-white/5 bg-[#0a0a0a]">
                  {files.map(file => (
                    <div
                      key={file.id}
                      onClick={() => setActiveFileId(file.id)}
                      className={cn(
                        "px-4 py-2 text-xs border-r border-white/5 cursor-pointer flex items-center gap-2 min-w-[100px]",
                        activeFileId === file.id 
                          ? "bg-[#050505] text-white border-t-2 border-t-purple-500" 
                          : "bg-[#0a0a0a] text-white/50 hover:bg-[#0f0f0f]"
                      )}
                    >
                      <span className={cn("w-2 h-2 rounded-full", activeFileId === file.id ? "bg-blue-500" : "bg-transparent")} />
                      {file.name}
                      {activeFileId === file.id && <X className="w-3 h-3 ml-auto text-white/20 hover:text-white" />}
                    </div>
                  ))}
                </div>

                {/* Code Editor (Simple Textarea for MVP) */}
                <div className="flex-1 relative group">
                  <textarea
                    value={activeFile.content}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className="absolute inset-0 w-full h-full bg-transparent text-white/90 p-4 font-mono text-sm resize-none focus:outline-none leading-relaxed"
                    spellCheck={false}
                  />
                </div>
              </ResizablePanel>

              <ResizableHandle className="bg-white/5 h-[1px]" />

              {/* Terminal Area */}
              <ResizablePanel defaultSize={30} minSize={10} className="bg-[#080808] flex flex-col">
                <div className="h-8 border-b border-white/5 flex items-center px-4 gap-4">
                  <div className="text-xs text-white border-b border-purple-500 h-full flex items-center px-1">Terminal</div>
                  <div className="text-xs text-white/40 h-full flex items-center px-1 hover:text-white cursor-pointer">Output</div>
                  <div className="text-xs text-white/40 h-full flex items-center px-1 hover:text-white cursor-pointer">Problems</div>
                </div>
                <ScrollArea className="flex-1 p-4 font-mono text-xs text-white/80">
                  <div className="whitespace-pre-wrap">{output || "Ready to run..."}</div>
                </ScrollArea>
              </ResizablePanel>

            </ResizablePanelGroup>
          </ResizablePanel>

          {/* Right Sidebar: AI Assistant */}
          {showAiPanel && (
            <>
              <ResizableHandle className="bg-white/5 w-[1px]" />
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-[#0a0a0a] border-l border-white/5 flex flex-col">
                <div className="p-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Cryonex AI</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowAiPanel(false)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex-1 p-4 flex flex-col items-center justify-center text-center text-white/40 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <Bot className="w-6 h-6" />
                  </div>
                  <p className="text-xs max-w-[200px]">
                    Ask me to generate code, explain logic, or fix bugs. I'm context-aware.
                  </p>
                </div>

                <div className="p-4 border-t border-white/5 bg-[#050505]">
                  <form onSubmit={handleAiSubmit} className="relative">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Ask Cryonex..."
                      className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-white/50 opacity-100">
                        <span className="text-xs">↵</span>
                      </kbd>
                    </div>
                  </form>
                </div>
              </ResizablePanel>
            </>
          )}

        </ResizablePanelGroup>
      </div>
    </div>
  );
}
