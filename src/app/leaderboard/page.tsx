"use client";

import { Trophy, Terminal, Clock, Zap, Shield, Crown, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

// --- Types ---
interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar?: string;
  value: string | number;
  subValue?: string;
}

// --- Mock Data ---
const TOP_EARNERS: LeaderboardEntry[] = [
  { id: "1", rank: 1, name: "null_pointer", value: 12500 },
  { id: "2", rank: 2, name: "cyber_shark", value: 11200 },
  { id: "3", rank: 3, name: "bit_crusher", value: 10850 },
  { id: "4", rank: 4, name: "hex_wizard", value: 9400 },
  { id: "5", rank: 5, name: "stack_overflow", value: 8900 },
];

const TOP_SOLVERS: LeaderboardEntry[] = [
  { id: "1", rank: 1, name: "algo_master", value: 142 },
  { id: "2", rank: 2, name: "logic_bomb", value: 138 },
  { id: "3", rank: 3, name: "pythonic_way", value: 124 },
  { id: "4", rank: 4, name: "cpp_warrior", value: 115 },
  { id: "5", rank: 5, name: "js_ninja", value: 102 },
];

const MOST_DEDICATED: LeaderboardEntry[] = [
  { id: "1", rank: 1, name: "system_root", value: "42 Days", subValue: "520 hrs" },
  { id: "2", rank: 2, name: "void_walker", value: "38 Days", subValue: "485 hrs" },
  { id: "3", rank: 3, name: "kernel_panic", value: "35 Days", subValue: "410 hrs" },
  { id: "4", rank: 4, name: "byte_knight", value: "28 Days", subValue: "350 hrs" },
  { id: "5", rank: 5, name: "ghost_shell", value: "24 Days", subValue: "290 hrs" },
];

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
  unit 
}: { 
  title: string; 
  icon: LucideIcon; 
  data: LeaderboardEntry[];
  unit: string;
}) => {
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm flex flex-col">
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
        {data.map((entry, idx) => (
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
                  <span className="text-[10px] text-white/30 font-mono uppercase tracking-tighter">
                    Total: {entry.subValue}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right relative z-10">
              <div className={`font-mono font-bold text-lg ${
                entry.rank === 1 ? "text-yellow-500" : "text-white/90"
              }`}>
                {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
              </div>
              <div className="text-[10px] text-white/30 uppercase font-mono tracking-widest">{unit}</div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="p-3 border-t border-white/5 bg-black/20 text-center">
        <button className="text-[10px] font-mono text-yellow-500/50 hover:text-yellow-500 transition-colors uppercase tracking-widest">
          View Full Directory
        </button>
      </div>
    </div>
  );
};

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white pt-24 pb-12 px-6">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-yellow-500 mb-1">
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
            data={TOP_EARNERS} 
            unit="Credits"
          />
          <LeaderboardCard 
            title="Top Solvers" 
            icon={Terminal} 
            data={TOP_SOLVERS} 
            unit="Problems"
          />
          <LeaderboardCard 
            title="Most Dedicated" 
            icon={Clock} 
            data={MOST_DEDICATED} 
            unit="Streak"
          />
        </div>

        {/* Footer Stats / Global Feed */}
        <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest">Global Activity Feed</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { user: "null_pointer", action: "solved Hard problem", time: "2m ago" },
              { user: "cyber_shark", action: "earned 500 credits", time: "5m ago" },
              { user: "logic_bomb", action: "started 14 day streak", time: "12m ago" },
              { user: "hex_wizard", action: "uploaded new exploit", time: "15m ago" },
            ].map((activity, i) => (
              <div key={i} className="flex flex-col p-3 bg-black/40 rounded-xl border border-white/5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-yellow-500 font-bold text-xs truncate">{activity.user}</span>
                  <span className="text-[10px] text-white/20 font-mono">{activity.time}</span>
                </div>
                <div className="text-[11px] text-white/50 font-mono lowercase">{activity.action}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
