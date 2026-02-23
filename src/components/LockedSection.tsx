"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface TimeLeft {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

interface LockedSectionProps {
  title: string;
}

export default function LockedSection({ title }: LockedSectionProps) {
  const targetDate = "2026-03-30T00:00:00";

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

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

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
