"use client";

import React from "react";
import { motion } from "framer-motion";
import { Flame, Lock, Trophy } from "lucide-react";

interface StreakTrackerProps {
  streakMap?: Record<string, boolean>;
  currentStage?: string;
  isIronman?: boolean;
}

export const StreakTracker: React.FC<StreakTrackerProps> = ({ 
  streakMap = {}, 
  currentStage = "day_1",
  isIronman = false 
}) => {
  const days = Array.from({ length: 7 }, (_, i) => `day_${i + 1}`);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h5 className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">7-Day Ironman Streak</h5>
        {isIronman && (
          <div className="flex items-center gap-1.5 text-[#FFC72C] animate-pulse">
            <Trophy className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase italic">Ironman Achieved</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {days.map((day, idx) => {
          const isCompleted = streakMap[day];
          const isCurrent = day === currentStage;
          const isPast = !isCompleted && idx < days.indexOf(currentStage);

          return (
            <motion.div
              key={day}
              initial={isCompleted ? { scale: 0.8, opacity: 0 } : {}}
              animate={isCompleted ? { scale: 1, opacity: 1 } : {}}
              className={`relative flex-1 aspect-square rounded-xl border flex items-center justify-center transition-all ${
                isCompleted 
                  ? "bg-[#FFC72C]/20 border-[#FFC72C]/40 shadow-[0_0_15px_rgba(255,199,44,0.1)]" 
                  : isCurrent
                    ? "bg-white/5 border-[#FFC72C]/20 border-dashed animate-pulse"
                    : isPast
                      ? "bg-red-500/5 border-red-500/20"
                      : "bg-white/[0.02] border-white/5"
              }`}
            >
              {isCompleted ? (
                <Flame className="w-5 h-5 text-[#FFC72C] fill-[#FFC72C]" />
              ) : isPast ? (
                <div className="w-1.5 h-1.5 rounded-full bg-red-500/40" />
              ) : (
                <Lock className={`w-4 h-4 ${isCurrent ? "text-white/20" : "text-white/5"}`} />
              )}
              
              {/* Day Number Tooltip-like indicator */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#1a1a1a] rounded-full border border-white/10 flex items-center justify-center text-[8px] font-mono text-white/40">
                {idx + 1}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
