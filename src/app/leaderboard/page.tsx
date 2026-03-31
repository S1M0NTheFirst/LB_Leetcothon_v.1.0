"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Trophy, 
  Terminal, 
  Clock, 
  Zap, 
  Shield, 
  Crown, 
  Lock, 
  Timer, 
  Loader2, 
  Search, 
  Target, 
  Flame, 
  TrendingUp,
  AlertCircle,
  Activity,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { StreakTracker } from "@/components/StreakTracker";
import LockedSection from "@/components/LockedSection";

// --- Types ---
interface LeaderboardUser {
  email: string;
  name: string;
  image?: string;
  points: number;
  solved_count: number;
  streak_map: Record<string, boolean>;
  is_ironman: boolean;
  created_at?: string;
  last_login?: string;
  total_time_spent?: number;
}

type SortCategory = "points" | "solved" | "persistence";

const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500/20" />;
  if (rank === 2) return <Shield className="w-6 h-6 text-gray-400 fill-gray-400/20" />;
  if (rank === 3) return <Shield className="w-6 h-6 text-amber-700 fill-amber-700/20" />;
  return null;
};

export default function LeaderboardPage() {
  const [countdown, setCountdown] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SortCategory>("points");
  const [syncTime, setSyncTime] = useState<string>("");

  const { data: leaderboard, isLoading } = useQuery<LeaderboardUser[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${baseUrl}/api/leaderboard`);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    setSyncTime(new Date().toLocaleTimeString());
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

  const getPersistenceScore = (user: LeaderboardUser) => {
    return user.total_time_spent || 0;
  };

  const formatPersistence = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const sortedLeaderboard = useMemo(() => {
    if (!leaderboard || !Array.isArray(leaderboard)) return [];
    
    let base = [...leaderboard];
    
    if (activeTab === "points") {
        base.sort((a, b) => (b.points || 0) - (a.points || 0));
    } else if (activeTab === "solved") {
        base.sort((a, b) => (b.solved_count || 0) - (a.solved_count || 0));
    } else if (activeTab === "persistence") {
        base.sort((a, b) => getPersistenceScore(b) - getPersistenceScore(a));
    }
    
    return base;
  }, [leaderboard, activeTab]);

  const topThree = sortedLeaderboard.slice(0, 3);
  const restOfLeaderboard = sortedLeaderboard.slice(3);
  
  const filteredRest = restOfLeaderboard.filter(user => 
    (user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (user.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate current stage for streak highlights
  const eventStart = new Date("2026-03-30T00:00:00-07:00");
  const eventEnd = new Date("2026-04-05T23:59:59-07:00");
  const now = new Date();
  const isEventLive = now >= eventStart && now <= eventEnd;
  const diffTime = now.getTime() - eventStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const currentStage = diffDays >= 0 && diffDays < 7 ? `day_${diffDays + 1}` : "playground";

  const categories: {id: SortCategory, label: string, icon: any}[] = [
    { id: "points", label: "Most Credits", icon: Zap },
    { id: "solved", label: "Most Solved", icon: Award },
    { id: "persistence", label: "Stay Longest", icon: Activity }
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-24 px-6 relative overflow-hidden">
      
      {/* LOCKED OVERLAY */}
      {!isEventLive && countdown !== "" && (
        <LockedSection title="Leaderboard" variant="overlay" />
      )}

      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-yellow-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-yellow-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-yellow-500"
            >
              <Terminal className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold tracking-[0.4em] uppercase">Security Clearance: Level 4</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase">
              HACKER <span className="text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]">LEADERBOARD</span>
            </h1>
            <div className="flex flex-wrap gap-4 text-xs font-mono text-white/40">
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" /> STREAMS: ENCRYPTED</span>
              <span className="flex items-center gap-2"><TrendingUp className="w-3 h-3" /> VOLATILITY: HIGH</span>
              <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> SYNC: {syncTime}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="px-8 py-4 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-md relative group">
              <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-1 flex items-center gap-2">
                <Target className="w-3 h-3" /> Live Operatives
              </div>
              <div className="text-3xl font-black text-yellow-500 italic tracking-tighter">
                {isLoading ? "---" : leaderboard?.length || 0}
              </div>
            </div>
            <div className="px-8 py-4 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-md relative group">
              <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-1 flex items-center gap-2">
                <Timer className="w-3 h-3" /> Event Clock
              </div>
              <div className="text-3xl font-black text-white italic tracking-tighter">{countdown}</div>
            </div>
          </div>
        </div>

        {/* Sorting Tabs */}
        <div className="flex flex-wrap items-center gap-4 mb-12">
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all font-black uppercase italic text-sm ${
                        activeTab === cat.id 
                        ? "bg-yellow-500 border-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)] scale-105" 
                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                    }`}
                >
                    <cat.icon className="w-4 h-4" />
                    {cat.label}
                </button>
            ))}
        </div>

        {/* Top 3 opertives Section */}
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-6">
            <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
            <div className="text-center">
              <p className="text-sm font-mono text-white/40 uppercase tracking-[0.5em] animate-pulse">Synchronizing Data Streams</p>
              <p className="text-[10px] text-white/20 font-mono mt-2 italic">Decrypting scoreboard encryption...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              {topThree.map((user, idx) => (
                <motion.div
                  key={user.email}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`relative p-8 rounded-[2.5rem] border overflow-hidden group transition-all duration-500 ${
                    idx === 0 
                      ? "bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.15)] md:scale-105 z-10" 
                      : "bg-white/[0.03] border-white/10 hover:border-white/20"
                  }`}
                >
                  {/* Rank Badge */}
                  <div className={`absolute top-6 right-6 flex items-center justify-center p-3 rounded-2xl ${
                    idx === 0 ? "bg-yellow-500 text-black" : "bg-white/5 text-white/40"
                  }`}>
                    <RankIcon rank={idx + 1} />
                    <span className="text-xl font-black italic ml-1">#{idx + 1}</span>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-6 mb-8">
                      <div className={`w-20 h-20 rounded-3xl p-1 border-2 overflow-hidden ${
                        idx === 0 ? "border-yellow-500" : "border-white/10"
                      }`}>
                        {user.image ? (
                          <img src={user.image} alt={user.name} className="w-full h-full object-cover rounded-[1.2rem]" />
                        ) : (
                          <div className="w-full h-full bg-white/5 flex items-center justify-center text-xl font-black text-white/20 rounded-[1.2rem]">
                            {(user.name || "??").substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-1 line-clamp-1">
                          {user.name}
                        </h3>
                        <p className="text-[10px] font-mono text-white/30 truncate max-w-[150px]">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                            {activeTab === "points" ? "Active Points" : activeTab === "solved" ? "Solved Count" : "Time Spent"}
                          </span>
                          <span className={`text-3xl font-black italic ${idx === 0 ? "text-yellow-500" : "text-white"}`}>
                            {activeTab === "points" 
                                ? (user.points || 0).toLocaleString() 
                                : activeTab === "solved" 
                                    ? (user.solved_count || 0) 
                                    : formatPersistence(getPersistenceScore(user))}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            className={`h-full ${idx === 0 ? "bg-yellow-500" : "bg-white/40"}`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                         <div>
                            <p className="text-[10px] font-mono text-white/30 uppercase mb-1">
                                {activeTab === "points" ? "Solved" : "Credits"}
                            </p>
                            <p className="text-xl font-black text-white italic">
                                {activeTab === "points" ? (user.solved_count || 0) : (user.points || 0).toLocaleString()}
                            </p>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-mono text-white/30 uppercase mb-1">Ironman</p>
                            <div className={`p-1 rounded-md ${user.is_ironman ? "bg-green-500/20 text-green-500" : "bg-white/5 text-white/20"}`}>
                                <Flame className="w-5 h-5" />
                            </div>
                         </div>
                      </div>

                      <StreakTracker 
                        streakMap={user.streak_map || {}} 
                        isIronman={user.is_ironman} 
                        currentStage={currentStage}
                      />
                    </div>
                  </div>

                  {/* Aesthetic Corner Accents */}
                  <div className={`absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br opacity-10 pointer-events-none ${
                    idx === 0 ? "from-yellow-500 to-transparent" : "from-white to-transparent"
                  }`} />
                </motion.div>
              ))}
            </div>

            {/* Global Standings Section */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
              <div className="p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/10 rounded-2xl">
                    <Shield className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tight">Global Standings</h2>
                    <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Operative Rank Index</p>
                  </div>
                </div>

                <div className="relative w-full md:w-96 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-yellow-500 transition-colors" />
                  <input 
                    type="text"
                    placeholder="Search Operative ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm font-mono focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-white/10"
                  />
                </div>
              </div>

              <div className="divide-y divide-white/5 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.01] text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
                    <tr>
                      <th className="px-10 py-6 font-medium">Rank</th>
                      <th className="px-6 py-6 font-medium">Operative</th>
                      <th className="px-6 py-6 font-medium hidden lg:table-cell">Intel Streak</th>
                      <th className="px-6 py-6 font-medium text-right">
                        {activeTab === "points" ? "Solved" : activeTab === "solved" ? "Credits" : "Joined"}
                      </th>
                      <th className="px-10 py-6 font-medium text-right">
                        {activeTab === "points" ? "Credits" : activeTab === "solved" ? "Solved" : "Stay"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence mode="popLayout">
                      {filteredRest.map((user, idx) => (
                        <motion.tr
                          key={user.email}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          <td className="px-10 py-8">
                            <span className="font-mono text-lg text-white/40 group-hover:text-yellow-500 transition-colors italic">#{idx + 4}</span>
                          </td>
                          <td className="px-6 py-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
                                {user.image ? (
                                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs font-black text-white/20">
                                    {(user.name || "??").substring(0, 2).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-black uppercase italic text-white/80 group-hover:text-white transition-colors">
                                  {user.name}
                                </p>
                                <p className="text-[10px] font-mono text-white/20 group-hover:text-white/40 transition-colors">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-8 hidden lg:table-cell min-w-[200px]">
                            <StreakTracker 
                              streakMap={user.streak_map || {}} 
                              isIronman={user.is_ironman} 
                              currentStage={currentStage}
                            />
                          </td>
                          <td className="px-6 py-8 text-right">
                            <p className="text-xl font-black italic text-white/80">
                                {activeTab === "points" 
                                    ? (user.solved_count || 0) 
                                    : activeTab === "solved" 
                                        ? (user.points || 0).toLocaleString() 
                                        : user.created_at ? new Date(user.created_at).toLocaleDateString() : "---"}
                            </p>
                          </td>
                          <td className="px-10 py-8 text-right">
                            <p className="text-2xl font-black italic tracking-tighter text-yellow-500/80 group-hover:text-yellow-500 transition-colors">
                                {activeTab === "points" 
                                    ? (user.points || 0).toLocaleString() 
                                    : activeTab === "solved" 
                                        ? (user.solved_count || 0) 
                                        : formatPersistence(getPersistenceScore(user))}
                            </p>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                    {filteredRest.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-32 text-center">
                          <AlertCircle className="w-12 h-12 text-white/10 mx-auto mb-4" />
                          <p className="font-mono text-sm text-white/20 uppercase tracking-[0.3em]">No operatives found matching search</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
