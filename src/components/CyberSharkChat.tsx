"use client";

import { useChat } from "ai/react";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send } from "lucide-react";
import Image from "next/image";

export default function CyberSharkChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 z-50 flex flex-col items-center cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white text-black px-4 py-2 rounded-full mb-2 shadow-lg relative text-sm font-bold"
            >
              Ask me questions...
              <div className="absolute -bottom-2 right-1/2 translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white"></div>
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
              <Image
                src="/image/shark-e1598377583126.png"
                alt="Cyber Shark"
                width={80}
                height={80}
                className="drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]"
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
            className="fixed bottom-4 right-4 z-50 w-[350px] h-[500px] bg-black border-2 border-green-500 rounded-lg flex flex-col shadow-[0_0_20px_rgba(34,197,94,0.3)] overflow-hidden font-mono"
          >
            {/* Header */}
            <div className="bg-green-500/10 border-b border-green-500 p-3 flex justify-between items-center">
              <span className="text-green-500 text-xs font-bold tracking-wider">
                🦈 CYBER_SHARK v1.0 // ONLINE
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-green-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Message List */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#22c55e transparent' }}
            >
              {messages.length === 0 && (
                <div className="text-green-500/50 text-xs">
                  SYSTEM_INITIALIZED: Ready for input...
                </div>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[90%] p-2 rounded whitespace-pre-wrap ${
                      m.role === "user"
                        ? "text-yellow-400 text-right"
                        : "text-green-400 text-left"
                    }`}
                  >
                    {m.role !== "user" && (
                      <span className="text-green-600 font-bold">CYBER_SHARK_&gt; </span>
                    )}
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-green-500/30 bg-green-500/5 flex gap-2"
            >
              <input
                className="flex-1 bg-transparent border-none outline-none text-green-500 placeholder:text-green-900 text-sm"
                value={input}
                placeholder="TYPE_MESSAGE..."
                onChange={handleInputChange}
                autoFocus
              />
              <button
                type="submit"
                className="text-green-500 hover:text-white transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
