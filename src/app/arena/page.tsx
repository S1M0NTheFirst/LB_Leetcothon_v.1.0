"use client";

import { useState, useEffect } from "react";
import { Play, Trophy, Cpu, Activity } from "lucide-react";
import { useDailyProblems } from "@/hooks/useDailyProblems";
import Link from "next/link";
import { ProblemCard, SkeletonCard } from "@/components/ProblemCard";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

interface EventRowProps {
  day: number;
  topic: string;
}

const EventRow = ({ day, topic }: EventRowProps) => {
  return (
    <div className={`group relative flex flex-col md:flex-row items-center justify-between p-6 rounded-xl border transition-all duration-500 border-[#FFC72C]/30 bg-[#FFC72C]/5 shadow-[0_0_30px_rgba(255,199,44,0.05)]`}>
      <div className="flex items-center gap-6 mb-4 md:mb-0">
        <div className={`w-12 h-12 rounded-full border flex items-center justify-center text-xl font-black border-[#FFC72C] text-[#FFC72C]`}>
          0{day}
        </div>
        <div>
          <h4 className={`font-bold uppercase tracking-widest text-white`}>
            Main Event: Day {day}
          </h4>
          <p className="text-white/20 text-xs font-mono uppercase tracking-tighter flex items-center gap-2">
            <span className="text-[#FFC72C] animate-pulse flex items-center gap-2">
              <Activity className="w-3 h-3" /> LIVE NOW - {topic}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end px-6 border-r border-white/5">
          <span className="text-[10px] text-white/20 uppercase tracking-widest font-mono">Status</span>
          <span className={`text-xs font-bold uppercase text-[#FFC72C]`}>
            Unlocked
          </span>
        </div>
        <Link 
          href={`/arena/day/day_${day}`}
          className={`px-8 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 bg-[#FFC72C] text-black hover:scale-105 shadow-[0_0_15px_rgba(255,199,44,0.3)]`}
        >
          <Play className="w-4 h-4" /> ENTER ARENA
        </Link>
      </div>
    </div>
  );
};

const DAY_TOPICS: Record<string, string> = {
  "day_1": "Arrays & Hashing",
  "day_2": "Two Pointers & Sliding Window",
  "day_3": "Stack & Queue",
  "day_4": "Binary Search & Math",
  "day_5": "Dynamic Programming I",
  "day_6": "Dynamic Programming II",
  "day_7": "Final Boss: Advanced Mix"
};

export default function ArenaPage() {
  const [hackersCoding, setHackersCoding] = useState(1);
  const [level, setLevel] = useState<"beginner" | "experienced">("beginner");
  const { data: session } = useSession();

  // Fetch User Profile
  const { data: profile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await fetch("/api/user/profile");
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!session?.user?.email,
  });

  const solvedProblems = profile?.solved_problems || [];

  // WebSocket for real-time coder count
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    if (!baseUrl) return;
    
    const wsUrl = baseUrl.replace(/^http/, "ws") + "/ws/live-coders";
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const count = parseInt(event.data);
      if (!isNaN(count)) {
        setHackersCoding(count);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  // Load level from localStorage on mount
  useEffect(() => {
    const savedLevel = localStorage.getItem("arena_level") as "beginner" | "experienced";
    if (savedLevel && (savedLevel === "beginner" || savedLevel === "experienced")) {
      setTimeout(() => setLevel(savedLevel), 0);
    }
  }, []);

  // Save level to localStorage when it changes
  const handleLevelChange = (newLevel: "beginner" | "experienced") => {
    setLevel(newLevel);
    localStorage.setItem("arena_level", newLevel);
  };

  const { data, isLoading, isFetching } = useDailyProblems(level);
  const problems = data?.problems;
  const currentTopic = data?.topic || "Warm-Up Playground";

  const mainEvents = [
    { day: 1, id: "day_1" },
    { day: 2, id: "day_2" },
    { day: 3, id: "day_3" },
    { day: 4, id: "day_4" },
    { day: 5, id: "day_5" },
    { day: 6, id: "day_6" },
    { day: 7, id: "day_7" },
  ];

  return (
    <div className="min-h-screen bg-[#111111] text-white selection:bg-[#FFC72C] selection:text-black">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 border-l-4 border-[#FFC72C] pl-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
              THE <span className="text-[#FFC72C]">ARENA</span>
            </h1>
            <p className="text-[#FFC72C] font-mono mt-2 uppercase tracking-widest text-sm font-bold">
              {currentTopic}
            </p>
          </div>

          {/* Live Activity Counter */}
          <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-xl">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping opacity-75" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Telemetry</span>
              <span className="text-sm font-mono font-bold uppercase tracking-wider text-white/80">
                <span className="text-green-400">{hackersCoding}</span> {hackersCoding === 1 ? "Live Hacker" : "Live Hackers"}
              </span>
            </div>
          </div>
        </div>

        {/* Playground Section */}
        <section className={`mb-20 transition-all duration-700`}>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
            <div className="flex items-center gap-4 flex-1">
              <Cpu className={`text-[#FFC72C] w-6 h-6`} />
              <h2 className={`text-xl font-bold uppercase tracking-widest`}>
                The Playground
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              
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

              <span className={`text-[10px] font-mono border px-2 py-1 rounded text-[#FFC72C] border-[#FFC72C]/20 animate-pulse`}>
                UNLOCKED
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
                  isBonus={idx === 4}
                  isSolved={solvedProblems.includes(prob.id)}
                />
              ))
            )}
          </div>
        </section>

        {/* Main Event Section */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <Trophy className={`text-[#FFC72C] w-6 h-6`} />
            <h2 className={`text-xl font-bold uppercase tracking-widest`}>
              Main Event
            </h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            <span className={`text-[10px] font-mono border px-2 py-1 rounded text-[#FFC72C] border-[#FFC72C]/20`}>
              ACTIVE
            </span>
          </div>

          <div className="space-y-4">
            {mainEvents.map((event) => (
              <EventRow 
                key={event.day} 
                day={event.day}
                topic={DAY_TOPICS[event.id] || ""}
              />
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
