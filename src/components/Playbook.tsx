"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const protocols = [
  {
    id: "PROTOCOL_01",
    title: "Event Structure",
    body: "The Leetcothon operates on a strict 24-hour cycle. New algorithm topics are injected daily at 00:00 AM PST and vanish at 11:59 PM PST. You must submit your solutions within this window. Once the day ends, the sector closes.",
  },
  {
    id: "PROTOCOL_02",
    title: "The Scoring Algorithm",
    body: "Every solved problem adds to your score, but consistency is your currency. We utilize a 'Streak Multiplier'—maintain a daily streak to compound your points. WARNING: If you miss a single day, your streak resets and you suffer a massive point penalty. High risk, high reward.",
  },
  {
    id: "PROTOCOL_03",
    title: "Live Telemetry",
    body: "You are being watched. The Global Leaderboard updates in real-time, tracking not just points, but performance metrics: Fastest Execution Time, Longest Active Session, and Code Efficiency. Only the top 3 operatives will be recognized.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
};

export default function Playbook() {
  const [expandedId, setExpandedId] = useState<string | null>("PROTOCOL_01");

  return (
    <section className="w-full max-w-5xl px-6 py-24">
      <div className="flex flex-col items-center mb-16">
        <div className="relative group">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase font-mono">
            <span className="relative inline-block">
              The Playbook
              <span className="absolute top-0 left-0 -ml-[1px] text-red-500 opacity-70 group-hover:animate-pulse -z-10">The Playbook</span>
              <span className="absolute top-0 left-0 ml-[1px] text-blue-500 opacity-70 group-hover:animate-pulse -z-10">The Playbook</span>
            </span>
          </h2>
        </div>
        <p className="mt-4 text-white/40 font-mono text-sm uppercase tracking-widest text-center">
           Protocols & Guidelines for Leetcothon
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 gap-4"
      >
        {protocols.map((protocol) => {
          const isExpanded = expandedId === protocol.id;
          
          return (
            <motion.div
              key={protocol.id}
              variants={cardVariants}
              onClick={() => setExpandedId(isExpanded ? null : protocol.id)}
              className={`group relative bg-white/5 border ${
                isExpanded ? "border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.1)]" : "border-white/10"
              } rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer hover:bg-white/[0.07]`}
            >
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <span className={`text-xs font-mono transition-all duration-300 tracking-[0.2em] font-bold ${
                      isExpanded ? "text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" : "text-white/40"
                    }`}>
                      {protocol.id}
                    </span>
                    <h3 className={`text-xl md:text-2xl font-bold font-mono transition-colors ${
                      isExpanded ? "text-white" : "text-white/70 group-hover:text-white"
                    }`}>
                      {protocol.title}
                    </h3>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className={`w-5 h-5 transition-colors ${
                      isExpanded ? "text-yellow-500" : "text-white/20"
                    }`} />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: "auto", opacity: 1, marginTop: 24 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="pt-6 border-t border-white/5 text-left">
                        <p className="text-gray-300 leading-relaxed md:text-lg">
                          {protocol.body}
                        </p>
                        <div className="mt-8 flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                          <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">
                            System Status: Operational
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Decorative side bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
                isExpanded ? "bg-yellow-500" : "bg-transparent"
              }`} />
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
