"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, 
  Coins, 
  Target, 
  Flame, 
  Trophy, 
  Timer, 
  TrendingUp, 
  Zap,
  Info,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import LockedSection from "@/components/LockedSection";

export default function PredictionPoolPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [selectedPool, setSelectedPool] = useState<"daily_all_clear" | "ironman_streak" | "next_problem" | null>(null);

  // Fetch Pool Stats
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["wagerStats", session?.user?.email],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${baseUrl}/api/wagers/stats?user_email=${session?.user?.email}`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    enabled: !!session?.user?.email,
    refetchInterval: 5000,
  });

  // Fetch User Profile
  const { data: profile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await fetch("/api/user/profile");
      return res.json();
    },
    enabled: !!session?.user?.email,
  });

  // Join Wager Mutation
  const joinMutation = useMutation({
    mutationFn: async (payload: any) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${baseUrl}/api/wagers/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to join pool");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wagerStats"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setSelectedPool(null);
      alert("Bet placed successfully! Good luck, Hacker.");
    },
    onError: (error: Error) => {
      alert(error.message);
    }
  });

  const handlePlaceBet = () => {
    if (!selectedPool) return;
    if (betAmount > (profile?.points || 0)) {
        alert("Insufficient points!");
        return;
    }

    joinMutation.mutate({
      user_email: session?.user?.email,
      amount: betAmount,
      prediction_type: selectedPool
    });
  };

  const categories = [
    {
      id: "next_problem",
      title: "Quick Solve",
      description: "Predict if you will solve at least ONE problem during today's active stage.",
      icon: <Target className="w-6 h-6 text-[#FFC72C]" />,
      stats: stats?.next_problem,
      isJoined: stats?.next_problem?.is_joined
    },
    {
      id: "daily_all_clear",
      title: "Daily All-Clear",
      description: "Predict if you will solve all 5 problems for today's active stage.",
      icon: <Zap className="w-6 h-6 text-[#FFC72C]" />,
      stats: stats?.daily,
      isJoined: stats?.daily?.is_joined
    },
    {
      id: "ironman_streak",
      title: "Ironman Streak",
      description: "One-time bet: Solve at least 1 problem every single day of the event.",
      icon: <Flame className="w-6 h-6 text-[#FFC72C]" />,
      stats: stats?.ironman,
      isJoined: stats?.ironman?.is_joined
    }
  ];

  const calculatePotentialPayout = () => {
    if (!selectedPool || !stats) return 0;
    
    let pool;
    let fee = 0.95;

    if (selectedPool === "daily_all_clear") pool = stats.daily;
    else if (selectedPool === "ironman_streak") pool = stats.ironman;
    else if (selectedPool === "next_problem") {
        pool = stats.next_problem;
        fee = 0.85; // 15% platform fee for Quick Solve
    }

    if (!pool) return 0;
    
    const currentPot = pool.total_pot || 0;
    const currentParticipants = pool.participant_count || 0;
    
    return Math.floor((currentPot + betAmount) / (currentParticipants + 1) * fee);
  };

  const totalCommunityPot = (stats?.daily?.total_pot || 0) + (stats?.ironman?.total_pot || 0) + (stats?.next_problem?.total_pot || 0);

  return (
    <div className="min-h-screen bg-[#111111] text-white selection:bg-[#FFC72C] selection:text-black relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-6 py-12 pb-48">
        
        {/* Header Section - Triple Pools */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 mb-16">
          {/* Quick Solve Pool Display */}
          <div className="flex flex-col items-center">
            <motion.div 
              animate={{ boxShadow: ["0 0 20px rgba(255,199,44,0.02)", "0 0 40px rgba(255,199,44,0.1)", "0 0 20px rgba(255,199,44,0.02)"] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
              className="relative w-56 h-56 flex items-center justify-center rounded-full bg-white/[0.01] border border-white/5"
            >
              <div className="absolute inset-0 rounded-full border border-dashed border-[#FFC72C]/10 animate-[spin_35s_linear_infinite]" />
              <div className="text-center z-10">
                <p className="text-[9px] font-mono text-white/30 uppercase tracking-[0.3em] mb-1">Quick Solve</p>
                <h3 className="text-4xl font-black text-white italic tracking-tighter">
                  {isStatsLoading ? "---" : (stats?.next_problem?.total_pot || 0).toLocaleString()}
                </h3>
                <p className="text-[#FFC72C]/60 font-black text-[10px] uppercase italic">Current Pot</p>
              </div>
            </motion.div>
          </div>

          <div className="hidden lg:flex flex-col items-center opacity-20">
            <div className="h-16 w-[1px] bg-gradient-to-b from-transparent via-[#FFC72C] to-transparent" />
            <span className="font-mono text-[10px] my-2">VS</span>
            <div className="h-16 w-[1px] bg-gradient-to-b from-transparent via-[#FFC72C] to-transparent" />
          </div>

          {/* Daily Pool Display */}
          <div className="flex flex-col items-center">
            <motion.div 
              animate={{ boxShadow: ["0 0 20px rgba(255,199,44,0.02)", "0 0 40px rgba(255,199,44,0.1)", "0 0 20px rgba(255,199,44,0.02)"] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="relative w-56 h-56 flex items-center justify-center rounded-full bg-white/[0.01] border border-white/5"
            >
              <div className="absolute inset-0 rounded-full border border-dashed border-[#FFC72C]/10 animate-[spin_30s_linear_infinite_reverse]" />
              <div className="text-center z-10">
                <p className="text-[9px] font-mono text-white/30 uppercase tracking-[0.3em] mb-1">Daily Pool</p>
                <h3 className="text-4xl font-black text-white italic tracking-tighter">
                  {isStatsLoading ? "---" : (stats?.daily?.total_pot || 0).toLocaleString()}
                </h3>
                <p className="text-[#FFC72C]/60 font-black text-[10px] uppercase italic">Current Pot</p>
              </div>
            </motion.div>
          </div>

          <div className="hidden lg:flex flex-col items-center opacity-20">
            <div className="h-16 w-[1px] bg-gradient-to-b from-transparent via-[#FFC72C] to-transparent" />
            <span className="font-mono text-[10px] my-2">VS</span>
            <div className="h-16 w-[1px] bg-gradient-to-b from-transparent via-[#FFC72C] to-transparent" />
          </div>

          {/* Ironman Pool Display */}
          <div className="flex flex-col items-center">
            <motion.div 
              animate={{ boxShadow: ["0 0 20px rgba(255,199,44,0.02)", "0 0 40px rgba(255,199,44,0.1)", "0 0 20px rgba(255,199,44,0.02)"] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              className="relative w-56 h-56 flex items-center justify-center rounded-full bg-white/[0.01] border border-white/5"
            >
              <div className="absolute inset-0 rounded-full border border-dashed border-[#FFC72C]/10 animate-[spin_25s_linear_infinite]" />
              <div className="text-center z-10">
                <p className="text-[9px] font-mono text-white/30 uppercase tracking-[0.3em] mb-1">Ironman Pool</p>
                <h3 className="text-4xl font-black text-white italic tracking-tighter">
                  {isStatsLoading ? "---" : (stats?.ironman?.total_pot || 0).toLocaleString()}
                </h3>
                <p className="text-[#FFC72C]/60 font-black text-[10px] uppercase italic">Current Pot</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Total Summary Mini-Bar */}
        <div className="flex justify-center mb-16">
          <div className="px-6 py-2 bg-white/[0.02] border border-white/5 rounded-full flex items-center gap-4">
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Global Community Stake:</span>
            <span className="text-sm font-black text-[#FFC72C] italic">{totalCommunityPot.toLocaleString()} PTS</span>
          </div>
        </div>

        {/* Betting Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {categories.map((cat) => (
            <motion.div 
              key={cat.id}
              onClick={() => {
                if (cat.isJoined) return;
                setSelectedPool(selectedPool === cat.id ? null : cat.id as any);
              }}
              className={`group p-8 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                selectedPool === cat.id 
                  ? "bg-[#FFC72C]/10 border-[#FFC72C]/50 shadow-[0_0_30px_rgba(255,199,44,0.1)]" 
                  : cat.isJoined
                    ? "bg-green-500/5 border-green-500/20 opacity-80 cursor-default"
                    : "bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
              }`}
            >
              <div className="mb-8 flex justify-between items-start">
                <div className={`p-4 rounded-2xl ${selectedPool === cat.id ? "bg-[#FFC72C]/20" : "bg-white/5"}`}>
                  {cat.icon}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Live Pot</p>
                  <p className="text-2xl font-black text-[#FFC72C] italic">{(cat.stats?.total_pot || 0).toLocaleString()}</p>
                </div>
              </div>
              
              <h4 className="text-xl font-black text-white mb-2 uppercase italic tracking-tight">{cat.title}</h4>
              <p className="text-sm text-white/50 leading-relaxed mb-8">
                {cat.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-white/20" />
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                        {(cat.stats?.participant_count || 0)} Hackers Joined
                    </span>
                </div>
                {cat.isJoined ? (
                    <div className="flex items-center gap-2 text-green-400 font-black text-[10px] uppercase italic">
                        <CheckCircle2 className="w-4 h-4" />
                        Active Wager
                    </div>
                ) : (
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPool === cat.id ? "border-[#FFC72C] bg-[#FFC72C]" : "border-white/10"}`}>
                        {selectedPool === cat.id && <div className="w-2 h-2 rounded-full bg-black" />}
                    </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info & Active Wagers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#FFC72C]/5 border border-[#FFC72C]/10 p-8 rounded-3xl flex gap-6 items-start">
                    <Info className="w-6 h-6 text-[#FFC72C] shrink-0 mt-1" />
                    <div>
                        <h5 className="text-lg font-black text-white uppercase italic mb-2">The Mechanics</h5>
                        <ul className="text-sm text-white/50 space-y-3 font-medium">
                            <li className="flex gap-2">
                                <span className="text-[#FFC72C] font-bold">01.</span>
                                Stake your points on your own performance. Failed bets return to the Community Pot.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#FFC72C] font-bold">02.</span>
                                Winners split the total pot of their category equally. 
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#FFC72C] font-bold">03.</span>
                                A 5% platform fee is deducted from the pot for event hardware & prizes. (15% for Quick Solve)
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Active Wagers List */}
                {stats?.user_wagers?.length > 0 && (
                    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl">
                        <h5 className="text-sm font-mono text-white/40 uppercase tracking-[0.3em] mb-6">Your Active Wagers</h5>
                        <div className="space-y-4">
                            {stats.user_wagers.map((wager: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-[#FFC72C]/10 rounded-lg">
                                            <Target className="w-4 h-4 text-[#FFC72C]" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white uppercase">{wager.prediction_type?.replace(/_/g, ' ')}</p>
                                            <p className="text-[10px] text-white/30 font-mono">{wager.pool_id}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-[#FFC72C]">{wager.amount_bet} PTS</p>
                                        <p className="text-[10px] text-green-400 font-bold uppercase italic">In Play</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl h-fit">
                 <h5 className="text-sm font-mono text-white/40 uppercase tracking-[0.3em] mb-6">Pool Insights</h5>
                 <div className="space-y-6">
                    <div>
                        <p className="text-[10px] text-white/30 uppercase mb-1">Largest Payout Target</p>
                        <p className="text-lg font-black text-white italic tracking-tighter">IRONMAN STREAK</p>
                    </div>
                    <div className="p-4 bg-[#FFC72C]/5 rounded-2xl border border-[#FFC72C]/10">
                         <p className="text-[10px] text-[#FFC72C] font-bold uppercase mb-2">Platform Stability</p>
                         <div className="flex items-center gap-2">
                            <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: "98%" }}
                                    className="h-full bg-[#FFC72C]"
                                />
                            </div>
                            <span className="text-[10px] font-mono text-white/50">98%</span>
                         </div>
                    </div>
                 </div>
            </div>
        </div>
      </div>

      {/* BETTING CONSOLE (FIXED FOOTER) */}
      <AnimatePresence>
        {selectedPool && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-[60] bg-[#111111]/90 backdrop-blur-2xl border-t border-[#FFC72C]/20 p-8 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-full bg-[#FFC72C]/10 border border-[#FFC72C]/20">
                  <Coins className="w-8 h-8 text-[#FFC72C]" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">Available Balance</p>
                  <p className="text-3xl font-black text-white italic tracking-tighter">
                    {profile?.points || 0} <span className="text-[#FFC72C] text-sm uppercase">pts</span>
                  </p>
                </div>
              </div>

              <div className="flex-1 max-w-md w-full">
                 <div className="flex justify-between text-[10px] font-mono text-white/30 uppercase mb-2">
                    <span>Wager Amount</span>
                    <span>Potential Payout: ~{calculatePotentialPayout()} pts</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <input 
                            type="number"
                            min="1"
                            value={betAmount}
                            onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#FFC72C]/50 transition-colors"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20 uppercase italic">pts</span>
                    </div>
                    <button 
                        onClick={() => setBetAmount(profile?.points || 0)}
                        className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95"
                    >
                        MAX
                    </button>
                 </div>
                 <div className="flex justify-between mt-2 font-mono text-[10px] text-white/20">
                    <span>MIN: 1 PTS</span>
                    <span className="text-[#FFC72C] font-black uppercase italic">Current Bet: {betAmount} PTS</span>
                 </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <button 
                  onClick={() => setSelectedPool(null)}
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-bold uppercase italic rounded-2xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePlaceBet}
                  disabled={joinMutation.isPending}
                  className="px-10 py-4 bg-[#FFC72C] hover:bg-[#FFC72C]/90 text-black font-black uppercase italic rounded-2xl text-sm flex items-center gap-2 whitespace-nowrap transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {joinMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trophy className="w-4 h-4" />
                  )}
                  Confirm Wager
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FFC72C]/5 blur-[150px] rounded-full" />
      </div>
    </div>
  );
}
