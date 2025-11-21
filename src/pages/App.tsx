import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useChatStore } from "@/lib/stores/chat-store";
import { toast } from "sonner";
import { Message } from "@/components/ui/message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Mic, StopCircle } from "lucide-react";
import { ModelBrowser } from "@/components/models/ModelBrowser";
import { ModelPicker } from "@/components/models/ModelPicker";
import { ConversationHistorySidebar } from "@/components/ui/ConversationHistorySidebar";
import { GlassNav } from "@/components/ui/glass-nav";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useParams } from "react-router";

export default function App() {
  const { 
    activeModel, 
    activeModelProvider,
    isStreaming,
    setStreaming, // Ensure this is in your store
    currentChatId,
    setCurrentChatId
  } = useChatStore();
  
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [showModelBrowser, setShowModelBrowser] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { chatId } = useParams();

  // Fetch API keys
  const apiKeys = useQuery(api.keys.getApiKeys);

  // Load chat messages if chatId exists
  const chatMessages = useQuery(api.messages.list, chatId ? { chatId: chatId as any } : "skip");
  
  useEffect(() => {
    if (chatMessages) {
      setMessages(chatMessages);
    }
  }, [chatMessages]);

  useEffect(() => {
    if (chatId) {
      setCurrentChatId(chatId);
    }
  }, [chatId, setCurrentChatId]);

  const createChat = useMutation(api.chats.create);
  const createMessage = useMutation(api.messages.send);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    
    if (!apiKeys?.bytezApiKey) {
      toast.error("Bytez API key not found. Please check integrations.");
      return;
    }

    const userMessage = input;
    setInput("");
    setStreaming(true);

    try {
      let currentId = currentChatId;
      
      // Create chat if doesn't exist
      if (!currentId) {
        currentId = await createChat({
          title: userMessage.slice(0, 30) + "...",
          model: activeModel,
          userId: user?._id,
        });
        setCurrentChatId(currentId);
        navigate(`/app/${currentId}`);
      }

      // Add user message to UI immediately
      const tempUserMsg = { role: "user", content: userMessage, _creationTime: Date.now() };
      setMessages(prev => [...prev, tempUserMsg]);

      // Save user message
      await createMessage({
        chatId: currentId as any,
        content: userMessage,
        role: "user",
        model: activeModel
      });

      // Prepare messages for API
      const apiMessages = [
        { role: "system", content: "You are a helpful AI assistant." },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: userMessage }
      ];

      // Call Bytez API
      const response = await fetch(`${apiKeys.bytezApiKey ? "https://api.bytez.com/models/v2/openai/v1" : "https://api.bytez.com/models/v2/openai/v1"}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKeys.bytezApiKey,
          ...(apiKeys.providerApiKey ? { "provider-key": apiKeys.providerApiKey } : {})
        },
        body: JSON.stringify({
          model: activeModel === "auto" ? "Qwen/Qwen2.5-72B-Instruct" : activeModel,
          messages: apiMessages,
          stream: true,
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`API Error: ${err}`);
      }

      if (!response.body) throw new Error("No response body");

      // Handle streaming
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";
      
      // Add placeholder AI message
      setMessages(prev => [...prev, { role: "assistant", content: "", isStreaming: true }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(line => line.trim() !== "");
        
        for (const line of lines) {
          if (line.includes("[DONE]")) continue;
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices[0]?.delta?.content || "";
              aiContent += content;
              
              // Update UI
              setMessages(prev => {
                const newMsgs = [...prev];
                const lastMsg = newMsgs[newMsgs.length - 1];
                if (lastMsg.role === "assistant") {
                  lastMsg.content = aiContent;
                }
                return newMsgs;
              });
            } catch (e) {
              console.error("Error parsing stream:", e);
            }
          }
        }
      }

      // Save AI message
      await createMessage({
        chatId: currentId as any,
        content: aiContent,
        role: "assistant",
        model: activeModel
      });

    } catch (error: any) {
      toast.error(error.message || "Failed to generate response");
      console.error(error);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <ConversationHistorySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col h-full relative">
        <GlassNav 
          title="Cryonex"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          actions={[
            <Button key="models" variant="ghost" onClick={() => setShowModelPicker(true)}>
              {activeModel === "auto" ? "Auto Model" : activeModel.split("/").pop()}
            </Button>
          ]}
        />

        <div className="flex-1 overflow-y-auto p-4 pb-32">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center mt-20">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                  How can I help you today?
                </h1>
                <p className="text-muted-foreground">
                  Select a model and start chatting. Powered by Bytez.
                </p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <Message 
                  key={i} 
                  from={msg.role} 
                  isStreaming={msg.isStreaming}
                >
                  {msg.content}
                </Message>
              ))
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <div className="max-w-3xl mx-auto relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="pr-24 h-14 bg-secondary/50 backdrop-blur-md border-white/10 rounded-2xl"
              disabled={isStreaming}
            />
            <div className="absolute right-2 top-2 flex gap-2">
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-10 w-10 rounded-xl hover:bg-white/10"
              >
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button 
                size="icon" 
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="h-10 w-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {isStreaming ? <StopCircle className="h-5 w-5" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ModelBrowser open={showModelBrowser} onOpenChange={setShowModelBrowser} />
      <ModelPicker open={showModelPicker} onOpenChange={setShowModelPicker} />
    </div>
  );
}