"use client";

import { motion } from "framer-motion";

const protocols = [
  {
    id: "PROTOCOL_01",
    title: "INTEGRITY_CHECK",
    description: "All solutions must be original. Plagiarism from AI or external sources without attribution is strictly prohibited.",
  },
  {
    id: "PROTOCOL_02",
    title: "DAILY_SYNC",
    description: "New challenges are released every 24 hours. Sync your progress daily to stay on the leaderboard.",
  },
  {
    id: "PROTOCOL_03",
    title: "OPTIMAL_PATH",
    description: "Efficiency matters. Solutions are ranked by time complexity and correctness. Find the most optimal path.",
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
        <p className="mt-4 text-white/40 font-mono text-sm uppercase tracking-widest">
           Protocols &  Guidelines for Leetcothon
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {protocols.map((protocol) => (
          <motion.div
            key={protocol.id}
            variants={cardVariants}
            whileHover={{ y: -5, borderColor: "rgba(234, 179, 8, 0.5)", boxShadow: "0 0 20px rgba(234, 179, 8, 0.1)" }}
            className="group relative bg-white/5 border border-white/10 rounded-2xl p-8 transition-colors"
          >
            <div className="flex flex-col h-full">
              <span className="text-xs font-mono text-yellow-500 mb-4 tracking-[0.2em] font-bold">
                {protocol.id}
              </span>
              <h3 className="text-xl font-bold mb-4 font-mono text-white group-hover:text-yellow-500 transition-colors">
                {protocol.title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6 flex-grow">
                {protocol.description}
              </p>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-white/20 uppercase">Status: Active</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
