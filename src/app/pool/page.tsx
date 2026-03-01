"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Lock, 
  Coins, 
  Target, 
  Flame, 
  Trophy, 
  Timer, 
  TrendingUp, 
  Zap,
  Info
} from "lucide-react";

export default function PredictionPoolPage() {
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

  const categories = [
    {
      id: "next",
      title: "Solve Next Problem",
      description: "Predict if you will solve your next attempted problem within the time limit.",
      icon: <Target className="w-6 h-6 text-[#FFC72C]" />,
      odds: "1.5x"
    },
    {
      id: "all",
      title: "Solve All Today",
      description: "Commit to clearing all 5 problems in your current track today.",
      icon: <Zap className="w-6 h-6 text-[#FFC72C]" />,
      odds: "3.2x"
    },
    {
      id: "streak",
      title: "Stay on Track",
      description: "Maintain a perfect 7-day solve streak starting from today.",
      icon: <Flame className="w-6 h-6 text-[#FFC72C]" />,
      odds: "5.0x"
    }
  ];

  return (
    <div className="min-h-screen bg-[#111111] text-white selection:bg-[#FFC72C] selection:text-black relative overflow-hidden">
      
      {/* LOCKED OVERLAY - ULTRA TRANSPARENT */}
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#111111]/20 backdrop-blur-[1px]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center p-10 rounded-3xl border border-white/20 bg-[#1a1a1a]/40 backdrop-blur-md shadow-2xl text-center max-w-sm mx-6"
        >
          <div className="bg-[#FFC72C]/10 p-5 rounded-full mb-6 border border-[#FFC72C]/30 shadow-[0_0_30px_rgba(255,199,44,0.1)]">
            <Lock className="w-10 h-10 text-[#FFC72C]" />
          </div>
          <h2 className="text-xl font-black uppercase italic tracking-tighter mb-2">
            Pool <span className="text-[#FFC72C]">Locked</span>
          </h2>
          <p className="text-white/60 font-mono text-[10px] uppercase tracking-widest mb-6">
            Objective Selection Restricted
          </p>
          
          <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl w-full">
            <div className="flex items-center justify-center gap-3 text-[#FFC72C] font-black text-xl font-mono italic">
              <Timer className="w-4 h-4" />
              {countdown}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 pb-32">
        {/* Header */}
        <div className="flex flex-col items-center mb-16">
          <motion.div 
            animate={{ 
              boxShadow: ["0 0 20px rgba(255,199,44,0.1)", "0 0 40px rgba(255,199,44,0.2)", "0 0 20px rgba(255,199,44,0.1)"]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="relative w-64 h-64 flex items-center justify-center rounded-full bg-white/[0.02] border border-white/5"
          >
            {/* Spinning Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#FFC72C]/30 animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-4 rounded-full border border-white/5" />
            
            <div className="text-center z-10">
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.3em] mb-1">Current Pool</p>
              <h3 className="text-4xl font-black text-white italic tracking-tighter">24,500</h3>
              <p className="text-[#FFC72C] font-black text-sm uppercase italic">Points</p>
              
              <div className="mt-4 flex items-center justify-center gap-1 text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                +12% vs Yesterday
              </div>
            </div>
          </motion.div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {categories.map((cat) => (
            <motion.div 
              key={cat.id}
              className="group p-8 rounded-2xl border border-white/5 bg-white/[0.03] relative overflow-hidden transition-all"
            >
              <div className="mb-6 flex justify-between items-start">
                <div className="p-3 rounded-xl bg-white/5 transition-colors">
                  {cat.icon}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Payout</p>
                  <p className="text-[#FFC72C] font-black italic">{cat.odds}</p>
                </div>
              </div>
              
              <h4 className="text-lg font-bold text-white mb-2 uppercase tracking-tight">{cat.title}</h4>
              <p className="text-xs text-white/40 leading-relaxed font-medium mb-8">
                {cat.description}
              </p>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-white/10 flex items-center justify-center transition-colors">
                  <div className="w-2 h-2 rounded-full bg-white/10 transition-colors" />
                </div>
                <span className="text-[10px] font-bold text-white/20 transition-colors uppercase">Select Objective</span>
              </div>

              {/* Decorative gradient corner */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#FFC72C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>

        {/* Info Card */}
        <div className="bg-[#FFC72C]/5 border border-[#FFC72C]/10 p-6 rounded-2xl flex gap-4 items-start max-w-2xl mx-auto">
          <Info className="w-5 h-5 text-[#FFC72C] shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-bold text-white uppercase mb-1">How it works</h5>
            <p className="text-xs text-white/50 leading-relaxed">
              Place bets using your hard-earned points. If you complete the objective, you win points based on the payout multiplier. If you fail, the points are added back to the community pool for the final prize distribution.
            </p>
          </div>
        </div>
      </div>

      {/* BETTING CONSOLE (FIXED FOOTER - DISABLED) */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] bg-[#111111]/80 backdrop-blur-xl border-t border-white/10 p-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 opacity-50">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-[#FFC72C]/10 border border-[#FFC72C]/20">
              <Coins className="w-6 h-6 text-[#FFC72C]" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">Available Balance</p>
              <p className="text-xl font-black text-white italic tracking-tighter">
                150 <span className="text-[#FFC72C] text-sm uppercase">pts</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <input 
                type="number" 
                placeholder="BET AMOUNT"
                disabled
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none cursor-not-allowed"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20 uppercase italic">pts</span>
            </div>
            <button 
              disabled
              className="px-8 py-3 bg-[#FFC72C]/30 text-black/40 font-black uppercase italic rounded-xl cursor-not-allowed text-sm flex items-center gap-2 whitespace-nowrap"
            >
              <Trophy className="w-4 h-4" />
              Place Bet
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FFC72C]/5 blur-[150px] rounded-full" />
      </div>
    </div>
  );
}
