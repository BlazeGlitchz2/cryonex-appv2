import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MessageCircleMore, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function SupportChatWidget({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatId, setChatId] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize/get the chat
  const getOrCreateChat = useMutation(api.support.getOrCreateChat);
  const messages = useQuery(
    api.support.getMessages,
    chatId ? { chatId } : "skip"
  );
  const sendMessage = useMutation(api.support.sendMessage);

  useEffect(() => {
    let cancelled = false;

    void getOrCreateChat({})
      .then((nextChatId) => {
        if (!cancelled) {
          setChatId(nextChatId);
        }
      })
      .catch((error) => {
        console.error("Failed to initialize support chat:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [getOrCreateChat]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !chatId) return;

    try {
      await sendMessage({ chatId, content: message.trim() });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className={cn("fixed z-50", className)}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 mb-4 w-80 sm:w-96 rounded-2xl border border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden"
            style={{ height: "450px" }}
          >
            {/* Header */}
            <div className="flex bg-cyan-500/10 items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <MessageCircleMore className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Cryonex Support</h3>
                  <p className="text-xs text-muted-foreground">Typically replies in minutes</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close support chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages === undefined ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-3 text-center text-muted-foreground p-6">
                  <MessageCircleMore className="w-10 h-10 opacity-20" />
                  <p className="text-sm">No messages yet. Send a message to start a conversation with our support team!</p>
                </div>
              ) : (
                messages.map((msg: any, index: number) => {
                  const isSupport = msg.isAdmin;
                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex w-full",
                        isSupport ? "justify-start" : "justify-end"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                          isSupport
                            ? "bg-white/5 text-foreground rounded-tl-sm"
                            : "bg-cyan-600 text-white rounded-tr-sm"
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/5 bg-black/20">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-white/5 border-transparent focus-visible:ring-1 focus-visible:ring-cyan-500 rounded-full h-10 px-4"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!message.trim() || !chatId}
                  className="rounded-full bg-cyan-600 hover:bg-cyan-500 h-10 w-10 shrink-0"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full border text-white transition-transform hover:scale-[1.03]",
          isOpen
            ? "border-white/10 bg-white/5"
            : "border-cyan-200 bg-[linear-gradient(180deg,rgba(34,211,238,0.92),rgba(59,130,246,0.88))] shadow-[0_20px_40px_rgba(6,182,212,0.18)]"
        )}
        aria-label="Toggle support chat"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircleMore className="h-6 w-6" />}
      </button>
    </div>
  );
}
