import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Code2, Play, Terminal, Sparkles, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DemoCard() {
    const [activeTab, setActiveTab] = useState("chat");
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hi! I'm Cryonex. How can I help you build today?" }
    ]);
    const [inputValue, setInputValue] = useState("");

    const handleSend = () => {
        if (!inputValue.trim()) return;
        setMessages([...messages, { role: "user", content: inputValue }]);
        setInputValue("");
        setTimeout(() => {
            setMessages(prev => [...prev, { role: "assistant", content: "I can certainly help with that! Here's a quick visualization..." }]);
        }, 1000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-5xl mx-auto h-[600px] rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col"
        >
            {/* Toolbar */}
            <div className="h-12 border-b border-white/10 bg-white/5 flex items-center px-4 justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="ml-4 px-3 py-1 rounded-md bg-black/40 text-xs text-muted-foreground font-mono flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-primary" />
                        Cryonex Studio
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                        <Play className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-16 border-r border-white/10 bg-black/20 flex flex-col items-center py-4 gap-4">
                    <div className={`p-2 rounded-lg cursor-pointer transition-colors ${activeTab === 'chat' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-white'}`} onClick={() => setActiveTab('chat')}>
                        <Bot className="w-5 h-5" />
                    </div>
                    <div className={`p-2 rounded-lg cursor-pointer transition-colors ${activeTab === 'code' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-white'}`} onClick={() => setActiveTab('code')}>
                        <Code2 className="w-5 h-5" />
                    </div>
                    <div className={`p-2 rounded-lg cursor-pointer transition-colors ${activeTab === 'docs' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-white'}`} onClick={() => setActiveTab('docs')}>
                        <FileText className="w-5 h-5" />
                    </div>
                </div>

                {/* Workspace */}
                <div className="flex-1 flex">
                    {/* Chat Area */}
                    <div className="w-1/3 border-r border-white/10 flex flex-col bg-black/10">
                        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-white/10' : 'bg-primary/20'}`}>
                                        {m.role === 'user' ? <div className="w-4 h-4 bg-white rounded-full" /> : <Bot className="w-4 h-4 text-primary" />}
                                    </div>
                                    <div className={`p-3 rounded-lg text-sm max-w-[85%] ${m.role === 'user' ? 'bg-primary text-white' : 'bg-white/5 text-muted-foreground'}`}>
                                        {m.role === 'assistant' && i === messages.length - 1 && messages.length > 1 ? (
                                            <span className="animate-pulse">Thinking...</span>
                                        ) : (
                                            m.content
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-white/10">
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full bg-black/40 border border-white/10 rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                                    placeholder="Ask Cryonex..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <button onClick={handleSend} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="flex-1 bg-[#0a0a0a] p-8 flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                        <motion.div
                            className="relative z-10 w-64 h-64 bg-gradient-to-br from-primary to-purple-600 rounded-2xl shadow-[0_0_50px_-12px_var(--primary)] flex items-center justify-center"
                            animate={{
                                rotate: [0, 5, -5, 0],
                                scale: [1, 1.02, 0.98, 1]
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <div className="text-white font-bold text-2xl tracking-tighter">
                                Cryonex
                            </div>
                        </motion.div>

                        {/* Floating UI Elements */}
                        <motion.div
                            className="absolute top-10 right-10 p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl w-48"
                            initial={{ x: 20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="h-2 w-20 bg-white/20 rounded mb-2" />
                            <div className="h-2 w-32 bg-white/10 rounded" />
                        </motion.div>

                        <motion.div
                            className="absolute bottom-10 left-10 p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl w-48"
                            initial={{ x: -20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                        >
                            <div className="flex gap-2 mb-2">
                                <div className="h-8 w-8 rounded bg-primary/20" />
                                <div className="h-8 w-8 rounded bg-white/5" />
                                <div className="h-8 w-8 rounded bg-white/5" />
                            </div>
                            <div className="h-2 w-full bg-white/10 rounded" />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="h-8 bg-black/60 border-t border-white/10 flex items-center px-4 text-xs text-muted-foreground justify-between">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Terminal className="w-3 h-3" /> Ready</span>
                    <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" /> main</span>
                </div>
                <div>
                    Ln 12, Col 45
                </div>
            </div>
        </motion.div>
    );
}

import { GitBranch } from "lucide-react";
