"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

interface LivePointsDisplayProps {
  initialPoints: number;
  initialIsEnrolled: boolean;
}

export default function LivePointsDisplay({ initialPoints, initialIsEnrolled }: LivePointsDisplayProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await fetch("/api/user/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    refetchOnWindowFocus: true,
    staleTime: 0,
    initialData: { points: initialPoints, isEnrolled: initialIsEnrolled },
  });

  const points = data?.points ?? initialPoints;
  const isEnrolled = data?.isEnrolled ?? initialIsEnrolled;

  return (
    <div className="p-5 rounded-md bg-zinc-950/50 border border-amber-500/20 text-left h-full">
      <p className="text-xs font-mono uppercase tracking-widest text-amber-500 mb-2">Total Score</p>
      {isEnrolled ? (
        <p className={`font-black text-3xl text-amber-400 italic tracking-tighter transition-opacity duration-300 ${isLoading ? "opacity-50" : "opacity-100"}`}>
          {points}
        </p>
      ) : (
        <Link 
          href="/enroll" 
          className="font-semibold text-amber-500 hover:text-amber-400 transition-colors animate-pulse hover:animate-none text-sm block"
        >
          Enroll to claim 5 free points &gt;
        </Link>
      )}
    </div>
  );
}
