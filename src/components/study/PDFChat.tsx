import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  User,
  BrainCircuit,
  GraduationCap,
  Info,
  Sparkles,
  Wand2,
  BookOpen,
  AlertTriangle,
  X,
  FileText,
  Moon,
  Sun,
} from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from "@/lib/stores/theme-store";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface PDFChatProps {
  docId: string;
  title: string;
}

export function PDFChat({ docId }: PDFChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hey, I'm Cryonex\n\nI can work with you on your doc, analyze images, and answer any questions!`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<
    Array<{ page: number; text: string; score: number }>
  >([]);
  const [chatMode, setChatMode] = useState<"standard" | "socratic" | "feynman">(
    "standard",
  );
  const [showSocraticWarning, setShowSocraticWarning] = useState(false);
  const [showSources, setShowSources] = useState(true);
  const [input, setInput] = useState("");
  const { mode } = useThemeStore();
  const isLight = mode === "light";
  const assistantBubbleClasses = isLight
    ? "bg-white text-slate-900 border border-slate-200 rounded-tl-sm"
    : "bg-[#1a1a1a] text-white border border-white/5 rounded-tl-sm";
  const assistantProseClasses = isLight
    ? "prose prose-sm max-w-none prose-slate [&_h1]:text-slate-900 [&_h2]:text-slate-900 [&_h3]:text-slate-900 [&_p]:text-slate-700 [&_*]:!text-slate-700"
    : "prose prose-sm max-w-none prose-invert [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_*]:!text-white/90";

  const chatWithPDF = useAction(api.pdfChat.chatWithPDF);
  const generateUploadUrl = useMutation(api.study.generateUploadUrl);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      // Construct URL (assuming we can get it or use storageId. For now, we need a public URL for the model.
      // Since `generateUploadUrl` implies private convex storage, the model might not be able to access it directly unless we return a signed URL.
      // Alternative: Convert to Base64 for simplicity in this turn if file size permits).

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload image");
      setIsUploading(false);
    }
  };

  const handleModeChange = (value: string) => {
    if (value === "socratic") {
      setShowSocraticWarning(true);
    } else if (value === "feynman") {
      setChatMode("feynman");
      toast.success("Feynman Mode enabled: Teach the AI!");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "**Feynman Mode Activated** 🧠\n\nI'm now a confused student. Please explain the concepts to me simply. I'll ask 'Why?' and 'How?' to test your understanding.",
        },
      ]);
    } else {
      setChatMode("standard");
      toast.info("Standard mode enabled");
    }
  };

  const confirmSocraticMode = () => {
    setChatMode("socratic");
    setShowSocraticWarning(false);
    toast.success("Socratic Tutor mode enabled");

    // Add a system message to chat to indicate mode switch
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "**Socratic Mode Activated** 🎓\n\nI will now guide you to answers with questions instead of giving them directly. Let's learn together!",
      },
    ]);
  };

  const handleTool = (tool: string) => {
    let prompt = "";
    switch (tool) {
      case "mnemonic":
        prompt =
          "Create a memorable mnemonic for the key concepts in this section.";
        break;
      case "analogy":
        prompt = "Explain this concept using a simple, real-world analogy.";
        break;
      case "eli5":
        prompt = "Explain this like I'm 5 years old.";
        break;
    }
    setInput(prompt);
  };

  const handleSend = async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setSources([]);

    try {
      const result = await chatWithPDF({
        docId,
        userMessage,
        image: selectedImage || undefined,
        chatHistory: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        mode: chatMode,
      });
      setSelectedImage(null);

      if (
        result.response.includes("can't find that in this PDF") ||
        result.response.includes("not present") ||
        result.response.includes("insufficient confidence")
      ) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I can't find that in this PDF.",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: result.response },
        ]);
        setSources(result.sources);
        setShowSources(true); // Reopen sources panel
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to get response");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeMd = (s: string) => (s || "").replace(/<br\s*\/?>/gi, "\n");

  const processContent = (content: string) =>
    content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

  const MARKDOWN_ALLOWED_ELEMENTS: Array<string> = [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "code",
    "pre",
    "ul",
    "ol",
    "li",
    "a",
    "blockquote",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "span",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ];

  const MARKDOWN_COMPONENTS: any = {
    u: (props: any) => (
      <u className="underline underline-offset-2 decoration-primary/50">
        {props.children}
      </u>
    ),
    a: (props: any) => {
      const url = props.href || "";
      let domain = "";
      try {
        domain = new URL(url).hostname.replace("www.", "");
      } catch (e) {
        domain = "Source";
      }
      return (
        <a
          target="_blank"
          rel="noreferrer"
          className={cn(
            "group inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all no-underline mx-1 align-middle",
            isLight 
              ? "bg-primary/5 border-primary/10 hover:bg-primary/10 hover:border-primary/30"
              : "bg-white/5 border-white/10 hover:bg-blue-500/10 hover:border-blue-500/30"
          )}
          {...props}
        >
          {" "}
          <span className={cn(
            "text-[10px] transition-colors",
            isLight ? "text-primary/40 group-hover:text-primary/60" : "text-white/30 group-hover:text-blue-400/50"
          )}>
            {domain}
          </span>{" "}
          <span className={cn(
            "text-xs truncate max-w-[150px] transition-colors",
            isLight ? "text-primary/70 group-hover:text-primary" : "text-white/70 group-hover:text-white"
          )}>
            {props.children}
          </span>{" "}
        </a>
      );
    },
    code: ({ node, inline, className, children, ...props }: any) => {
      return inline ? (
        <code
          className={cn(
            "px-1 py-0.5 rounded text-sm font-mono",
            isLight
              ? "bg-slate-100 text-slate-800"
              : "bg-white/10 text-primary-foreground",
          )}
          {...props}
        >
          {children}
        </code>
      ) : (
        <div className="relative group">
          <pre
            className={cn(
              "p-3 rounded-lg overflow-x-auto border my-2",
              isLight
                ? "bg-slate-50 border-slate-200"
                : "bg-black/40 border-white/10",
            )}
            {...props}
          >
            <code
              className={cn(
                "text-sm font-mono",
                isLight ? "text-slate-700" : "text-gray-200",
              )}
            >
              {children}
            </code>
          </pre>
        </div>
      );
    },
    blockquote: (props: any) => (
      <blockquote
        className="border-l-2 border-primary/50 pl-4 italic text-muted-foreground my-2"
        {...props}
      />
    ),
  };

  return (
    <div className={cn("h-full flex flex-col transition-colors duration-500", isLight ? "bg-[#f8fafc]" : "bg-[#0a0a0a]")}>
      {/* Header with Mode Selector */}
      <div className={cn(
        "border-b p-3 flex items-center justify-between transition-colors",
        isLight ? "border-primary/10 bg-white/60 backdrop-blur-xl" : "border-[#1a1a1a] bg-[#0f0f0f]"
      )}>
        <div className={cn("flex items-center gap-2 text-sm font-bold tracking-tight", isLight ? "text-primary" : "text-white")}>
          <Bot className={cn("w-4 h-4", isLight ? "text-primary" : "text-cyan-400")} />
          <span>AI Assistant</span>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 transition-colors",
                  isLight ? "text-primary/60 hover:text-primary hover:bg-primary/10" : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                <Wand2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className={cn(
                "border outline-none transition-colors duration-300",
                isLight ? "bg-white border-primary/10 text-primary" : "bg-[#1a1a1a] border-white/10 text-white"
              )}
            >
              <DropdownMenuItem
                onClick={() => handleTool("mnemonic")}
                className="cursor-pointer hover:bg-white/10"
              >
                <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
                Generate Mnemonic
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleTool("analogy")}
                className="cursor-pointer hover:bg-white/10"
              >
                <BookOpen className="w-4 h-4 mr-2 text-blue-400" />
                Create Analogy
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleTool("eli5")}
                className="cursor-pointer hover:bg-white/10"
              >
                <Bot className="w-4 h-4 mr-2 text-green-400" />
                Explain Like I'm 5
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Select value={chatMode} onValueChange={handleModeChange}>
            <SelectTrigger className={cn(
              "w-[140px] h-8 text-xs border transition-colors",
              isLight ? "bg-white border-primary/10 text-primary" : "bg-[#1a1a1a] border-white/10 text-white"
            )}>
              <SelectValue placeholder="Select Mode" />
            </SelectTrigger>
            <SelectContent className={cn(
              "border outline-none transition-colors duration-300",
              isLight ? "bg-white border-primary/10 text-primary" : "bg-[#1a1a1a] border-white/10 text-white"
            )}>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="socratic">Socratic Tutor</SelectItem>
              <SelectItem value="feynman">Feynman Mode</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden">
        {messages.length === 1 ? (
          <div className="text-center max-w-2xl animate-in fade-in zoom-in duration-500">
            <h1 className={cn(
              "text-4xl font-black tracking-tight mb-3 transition-colors",
              isLight ? "text-primary" : "text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60"
            )}>
              Hey, I'm Cryonex
            </h1>
            <p className={cn("text-base font-medium", isLight ? "text-primary/60" : "text-[#9b9b9b]")}>
              I can work with you on your doc and answer any questions!
            </p>
          </div>
        ) : (
          <ScrollArea className="w-full h-full pr-4">
            <div className="space-y-6 p-2">
              {messages.slice(1).map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${message.role === "user" ? "justify-end" : ""}`}
                >
                  {message.role === "assistant" && (
                    <div className={cn(
                      "h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 shadow-lg transition-all",
                      isLight 
                        ? "bg-primary/5 border-primary/10 shadow-primary/5" 
                        : "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-white/5 shadow-cyan-500/5"
                    )}>
                      {chatMode === "socratic" ? (
                        <GraduationCap className={cn("h-4.5 w-4.5", isLight ? "text-primary" : "text-cyan-400")} />
                      ) : chatMode === "feynman" ? (
                        <BrainCircuit className={cn("h-4.5 w-4.5", isLight ? "text-primary" : "text-blue-400")} />
                      ) : (
                        <Bot className={cn("h-4.5 w-4.5", isLight ? "text-primary" : "text-cyan-400")} />
                      )}
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl p-4 max-w-[85%] shadow-sm transition-colors",
                      message.role === "user"
                        ? isLight 
                          ? "bg-primary text-white rounded-tr-sm shadow-primary/20" 
                          : "bg-primary text-primary-foreground rounded-tr-sm"
                        : assistantBubbleClasses
                    )}
                  >
                  {message.role === "assistant" ? (
                      <div className={assistantProseClasses}>
                        <ReactMarkdown
                          rehypePlugins={[rehypeRaw]}
                          allowedElements={MARKDOWN_ALLOWED_ELEMENTS}
                          components={MARKDOWN_COMPONENTS}
                        >
                          {normalizeMd(processContent(message.content))}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">
                        {message.content}
                      </p>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className={cn(
                    "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors animate-pulse",
                    isLight ? "bg-primary/10" : "bg-cyan-500/20"
                  )}>
                    <Bot className={cn("h-4.5 w-4.5", isLight ? "text-primary" : "text-cyan-400")} />
                  </div>
                  <div className={cn(
                    "rounded-2xl p-4 rounded-tl-sm border transition-colors blur-none",
                    isLight ? "bg-white text-primary/60 border-primary/10" : "bg-[#1a1a1a] text-white/70 border-white/5"
                  )}>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="relative flex h-2 w-2">
                        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isLight ? "bg-primary" : "bg-cyan-400")}></span>
                        <span className={cn("relative inline-flex rounded-full h-2 w-2", isLight ? "bg-primary" : "bg-cyan-500")}></span>
                      </span>
                      Thinking...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Sources Section */}
      {sources.length > 0 && showSources && (
        <div className={cn(
          "border-t transition-colors",
          isLight ? "bg-white border-primary/10" : "bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a] border-[#1a1a1a]"
        )}>
          {/* Header with close button */}
          <div className={cn("flex items-center justify-between p-3 border-b", isLight ? "border-primary/5" : "border-[#1a1a1a]")}>
            <div className="flex items-center gap-2">
              <FileText className={cn("w-4 h-4", isLight ? "text-primary" : "text-cyan-400")} />
              <span className={cn("text-sm font-bold tracking-tight", isLight ? "text-primary" : "text-white/80")}>
                Sources ({sources.length})
              </span>
            </div>
            <button
              onClick={() => setShowSources(false)}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                isLight ? "hover:bg-primary/5 text-primary/40 hover:text-primary" : "hover:bg-white/10 text-white/40 hover:text-white"
              )}
              title="Close sources"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Sources list */}
          <div className="p-3 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {sources.map((source, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-start gap-3 text-sm rounded-xl p-3 border transition-all cursor-pointer group",
                  isLight 
                    ? "bg-primary/[0.02] border-primary/5 hover:border-primary/20" 
                    : "bg-[#1a1a1a] border-white/5 hover:border-cyan-500/30"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors",
                  isLight ? "bg-primary/10 text-primary" : "bg-cyan-500/20 text-cyan-400"
                )}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-bold text-[10px] uppercase tracking-widest mb-1", isLight ? "text-primary/60" : "text-cyan-400")}>
                    Page {source.page + 1}
                  </p>
                  <p className={cn("text-xs line-clamp-2 transition-colors", isLight ? "text-primary/70 group-hover:text-primary" : "text-white/60 group-hover:text-white/80")}>
                    {source.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className={cn("border-t p-4 transition-colors", isLight ? "bg-white border-primary/10" : "bg-[#0a0a0a] border-[#1a1a1a]")}>
        <PromptInputBox
          onSend={(message) => {
            let cleanedMessage = message;
            if (cleanedMessage.startsWith("[Search] ")) {
              cleanedMessage = cleanedMessage
                .replace("[Search] ", "")
                .replace(/\]$/, "");
            } else if (cleanedMessage.startsWith("[Canvas] ")) {
              cleanedMessage = cleanedMessage
                .replace("[Canvas] ", "")
                .replace(/\]$/, "");
            } else if (cleanedMessage.startsWith("[Think] ")) {
              cleanedMessage = cleanedMessage
                .replace("[Think] ", "")
                .replace(/\]$/, "");
            }
            handleSend(cleanedMessage);
          }}
          placeholder={
            chatMode === "socratic"
              ? "Ask a question to start learning..."
              : chatMode === "feynman"
                ? "Teach me about..."
                : "Ask anything about your document..."
          }
          isLoading={isLoading}
          value={input}
          onInputChange={setInput}
          selectedImage={selectedImage}
          onImageClear={() => setSelectedImage(null)}
          onImageUpload={handleImageUpload}
          isUploading={isUploading}
        />
      </div>

      {/* Socratic Mode Warning Dialog */}
      <Dialog open={showSocraticWarning} onOpenChange={setShowSocraticWarning}>
        <DialogContent
          className={cn(
            isLight
              ? "border-slate-200 bg-white text-slate-900"
              : "bg-[#1a1a1a] border-[#2a2a2a] text-white",
          )}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <GraduationCap className={cn("w-6 h-6", isLight ? "text-sky-600" : "text-blue-400")} />
              Enable Socratic Tutor Mode?
            </DialogTitle>
            <DialogDescription
              className={cn(
                "pt-2 transition-colors",
                isLight ? "text-slate-600" : "text-gray-400",
              )}
            >
              In Socratic Mode, the AI will{" "}
              <strong className={isLight ? "text-slate-900" : "text-white"}>
                never give you direct answers
              </strong>
              . Instead, it will:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  Ask guiding questions to help you find the answer yourself
                </li>
                <li>Point you to relevant sections in the document</li>
                <li>Challenge your understanding to build deeper retention</li>
              </ul>
              <div className={cn(
                "mt-4 p-3 border rounded-2xl flex gap-2 text-sm transition-colors",
                isLight ? "bg-sky-50 border-sky-200 text-sky-900" : "bg-cyan-500/10 border-cyan-500/20 text-cyan-300"
              )}>
                <Info className={cn("w-4 h-4 shrink-0 mt-0.5", isLight ? "text-primary" : "text-cyan-400")} />
                This mode is harder but scientifically proven to improve
                long-term learning.
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowSocraticWarning(false)}
              className={cn(
                "transition-colors",
                isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  : "text-gray-400 hover:text-white hover:bg-white/10",
              )}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSocraticMode}
              className={cn(
                "rounded-xl font-bold text-white transition-all active:scale-95",
                isLight ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" : "bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-600/20"
              )}
            >
              Enable Socratic Mode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
