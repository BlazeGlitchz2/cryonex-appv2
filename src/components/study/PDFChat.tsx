import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, CheckCircle2, Loader2, Dot } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
} from "@/components/ui/chain-of-thought";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface PDFChatProps {
  docId: string;
  title: string;
}

export function PDFChat({ docId, title }: PDFChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hey, I'm Cryonex\n\nI can work with you on your doc and answer any questions!`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<Array<{ page: number; text: string; score: number }>>([]);
  const chatWithPDF = useAction(api.pdfChat.chatWithPDF);

  // Add local thinking step animation state
  const thinkingSteps: Array<string> = [
    "Embedding your question",
    "Searching similar chunks",
    "Ranking by relevance",
    "Composing answer",
    "Adding citations",
  ];
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    setActiveStep(0);
    const id = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % thinkingSteps.length);
    }, 900);
    return () => clearInterval(id);
  }, [isLoading]);

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

  const normalizeMd = (s: string) => (s || "").replace(/<br\s*\/?>/gi, "\n");

  const MARKDOWN_ALLOWED_ELEMENTS: Array<string> = [
    "p", "br", "strong", "em", "u", "code", "pre", "ul", "ol", "li", "a", "blockquote",
    "h1", "h2", "h3", "h4", "h5", "h6", "span",
  ];

  const MARKDOWN_COMPONENTS: any = {
    u: (props: any) => <u className="underline underline-offset-2">{props.children}</u>,
    a: (props: any) => <a target="_blank" rel="noreferrer" {...props} />,
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Chat Messages Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {messages.length === 1 ? (
          <div className="text-center max-w-2xl">
            <h1 className="text-4xl font-bold text-white mb-3">Hey, I'm Cryonex</h1>
            <p className="text-base text-[#9b9b9b]">I can work with you on your doc and answer any questions!</p>
          </div>
        ) : (
          <ScrollArea className="w-full h-full">
            <div className="space-y-4 p-4">
              {messages.slice(1).map((message, index) => (
                <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
                  {message.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-purple-400" />
                    </div>
                  )}
                  <div
                    className={`rounded-lg p-3 max-w-[80%] ${
                      message.role === "user" ? "bg-purple-500 text-white" : "bg-[#1a1a1a] text-white"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm prose-invert max-w-none text-white [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_*]:!text-white">
                        <ReactMarkdown
                          rehypePlugins={[rehypeRaw]}
                          allowedElements={MARKDOWN_ALLOWED_ELEMENTS}
                          components={MARKDOWN_COMPONENTS}
                        >
                          {normalizeMd(message.content)}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-purple-400 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <ChainOfThought defaultOpen className="bg-[#1a1a1a] border border-[#2a2a2a]">
                      <ChainOfThoughtHeader>Thinking Chain</ChainOfThoughtHeader>
                      <ChainOfThoughtContent>
                        <div className="space-y-1.5">
                          {thinkingSteps.map((label, i) => {
                            const status = i < activeStep ? "complete" : i === activeStep ? "active" : "pending";
                            const Icon = status === "complete" ? CheckCircle2 : status === "active" ? Loader2 : Dot;
                            return (
                              <ChainOfThoughtStep
                                key={label + i}
                                icon={Icon}
                                label={label}
                                status={status as "complete" | "active" | "pending"}
                                className={status === "active" ? "animate-pulse" : ""}
                              />
                            );
                          })}
                        </div>
                      </ChainOfThoughtContent>
                    </ChainOfThought>
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
          <p className="text-xs text-[#6b6b6b] mb-2">Sources:</p>
          <div className="space-y-2">
            {sources.map((source, idx) => (
              <div key={idx} className="text-xs bg-[#1a1a1a] rounded p-2">
                <span className="text-purple-400 font-medium">Page {source.page}</span>
                <span className="text-[#6b6b6b] ml-2">• {source.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-[#1a1a1a] p-4">
        <PromptInputBox 
          onSubmit={handleSend} 
          placeholder="Type a question here or type '@' to reference documents..." 
        />
      </div>
    </div>
  );
}