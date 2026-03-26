"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Terminal, Clock, Zap, Shield, Crown, LucideIcon, Lock, Timer, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { StreakTracker } from "@/components/StreakTracker";

// --- Types ---
interface LeaderboardUser {
  email: string;
  name: string;
  image?: string;
  score: number;
  solved_count: number;
  streak_map: Record<string, boolean>;
  is_ironman: boolean;
}

const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Crown className="w-4 h-4 text-yellow-500" />;
  if (rank === 2) return <Shield className="w-4 h-4 text-gray-300" />;
  if (rank === 3) return <Shield className="w-4 h-4 text-amber-600" />;
  return <span className="text-[10px] font-mono text-white/20">#{rank}</span>;
};

export default function LeaderboardPage() {
  const [countdown, setCountdown] = useState("");

  const { data: leaderboard, isLoading } = useQuery<LeaderboardUser[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const res = await fetch("/api/leaderboard");
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    const targetDate = new Date("2026-03-30T00:00:00").getTime();
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance < 0) {
        setCountdown("EVENT LIVE");
        return;
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate current stage for streak highlights
  const eventStart = new Date("2026-03-30T00:00:00-07:00");
  const now = new Date();
  const diffTime = now.getTime() - eventStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const currentStage = diffDays >= 0 && diffDays < 7 ? `day_${diffDays + 1}` : "playground";

  return (
    <main className="min-h-screen bg-zinc-950 text-white pt-24 pb-12 px-6 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-yellow-500 mb-1">
              <Zap className="w-4 h-4 fill-current" />
              <span className="text-xs font-mono font-bold tracking-[0.3em] uppercase">Sector Analytics: Online</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
              LIVE <span className="text-yellow-500">INTEL</span>
            </h1>
            <p className="text-white/40 font-mono text-sm max-w-md">
              Real-time synchronization of operative performance across all sectors.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
              <div className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-1">Active Operatives</div>
              <div className="text-2xl font-mono font-bold text-yellow-500">{leaderboard?.length || 0}</div>
            </div>
            <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
              <div className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-1">Event Clock</div>
              <div className="text-2xl font-mono font-bold text-white">{countdown}</div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
          <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <h2 className="font-black tracking-tight text-white uppercase italic">Global Standings</h2>
            </div>
            <div className="hidden md:flex items-center gap-8 text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">
                <span>Operative Name</span>
                <span className="w-48">Ironman Streak</span>
                <span className="w-20 text-right">Solved</span>
                <span className="w-24 text-right">Score</span>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {isLoading ? (
              <div className="p-20 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
                <p className="text-xs font-mono text-white/20 uppercase tracking-widest">Decrypting Intel...</p>
              </div>
            ) : leaderboard?.map((user, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={user.email}
                className={`group flex flex-col md:flex-row md:items-center justify-between p-6 transition-all duration-300 ${
                  idx < 3 ? "bg-white/[0.03]" : "hover:bg-white/[0.01]"
                }`}
              >
                <div className="flex items-center gap-6 mb-4 md:mb-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-lg ${
                    idx === 0 ? "bg-yellow-500 text-black font-black" :
                    idx === 1 ? "bg-gray-300 text-black font-black" :
                    idx === 2 ? "bg-amber-600 text-black font-black" :
                    "bg-white/5 text-white/40"
                  }`}>
                    {idx + 1}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 overflow-hidden">
                        {user.image ? (
                          <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-white/20 font-mono">
                            {user.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={`font-black uppercase tracking-tight ${idx < 3 ? "text-white" : "text-white/70"}`}>
                                {user.name}
                            </span>
                            <RankIcon rank={idx + 1} />
                        </div>
                        <p className="text-[10px] text-white/20 font-mono lowercase">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-8">
                    <div className="w-full md:w-48">
                        <StreakTracker 
                            streakMap={user.streak_map} 
                            isIronman={user.is_ironman} 
                            currentStage={currentStage}
                        />
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-12 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                        <div className="text-right w-20">
                            <div className="text-lg font-bold text-white/90">{user.solved_count}</div>
                            <div className="text-[10px] text-white/30 uppercase font-mono">Solved</div>
                        </div>
                        <div className="text-right w-24">
                            <div className={`text-2xl font-black italic tracking-tighter ${idx === 0 ? "text-yellow-500" : "text-[#FFC72C]"}`}>
                                {user.score.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-white/30 uppercase font-mono">Credits</div>
                        </div>
                    </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
