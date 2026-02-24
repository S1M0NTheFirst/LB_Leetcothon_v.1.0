"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function CyberSharkChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue;
    setInputValue("");
    
    // Append user message
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch from backend");
      }

      const data = await response.json();
      
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } else if (data.error) {
        console.error("Backend error:", data.error);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `SYSTEM_ERROR: ${data.error}` },
        ]);
      }
    } catch (error) {
      console.error("Error connecting to Python backend:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "CONNECTION_ERROR: Python backend unreachable." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col items-center cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-amber-500 text-black px-4 py-2 rounded-full mb-3 shadow-[0_0_15px_rgba(245,158,11,0.4)] relative text-sm font-black tracking-tighter uppercase"
            >
              Ask Me Questions
              <div className="absolute -bottom-2 right-1/2 translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-amber-500"></div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                y: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              <img
                src="/image/shark.png"
                alt="Cyber Shark"
                className="h-20 w-20 object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[550px] bg-black border border-amber-500/50 rounded-2xl flex flex-col shadow-[0_0_20px_rgba(245,158,11,0.2)] overflow-hidden font-mono"
          >
            {/* Header */}
            <div className="bg-amber-900/10 border-b border-amber-500/30 p-4 flex justify-between items-center backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                <span className="text-amber-500 text-xs font-black tracking-[0.2em] uppercase">
                  CYBER_SHARK v1.0 // ONLINE
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-amber-500 hover:text-white hover:bg-amber-500/20 p-1 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Message List */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.03)_0%,transparent_100%)]"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#f59e0b transparent' }}
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <img src="/image/shark.png" className="w-16 h-16 opacity-20 grayscale" alt="Shark Placeholder" />
                  <div className="text-amber-500/30 text-[10px] tracking-[0.3em] uppercase">
                    LONG BEACH LEETCOTHON1.0
                  </div>
                </div>
              )}
              
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-end gap-3 ${
                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {m.role === "assistant" && (
                    <img 
                      src="/image/shark.png" 
                      className="w-10 h-10 rounded-full border border-amber-500/50 bg-black p-1 shadow-[0_0_10px_rgba(245,158,11,0.3)] shrink-0" 
                      alt="Cyber Shark Avatar"
                    />
                  )}
                  
                  <div
                    className={`max-w-[80%] p-4 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "text-amber-100 bg-amber-500/10 border border-amber-500/50 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                        : "text-amber-400 bg-zinc-900 border border-amber-500/30 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl backdrop-blur-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-center gap-3">
                  <img 
                    src="/image/shark.png" 
                    className="w-10 h-10 rounded-full border border-amber-500/50 bg-black p-1 animate-pulse shrink-0" 
                    alt="Loading"
                  />
                  <div className="bg-amber-900/10 p-3 rounded-full flex gap-1">
                    <div className="w-1 h-1 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1 h-1 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1 h-1 bg-amber-500 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-black border-t border-amber-500/30">
              <form
                onSubmit={handleFormSubmit}
                className="relative flex items-center"
              >
                <input
                  className="w-full bg-amber-500/5 border border-amber-500/30 rounded-xl py-3 pl-4 pr-12 text-amber-400 placeholder:text-amber-700 text-sm outline-none focus:border-amber-500/60 focus:bg-amber-500/10 transition-all"
                  value={inputValue}
                  placeholder={isLoading ? "PROCESSING..." : "ENTER HERE..."}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-2 text-amber-400 hover:text-white p-2 rounded-lg transition-colors disabled:opacity-20"
                  disabled={isLoading || !inputValue.trim()}
                >
                  <Send size={20} className="drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
