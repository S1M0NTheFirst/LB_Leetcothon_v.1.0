"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Terminal, Clock, Zap, Shield, Crown, LucideIcon, Lock, Timer, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

// --- Types ---
interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar?: string;
  value: string | number;
  subValue?: string;
}

// --- Components ---

const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Crown className="w-4 h-4 text-yellow-500" />;
  if (rank === 2) return <Shield className="w-4 h-4 text-gray-300" />;
  if (rank === 3) return <Shield className="w-4 h-4 text-amber-600" />;
  return <span className="text-[10px] font-mono text-white/20">#{rank}</span>;
};

const LeaderboardCard = ({ 
  title, 
  icon: Icon, 
  data, 
  unit,
  isLoading
}: { 
  title: string; 
  icon: LucideIcon; 
  data: LeaderboardEntry[];
  unit: string;
  isLoading?: boolean;
}) => {
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm flex flex-col min-h-[400px]">
      <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <Icon className="w-5 h-5 text-yellow-500" />
          </div>
          <h2 className="font-bold tracking-tight text-white uppercase">{title}</h2>
        </div>
        <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">Live Intel</span>
      </div>

      <div className="flex-1 p-2 space-y-1">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-white/20">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-[10px] font-mono uppercase tracking-widest">Synchronizing...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-white/10">
            <Lock className="w-8 h-8 opacity-20" />
            <span className="text-[10px] font-mono uppercase tracking-widest">Sector Inactive</span>
          </div>
        ) : (
          data.map((entry, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={entry.id}
              className={`group relative flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                entry.rank <= 3 ? "bg-white/5 border border-white/5" : "hover:bg-white/[0.02]"
              }`}
            >
              {/* Background Glow for Top 3 */}
              {entry.rank === 1 && <div className="absolute inset-0 bg-yellow-500/5 blur-xl rounded-full pointer-events-none" />}
              
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm ${
                  entry.rank === 1 ? "bg-yellow-500 text-black font-bold" :
                  entry.rank === 2 ? "bg-gray-300 text-black font-bold" :
                  entry.rank === 3 ? "bg-amber-600 text-black font-bold" :
                  "text-white/40"
                }`}>
                  {entry.rank}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${entry.rank <= 3 ? "text-white" : "text-white/70"}`}>
                      {entry.name}
                    </span>
                    <RankIcon rank={entry.rank} />
                  </div>
                  {entry.subValue && (
                    <div className="text-[10px] font-mono text-white/20 uppercase tracking-tighter">
                      {entry.subValue}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right relative z-10">
                <div className={`font-mono font-bold ${entry.rank <= 3 ? "text-yellow-500" : "text-white/60"}`}>
                  {entry.value.toLocaleString()}
                </div>
                <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{unit}</div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default function LeaderboardPage() {
  const [countdown, setCountdown] = useState("");

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

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${baseUrl}/api/leaderboard`);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
  });

  const topEarners: LeaderboardEntry[] = users.map((u: any) => ({
    id: u.id,
    rank: u.rank,
    name: u.name,
    value: u.points,
  }));

  const topSolvers: LeaderboardEntry[] = [...users]
    .sort((a: any, b: any) => b.solved_count - a.solved_count || b.points - a.points)
    .map((u: any, i: number) => ({
      id: u.id,
      rank: i + 1,
      name: u.name,
      value: u.solved_count,
    }));

  const mostDedicated: LeaderboardEntry[] = [];

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-yellow-500/30">
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(white,transparent)] opacity-20 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* LOCKED OVERLAY - ULTRA TRANSPARENT */}
        <div className="fixed inset-0 top-16 z-40 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[1px]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center p-10 rounded-3xl border border-white/20 bg-zinc-900/40 backdrop-blur-md shadow-2xl text-center max-w-sm mx-6"
          >
            <div className="bg-yellow-500/10 p-5 rounded-full mb-6 border border-yellow-500/30 shadow-[0_0_30px_rgba(255,199,44,0.1)]">
              <Lock className="w-10 h-10 text-yellow-500" />
            </div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter mb-2">
              Intel <span className="text-yellow-500">Locked</span>
            </h2>
            <p className="text-white/60 font-mono text-[10px] uppercase tracking-widest mb-6">
              Sector Surveillance Restricted
            </p>
            
            <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl w-full">
              <div className="flex items-center justify-center gap-3 text-yellow-500 font-black text-xl font-mono italic">
                <Timer className="w-4 h-4" />
                {countdown}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500">
              <Zap className="w-4 h-4 fill-current" />
              <span className="text-xs font-mono font-bold tracking-[0.3em] uppercase">System Status: Active</span>
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
              <div className="text-2xl font-mono font-bold text-yellow-500">1,248</div>
            </div>
            <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
              <div className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-1">Sector Efficiency</div>
              <div className="text-2xl font-mono font-bold text-white">98.4%</div>
            </div>
          </div>
        </div>

        {/* Leaderboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <LeaderboardCard 
            title="Top Earners" 
            icon={Trophy} 
            data={topEarners} 
            unit="Points"
            isLoading={isLoading}
          />
          <LeaderboardCard 
            title="Top Solvers" 
            icon={Terminal} 
            data={topSolvers} 
            unit="Problems"
            isLoading={isLoading}
          />
          <LeaderboardCard 
            title="Most Dedicated" 
            icon={Clock} 
            data={mostDedicated} 
            unit="Streak"
            isLoading={isLoading}
          />
        </div>

        {/* Global Activity Feed */}
        <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest">Global Activity Feed</h3>
          </div>
          
          <div className="space-y-3">
            {[
              { user: "null_pointer", action: "decrypted sector 7", time: "2m ago" },
              { user: "cyber_chatbot", action: "earned 500 points", time: "5m ago" },
              { user: "bit_crusher", action: "initiated brute force", time: "12m ago" },
              { user: "hex_wizard", action: "uploaded new exploit", time: "15m ago" },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between text-[11px] font-mono border-b border-white/5 pb-2 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-yellow-500 font-bold">{activity.user}</span>
                  <span className="text-white/40">{activity.action}</span>
                </div>
                <span className="text-white/20">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
