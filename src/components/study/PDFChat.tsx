import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, ChevronDown, ChevronRight, BrainCircuit } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { motion, AnimatePresence } from "framer-motion";

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
  const chatWithPDF = useAction(api.pdfChat.chatWithPDF);

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
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to get response");
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeMd = (s: string) => (s || "").replace(/\<br\s*\/?\>/gi, "\n");

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
    a: (props: any) => <a target="_blank" rel="noreferrer" className="text-primary hover:underline" {...props} />,
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
                      <Bot className="h-4 w-4 text-purple-400" />
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
      {sources.length > 0 && (
        <div className="border-t border-[#1a1a1a] p-4 bg-[#0f0f0f]">
          <p className="text-xs text-[#6b6b6b] mb-2 font-medium uppercase tracking-wider">Sources</p>
          <div className="space-y-2">
            {sources.map((source, idx) => (
              <div key={idx} className="text-xs bg-[#1a1a1a] rounded-md p-2 border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                <span className="text-purple-400 font-medium">Page {source.page}</span>
                <span className="text-[#6b6b6b] ml-2 line-clamp-1">• {source.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
          placeholder="Ask anything about your document..."
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}