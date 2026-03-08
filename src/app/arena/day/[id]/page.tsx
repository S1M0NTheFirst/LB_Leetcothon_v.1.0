"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trophy, Loader2 } from "lucide-react";
import { useStageProblems } from "@/hooks/useDailyProblems";
import { ProblemCard, SkeletonCard } from "@/components/ProblemCard";
import Link from "next/link";

export default function DayArenaPage() {
  const params = useParams();
  const router = useRouter();
  const stageId = params.id as string;
  const [level, setLevel] = useState<"beginner" | "experienced">("beginner");

  // Load level from localStorage on mount
  useEffect(() => {
    const savedLevel = localStorage.getItem("arena_level") as "beginner" | "experienced";
    if (savedLevel && (savedLevel === "beginner" || savedLevel === "experienced")) {
      setLevel(savedLevel);
    }
  }, []);

  const { data, isLoading, isError, error } = useStageProblems(stageId, level);
  const problems = data?.problems;

  const handleLevelChange = (newLevel: "beginner" | "experienced") => {
    setLevel(newLevel);
    localStorage.setItem("arena_level", newLevel);
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-red-500 mb-4">ACCESS DENIED</h1>
        <p className="text-white/60 mb-8">{(error as any)?.message || "This stage is not yet unlocked."}</p>
        <Link href="/arena" className="flex items-center gap-2 text-[#FFC72C] hover:underline">
          <ArrowLeft className="w-4 h-4" /> BACK TO ARENA
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white selection:bg-[#FFC72C] selection:text-black">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="border-l-4 border-[#FFC72C] pl-6">
            <Link href="/arena" className="flex items-center gap-2 text-white/40 hover:text-[#FFC72C] transition-colors text-xs font-mono uppercase mb-4">
              <ArrowLeft className="w-3 h-3" /> BACK TO ARENA
            </Link>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
              {stageId.replace("_", " ")} <span className="text-[#FFC72C]">ARENA</span>
            </h1>
          </div>

          {/* Level Toggle */}
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => handleLevelChange("beginner")}
              className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all ${
                level === "beginner" ? "bg-[#FFC72C] text-black" : "text-white/40 hover:text-white"
              }`}
            >
              Beginner
            </button>
            <button
              onClick={() => handleLevelChange("experienced")}
              className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all ${
                level === "experienced" ? "bg-[#FFC72C] text-black" : "text-white/40 hover:text-white"
              }`}
            >
              Experienced
            </button>
          </div>
        </div>

        {/* Problems Grid */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <Trophy className="text-[#FFC72C] w-6 h-6" />
            <h2 className="text-xl font-bold uppercase tracking-widest">Today&apos;s Challenges</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[#FFC72C]/50 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            ) : problems && problems.length > 0 ? (
              problems.map((prob, idx) => (
                <ProblemCard 
                  key={prob.id} 
                  id={prob.id}
                  title={prob.title}
                  difficulty={prob.difficulty}
                  points={prob.points}
                  isBonus={idx === 4}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                <p className="text-white/40 font-mono uppercase tracking-widest">No challenges available for this stage yet.</p>
              </div>
            )}
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
