"use client";

import { motion } from "framer-motion";
import { Terminal, Trophy, Play } from "lucide-react";
import Link from "next/link";
import { Difficulty } from "@/hooks/useDailyProblems";

interface ProblemCardProps {
  id: string;
  title: string;
  difficulty: Difficulty | "Legendary";
  points: number;
  isBonus?: boolean;
}

export const ProblemCard = ({ id, title, difficulty, points, isBonus }: ProblemCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative group p-6 rounded-xl border ${
        isBonus
          ? "border-[#FFC72C] bg-[#FFC72C]/5 shadow-[0_0_20px_rgba(255,199,44,0.1)]"
          : "border-white/10 bg-white/5 hover:border-[#FFC72C]/50"
      } transition-all duration-300`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${isBonus ? "bg-[#FFC72C]/20" : "bg-white/5"}`}>
          {isBonus ? (
            <Trophy className="w-5 h-5 text-[#FFC72C]" />
          ) : (
            <Terminal className="w-5 h-5 text-white/70" />
          )}
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-1 rounded uppercase tracking-wider ${
            difficulty === "Easy"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : difficulty === "Medium"
              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
              : difficulty === "Hard"
              ? "bg-red-500/10 text-red-400 border border-red-500/20"
              : "bg-[#FFC72C]/10 text-[#FFC72C] border border-[#FFC72C]/20"
          }`}
        >
          {difficulty}
        </span>
      </div>

      <h3 className={`text-lg font-bold mb-1 truncate ${isBonus ? "text-[#FFC72C]" : "text-white"}`} title={title}>
        {title}
      </h3>
      <p className="text-white/40 text-xs font-mono mb-6 uppercase tracking-wider">
        Worth <span className={isBonus ? "text-[#FFC72C] font-bold" : "text-white/80 font-bold"}>{points}</span> {points === 1 ? "Point" : "Points"}
      </p>

      <Link 
        href={`/arena/problem/${id}`}
        className={`w-full py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
          isBonus
            ? "bg-[#FFC72C] text-black hover:bg-[#FFC72C]/90 shadow-[0_0_15px_rgba(255,199,44,0.3)]"
            : "bg-white/10 text-white hover:bg-[#FFC72C] hover:text-black"
        }`}
      >
        <Play className="w-4 h-4" />
        ENTER
      </Link>

      {isBonus && (
        <div className="absolute -top-2 -right-2 bg-[#FFC72C] text-black text-[10px] font-black px-2 py-0.5 rounded shadow-lg transform rotate-12">
          BONUS
        </div>
      )}
    </motion.div>
  );
};

export const SkeletonCard = () => (
  <div className="p-6 rounded-xl border border-white/10 bg-white/5 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="w-9 h-9 bg-white/10 rounded-lg" />
      <div className="w-16 h-5 bg-white/10 rounded" />
    </div>
    <div className="w-3/4 h-6 bg-white/10 rounded mb-2" />
    <div className="w-1/2 h-4 bg-white/10 rounded mb-6" />
    <div className="w-full h-10 bg-white/10 rounded-lg" />
  </div>
);
