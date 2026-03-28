"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface TimeLeft {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

interface LockedSectionProps {
  title: string;
  targetDate?: string;
  variant?: "full" | "overlay";
}

export default function LockedSection({ 
  title, 
  targetDate = "2026-03-30T00:00:00", 
  variant = "full" 
}: LockedSectionProps) {
  const calculateTimeLeft = useCallback(() => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft: TimeLeft = {
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
        minutes: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
        seconds: Math.floor((difference / 1000) % 60).toString().padStart(2, '0'),
      };
    }
    return timeLeft;
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining.days === "00" && remaining.hours === "00" && remaining.minutes === "00" && remaining.seconds === "00") {
        setIsLive(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  if (isLive) return null;

  if (variant === "overlay") {
    return (
      <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-[2px] border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="text-center p-8 space-y-6 max-w-lg bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex p-6 rounded-full bg-red-500/10 border border-red-500/20 mb-4"
          >
            <Lock className="w-12 h-12 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          </motion.div>
          
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter">
              {title} IS <span className="text-red-500">LOCKED</span>
            </h2>
            <p className="text-white/40 font-mono text-xs uppercase tracking-[0.3em]">
              Protocol initiates in:
            </p>
          </div>

          <div className="flex justify-center gap-4 font-mono">
            {[
              { label: "D", value: timeLeft.days },
              { label: "H", value: timeLeft.hours },
              { label: "M", value: timeLeft.minutes },
              { label: "S", value: timeLeft.seconds },
            ].map((unit) => (
              <div key={unit.label} className="flex flex-col items-center min-w-[50px]">
                <span className="text-3xl font-bold text-red-500">
                  {unit.value}
                </span>
                <span className="text-[8px] text-white/20 uppercase tracking-widest font-bold">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-red-400/40 font-mono uppercase tracking-widest animate-pulse border-t border-red-500/10 pt-6 mt-6">
            Authorized access only during event window
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#0a0a0a] flex items-center justify-center overflow-hidden px-6 pt-16">
      {/* Background Red X watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <span className="text-[60vh] md:text-[80vh] font-black text-red-600/10 leading-none">
          X
        </span>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 text-center space-y-8 max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl md:text-5xl font-black tracking-[0.2em] text-red-500 uppercase drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            {title} IS CURRENTLY LOCKED
          </h1>
          <p className="text-white/40 font-mono text-sm md:text-base uppercase tracking-[0.3em]">
            Protocol initiates in:
          </p>
        </motion.div>

        {/* Digital Countdown */}
        <div className="flex justify-center gap-4 md:gap-8 font-mono">
          {[
            { label: "DD", value: timeLeft.days },
            { label: "HH", value: timeLeft.hours },
            { label: "MM", value: timeLeft.minutes },
            { label: "SS", value: timeLeft.seconds },
          ].map((unit, index, array) => (
            <div key={unit.label} className="flex items-center gap-4 md:gap-8">
              <div className="flex flex-col items-center">
                <span className="text-4xl md:text-7xl font-bold text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  {unit.value}
                </span>
                <span className="text-[10px] md:text-xs text-white/20 mt-2 uppercase tracking-widest font-bold">
                  {unit.label}
                </span>
              </div>
              {index < array.length - 1 && (
                <span className="text-2xl md:text-5xl font-bold text-red-500/30 self-start mt-2">
                  :
                </span>
              )}
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-12"
        >
          <div className="inline-block px-6 py-2 border border-red-500/20 bg-red-500/5 rounded-full">
            <p className="text-red-400/60 text-xs font-mono uppercase tracking-widest animate-pulse">
              System access restricted until authorized window
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
