"use client";

import { useState, useEffect } from "react";
import { Lock, Play, Trophy, Terminal, Cpu, Code2, Sparkles, Activity, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useDailyProblems, Difficulty } from "@/hooks/useDailyProblems";
import Link from "next/link";

interface ProblemCardProps {
  id: string;
  title: string;
  difficulty: Difficulty | "Legendary";
  points: number;
  isBonus?: boolean;
}

const ProblemCard = ({ id, title, difficulty, points, isBonus }: ProblemCardProps) => {
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

const SkeletonCard = () => (
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

interface EventRowProps {
  day: number;
  date: string;
}

const EventRow = ({ day, date }: EventRowProps) => {
  return (
    <div className="group relative flex flex-col md:flex-row items-center justify-between p-6 rounded-xl border border-white/5 bg-white/[0.02] opacity-50 filter grayscale transition-all duration-500">
      <div className="flex items-center gap-6 mb-4 md:mb-0">
        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-xl font-black text-white/20">
          0{day}
        </div>
        <div>
          <h4 className="text-white/60 font-bold uppercase tracking-widest">Main Event: Day {day}</h4>
          <p className="text-white/20 text-xs font-mono uppercase tracking-tighter flex items-center gap-2">
            <Lock className="w-3 h-3" />
            Unlocks on {date}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end px-6 border-r border-white/5">
          <span className="text-[10px] text-white/20 uppercase tracking-widest font-mono">Status</span>
          <span className="text-xs text-white/40 font-bold uppercase">Restricted</span>
        </div>
        <div className="px-6 py-2 border border-white/10 rounded-lg bg-white/5 cursor-not-allowed">
          <Lock className="w-5 h-5 text-white/20" />
        </div>
      </div>

      {/* Grid pattern overlay for locked look */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none rounded-xl" />
    </div>
  );
};

export default function ArenaPage() {
  const [hackersCoding] = useState(12);
  const [level, setLevel] = useState<"beginner" | "experienced">("beginner");

  // Load level from localStorage on mount
  useEffect(() => {
    const savedLevel = localStorage.getItem("arena_level") as "beginner" | "experienced";
    if (savedLevel && (savedLevel === "beginner" || savedLevel === "experienced")) {
      setLevel(savedLevel);
    }
  }, []);

  // Save level to localStorage when it changes
  const handleLevelChange = (newLevel: "beginner" | "experienced") => {
    setLevel(newLevel);
    localStorage.setItem("arena_level", newLevel);
  };

  const { data: problems, isLoading, isFetching } = useDailyProblems(level);

  const mainEvents = [
    { day: 1, date: "March 30, 2026" },
    { day: 2, date: "March 31, 2026" },
    { day: 3, date: "April 1, 2026" },
    { day: 4, date: "April 2, 2026" },
    { day: 5, date: "April 3, 2026" },
    { day: 6, date: "April 4, 2026" },
    { day: 7, date: "April 5, 2026" },
  ];

  return (
    <div className="min-h-screen bg-[#111111] text-white selection:bg-[#FFC72C] selection:text-black">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 border-l-4 border-[#FFC72C] pl-6">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
            THE <span className="text-[#FFC72C]">ARENA</span>
          </h1>
          <p className="text-white/40 font-mono mt-2 uppercase tracking-widest text-sm"> 
          </p>
        </div>

        {/* Playground Section */}
        <section className="mb-20">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div className="flex items-center gap-4 flex-1">
              <Cpu className="text-[#FFC72C] w-6 h-6" />
              <h2 className="text-xl font-bold uppercase tracking-widest">The Playground</h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-[#FFC72C]/50 to-transparent" />
              
              {/* Level Toggle */}
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => handleLevelChange("beginner")}
                  className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                    level === "beginner" ? "bg-[#FFC72C] text-black" : "text-white/40 hover:text-white"
                  }`}
                >
                  Beginner
                </button>
                <button
                  onClick={() => handleLevelChange("experienced")}
                  className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                    level === "experienced" ? "bg-[#FFC72C] text-black" : "text-white/40 hover:text-white"
                  }`}
                >
                  Experienced
                </button>
              </div>

              <span className="text-[10px] font-mono text-[#FFC72C] border border-[#FFC72C]/20 px-2 py-1 rounded animate-pulse">
                UNLOCKED
              </span>
            </div>

            {/* Live Activity Counter */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
              <div className="relative">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/80">
                <span className="text-green-400">{hackersCoding}</span> Leetcoder Coding
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
            {isLoading || (isFetching && !problems) ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              problems?.map((prob, idx) => (
                <ProblemCard 
                  key={prob.id} 
                  id={prob.id}
                  title={prob.title}
                  difficulty={prob.difficulty}
                  points={prob.points}
                  isBonus={idx === 4} // Assuming last one is bonus as per requirements
                />
              ))
            )}
            {isFetching && problems && (
               <div className="absolute -top-6 right-0 flex items-center gap-2 text-[10px] font-mono text-[#FFC72C]">
                 <Loader2 className="w-3 h-3 animate-spin" />
                 REFRESHING...
               </div>
            )}
          </div>
        </section>

        {/* Main Event Section */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <Trophy className="text-white/20 w-6 h-6" />
            <h2 className="text-xl font-bold uppercase tracking-widest text-white/40">Main Event</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            <span className="text-[10px] font-mono text-white/20 border border-white/10 px-2 py-1 rounded">
              RESTRICTED
            </span>
          </div>

          <div className="space-y-4">
            {mainEvents.map((event) => (
              <EventRow key={event.day} {...event} />
            ))}
          </div>
        </section>
      </div>

      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFC72C]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FFC72C]/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
