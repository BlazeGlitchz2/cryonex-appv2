import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, ChevronDown, ChevronRight, BrainCircuit, GraduationCap, Info, Sparkles, Wand2, BookOpen, AlertTriangle, X, FileText } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { motion, AnimatePresence } from "framer-motion";
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

// --- Thinking Block Component ---
const ThinkingBlock = ({ content }: { content: string }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="my-2 rounded-lg border border-purple-500/20 bg-purple-500/5 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-purple-400 hover:bg-purple-500/10 transition-colors"
      >
        <BrainCircuit className="w-3 h-3" />
        <span>Chain of Thought</span>
        {isOpen ? <ChevronDown className="w-3 h-3 ml-auto" /> : <ChevronRight className="w-3 h-3 ml-auto" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-3 py-2 text-xs text-muted-foreground border-t border-purple-500/10 font-mono leading-relaxed whitespace-pre-wrap">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function PDFChat({ docId }: PDFChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hey, I'm Cryonex\n\nI can work with you on your doc and answer any questions!`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<Array<{ page: number; text: string; score: number }>>([]);
  const [chatMode, setChatMode] = useState<"standard" | "socratic" | "feynman">("standard");
  const [showSocraticWarning, setShowSocraticWarning] = useState(false);
  const [showSources, setShowSources] = useState(true);
  const [input, setInput] = useState("");

  const chatWithPDF = useAction(api.pdfChat.chatWithPDF);

  const handleModeChange = (value: string) => {
    if (value === "socratic") {
      setShowSocraticWarning(true);
    } else if (value === "feynman") {
      setChatMode("feynman");
      toast.success("Feynman Mode enabled: Teach the AI!");
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "**Feynman Mode Activated** 🧠\n\nI'm now a confused student. Please explain the concepts to me simply. I'll ask 'Why?' and 'How?' to test your understanding."
      }]);
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
    setMessages(prev => [...prev, {
      role: "assistant",
      content: "**Socratic Mode Activated** 🎓\n\nI will now guide you to answers with questions instead of giving them directly. Let's learn together!"
    }]);
  };

  const handleTool = (tool: string) => {
    let prompt = "";
    switch (tool) {
      case "mnemonic":
        prompt = "Create a memorable mnemonic for the key concepts in this section.";
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

    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setSources([]);

    try {
      const result = await chatWithPDF({
        docId,
        userMessage,
        chatHistory: messages.map(m => ({ role: m.role, content: m.content })),
        mode: chatMode,
      });

      if (result.response.includes("can't find that in this PDF") ||
        result.response.includes("not present") ||
        result.response.includes("insufficient confidence")) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "I can't find that in this PDF."
        }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: result.response }]);
        setSources(result.sources);
        setShowSources(true); // Reopen sources panel
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to get response");
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeMd = (s: string) => (s || "").replace(/<br\s*\/?>/gi, "\n");

  // Custom renderer to handle <think> tags
  const processContent = (content: string) => {
    const parts = [];
    let lastIndex = 0;
    const regex = /<think>([\s\S]*?)<\/think>/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'think', content: match[1] });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push({ type: 'text', content: content.slice(lastIndex) });
    }

    return parts;
  };

  const MARKDOWN_ALLOWED_ELEMENTS: Array<string> = [
    "p", "br", "strong", "em", "u", "code", "pre", "ul", "ol", "li", "a", "blockquote",
    "h1", "h2", "h3", "h4", "h5", "h6", "span", "table", "thead", "tbody", "tr", "th", "td"
  ];

  const MARKDOWN_COMPONENTS: any = {
    u: (props: any) => <u className="underline underline-offset-2 decoration-primary/50">{props.children}</u>,
    a: (props: any) => { const url = props.href || ""; let domain = ""; try { domain = new URL(url).hostname.replace("www.", ""); } catch (e) { domain = "Source"; } return ( <a target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all no-underline mx-1 align-middle" {...props} > <span className="text-[10px] text-white/30 group-hover:text-purple-400/50">{domain}</span> <span className="text-xs text-white/70 group-hover:text-white truncate max-w-[150px]">{props.children}</span> </a> ); },
    code: ({ node, inline, className, children, ...props }: any) => {
      return inline ? (
        <code className="bg-white/10 px-1 py-0.5 rounded text-sm font-mono text-primary-foreground" {...props}>{children}</code>
      ) : (
        <div className="relative group">
          <pre className="bg-black/40 p-3 rounded-lg overflow-x-auto border border-white/10 my-2" {...props}>
            <code className="text-sm font-mono text-gray-200">{children}</code>
          </pre>
        </div>
      );
    },
    blockquote: (props: any) => <blockquote className="border-l-2 border-primary/50 pl-4 italic text-muted-foreground my-2" {...props} />,
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Header with Mode Selector */}
      <div className="border-b border-[#1a1a1a] p-3 flex items-center justify-between bg-[#0f0f0f]">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Bot className="w-4 h-4 text-purple-400" />
          <span>AI Assistant</span>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                <Wand2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10 text-white">
              <DropdownMenuItem onClick={() => handleTool("mnemonic")} className="cursor-pointer hover:bg-white/10">
                <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
                Generate Mnemonic
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTool("analogy")} className="cursor-pointer hover:bg-white/10">
                <BookOpen className="w-4 h-4 mr-2 text-blue-400" />
                Create Analogy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTool("eli5")} className="cursor-pointer hover:bg-white/10">
                <Bot className="w-4 h-4 mr-2 text-green-400" />
                Explain Like I'm 5
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Select value={chatMode} onValueChange={handleModeChange}>
            <SelectTrigger className="w-[140px] h-8 text-xs bg-[#1a1a1a] border-white/10 text-white">
              <SelectValue placeholder="Select Mode" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
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
            <h1 className="text-4xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Hey, I'm Cryonex</h1>
            <p className="text-base text-[#9b9b9b]">I can work with you on your doc and answer any questions!</p>
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
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/5 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/5">
                      {chatMode === "socratic" ? (
                        <GraduationCap className="h-4 w-4 text-purple-400" />
                      ) : chatMode === "feynman" ? (
                        <BrainCircuit className="h-4 w-4 text-pink-400" />
                      ) : (
                        <Bot className="h-4 w-4 text-purple-400" />
                      )}
                    </div>
                  )}
                  <div
                    className={`rounded-2xl p-4 max-w-[85%] shadow-sm ${message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-[#1a1a1a] text-white border border-white/5 rounded-tl-sm"
                      }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm prose-invert max-w-none [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_*]:!text-white/90">
                        {processContent(message.content).map((part, i) => (
                          part.type === 'think' ? (
                            <ThinkingBlock key={i} content={part.content} />
                          ) : (
                            <ReactMarkdown
                              key={i}
                              rehypePlugins={[rehypeRaw]}
                              allowedElements={MARKDOWN_ALLOWED_ELEMENTS}
                              components={MARKDOWN_COMPONENTS}
                            >
                              {normalizeMd(part.content)}
                            </ReactMarkdown>
                          )
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{message.content}</p>
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
                  <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-purple-400 animate-pulse" />
                  </div>
                  <div className="rounded-2xl p-4 bg-[#1a1a1a] text-white border border-white/5 rounded-tl-sm">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
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
      {
        sources.length > 0 && showSources && (
          <div className="border-t border-[#1a1a1a] bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
            {/* Header with close button */}
            <div className="flex items-center justify-between p-3 border-b border-[#1a1a1a]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-white/80">Sources ({sources.length})</span>
              </div>
              <button
                onClick={() => setShowSources(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
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
                  className="flex items-start gap-3 text-sm bg-[#1a1a1a] rounded-lg p-3 border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-semibold text-xs">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-purple-400 font-medium text-xs mb-1">Page {source.page + 1}</p>
                    <p className="text-white/60 text-xs line-clamp-2 group-hover:text-white/80 transition-colors">
                      {source.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }

      {/* Input Area */}
      <div className="border-t border-[#1a1a1a] p-4 bg-[#0a0a0a]">
        <PromptInputBox
          onSend={(message) => {
            let cleanedMessage = message;
            if (cleanedMessage.startsWith("[Search: ")) {
              cleanedMessage = cleanedMessage.replace("[Search: ", "").replace(/\]$/, "");
            } else if (cleanedMessage.startsWith("[Canvas: ")) {
              cleanedMessage = cleanedMessage.replace("[Canvas: ", "").replace(/\]$/, "");
            } else if (cleanedMessage.startsWith("[Think: ")) {
              cleanedMessage = cleanedMessage.replace("[Think: ", "").replace(/\]$/, "");
            }
            handleSend(cleanedMessage);
          }}
          placeholder={chatMode === "socratic" ? "Ask a question to start learning..." : chatMode === "feynman" ? "Teach me about..." : "Ask anything about your document..."}
          isLoading={isLoading}
          value={input}
          onInputChange={setInput}
        />
      </div>

      {/* Socratic Mode Warning Dialog */}
      <Dialog open={showSocraticWarning} onOpenChange={setShowSocraticWarning}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <GraduationCap className="w-6 h-6 text-purple-400" />
              Enable Socratic Tutor Mode?
            </DialogTitle>
            <DialogDescription className="text-gray-400 pt-2">
              In Socratic Mode, the AI will <strong>never give you direct answers</strong>.
              Instead, it will:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Ask guiding questions to help you find the answer yourself</li>
                <li>Point you to relevant sections in the document</li>
                <li>Challenge your understanding to build deeper retention</li>
              </ul>
              <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-md flex gap-2 text-sm text-purple-300">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                This mode is harder but scientifically proven to improve long-term learning.
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSocraticWarning(false)} className="text-gray-400 hover:text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button onClick={confirmSocraticMode} className="bg-purple-600 hover:bg-purple-700 text-white">
              Enable Socratic Mode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}