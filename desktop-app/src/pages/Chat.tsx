import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../lib/convex"; // We need to generate API types or use any for now
import { Send, Plus, MessageSquare, Trash2 } from "lucide-react";

// Placeholder for API types until we run npx convex dev in desktop-app or link it
// In a real scenario, we would generate these.
const useConvexQuery = useQuery as any;
const useConvexMutation = useMutation as any;
const useConvexAction = useAction as any;

export function Chat() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chats = useConvexQuery(api.chats.list, {}) || [];
  const messages =
    useConvexQuery(
      api.messages.list,
      selectedChatId ? { chatId: selectedChatId } : "skip",
    ) || [];

  const createChat = useConvexMutation(api.chats.create);
  const deleteChat = useConvexMutation(api.chats.deleteChat);
  const createMessage = useConvexMutation(api.messages.create);
  const generateResponse = useConvexAction(api.chat.sendMessage);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isGenerating]);

  const handleCreateChat = async () => {
    const newChatId = await createChat({
      title: "New Chat",
      model: "google/gemini-1.5-flash",
    });
    setSelectedChatId(newChatId);
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this chat?")) {
      await deleteChat({ chatId });
      if (selectedChatId === chatId) setSelectedChatId(null);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedChatId || isGenerating) return;

    const userContent = input;
    setInput("");
    setIsGenerating(true);

    try {
      // 1. Save User Message
      await createMessage({
        chatId: selectedChatId,
        role: "user",
        content: userContent,
        model: "google/gemini-1.5-flash",
      });

      // 2. Generate AI Response
      // We need to construct the history for the AI
      const history = messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      }));
      history.push({ role: "user", content: userContent });

      const response = await generateResponse({
        messages: history,
        model: "google/gemini-1.5-flash", // Default model
        chatId: selectedChatId,
      });

      // 3. Save AI Message
      await createMessage({
        chatId: selectedChatId,
        role: "assistant",
        content: response,
        model: "google/gemini-1.5-flash",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to generate response. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full bg-gray-900 text-white">
      {/* Chat Sidebar */}
      <div className="w-64 border-r border-gray-700 bg-gray-800/50 flex flex-col">
        <div className="p-4">
          <button
            onClick={handleCreateChat}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
          >
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {chats.map((chat: any) => (
            <div
              key={chat._id}
              onClick={() => setSelectedChatId(chat._id)}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                selectedChatId === chat._id
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:bg-gray-700/50 hover:text-gray-200"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={16} className="shrink-0" />
                <span className="truncate text-sm">{chat.title}</span>
              </div>
              <button
                onClick={(e) => handleDeleteChat(e, chat._id)}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {!selectedChatId ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat or start a new one
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg: any) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 text-gray-400 rounded-2xl rounded-bl-none px-4 py-3 border border-gray-700 animate-pulse">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-700 bg-gray-800/30">
              <form onSubmit={handleSendMessage} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  disabled={isGenerating}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isGenerating}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
